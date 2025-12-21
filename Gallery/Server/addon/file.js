const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const config = require("../config.json");

ffmpeg.setFfmpegPath(ffmpegPath);

class FileManager {
  constructor() {
    this.paths = config.paths;
    this.hashAlgorithm = config.hash.algorithm;
    this.hashIndexFile = path.join(this.paths.media, "hashes.json");

    this._ensureDirs();
    this._loadHashIndex();
  }

  /* ------------------ INIT ------------------ */

  _ensureDirs() {
    Object.values(this.paths).forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  _loadHashIndex() {
    if (fs.existsSync(this.hashIndexFile)) {
      this.hashIndex = JSON.parse(fs.readFileSync(this.hashIndexFile, "utf8"));
    } else {
      this.hashIndex = {};
      this._saveHashIndex();
    }
  }

  _saveHashIndex() {
    fs.writeFileSync(this.hashIndexFile, JSON.stringify(this.hashIndex, null, 2));
  }

  /* ------------------ UTILS ------------------ */

  generateFileName(originalName) {
    return `${Date.now()}-${crypto.randomUUID()}${path.extname(originalName)}`;
  }

  computeHash(filePath) {
    return crypto
      .createHash(this.hashAlgorithm)
      .update(fs.readFileSync(filePath))
      .digest("hex");
  }

  getThumb(name) {
    return path.basename(name) + ".jpg";
  }

  getMediaPath(name, type) {
    return path.join(config.paths.media, name);
  }

  getThumb(name) {
    const ext = path.extname(name);
    const baseName = path.basename(name, ext);
    return `${baseName}.jpg`;
  }

  getCreatedAt(name, type) {
    try {
      const stats = fs.statSync(this.getMediaPath(name, type));
      return stats.birthtime;
    } catch {
      return null;
    }
  }

  async getDimensions(name, type) {
    const mediaPath = this.getMediaPath(name, type);
    try {
      if (type === "photo") {
        const meta = await sharp(mediaPath).metadata();
        return { width: meta.width, height: meta.height, format: meta.format };
      } else if (type === "video") {
        const meta = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(mediaPath, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
        const stream = meta.streams.find(s => s.width && s.height);
        return {
          width: stream?.width || null,
          height: stream?.height || null,
          format: meta.format.format_name
        };
      }
    } catch {
      return { width: null, height: null, format: null };
    }
  }

  async getFormat(name, type) {
    const dims = await this.getDimensions(name, type);
    return dims.format;
  }

  async getWidth(name, type) {
    const dims = await this.getDimensions(name, type);
    return dims.width;
  }

  async getHeight(name, type) {
    const dims = await this.getDimensions(name, type);
    return dims.height;
  }

  convert(n, unit) {
    let divisor = 1;
    switch(unit) {
      case "MB": divisor = 1024 ** 2; break;
      case "GB": divisor = 1024 ** 3; break;
      case "TB": divisor = 1024 ** 4; break;
    }
    return n / divisor;
  }

  /* ------------------ SAVE MEDIA ------------------ */

  async saveMedia(tempPath, originalName, mimeType) {
    const isImage = config.upload.allowedImages.includes(mimeType);
    const isVideo = config.upload.allowedVideos.includes(mimeType);

    if (!isImage && !isVideo) {
      fs.unlinkSync(tempPath);
      throw new Error("Type de fichier non autorisé");
    }

    const hash = this.computeHash(tempPath);
    if (this.hashIndex[hash]) {
      fs.unlinkSync(tempPath);
      throw new Error("Doublon détecté");
    }

    const fileName = this.generateFileName(originalName);
    const targetDir = this.paths.media;
    const mediaPath = path.join(targetDir, fileName);
    const thumbPath = path.join(this.paths.thumbs, this.getThumb(fileName));

    fs.renameSync(tempPath, mediaPath);

    if (isImage) {
      await sharp(mediaPath)
        .resize(config.thumbnails.image.width)
        .jpeg({ quality: config.thumbnails.image.quality })
        .toFile(thumbPath);
    } else {
      await new Promise((resolve, reject) => {
        ffmpeg(mediaPath)
          .screenshots({
            timestamps: [config.thumbnails.video.time],
            folder: this.paths.thumbs,
            filename: this.getThumb(fileName),
            size: `${config.thumbnails.video.width}x?`
          })
          .on("end", resolve)
          .on("error", reject);
      });
    }

    this.hashIndex[hash] = {
      name: fileName,
      type: isImage ? "photo" : "video",
      mime: mimeType,
      size: fs.statSync(mediaPath).size,
      date: Date.now()
    };

    this._saveHashIndex();

    return {
      name: fileName,
      type: isImage ? "photo" : "video",
      path: path.join("/media", m.name),
      thumb: path.join("/thumbs", this.getThumb(m.name))
    };
  }

  /* ------------------ LIST ------------------ */

  async listMedia() {
    const result = [];
    const medias = Object.values(this.hashIndex || {});
    
    if (medias.length === 0) return [];

    for (const m of medias) {
      const thumb = this.getThumb(m.name);

      result.push({
        name: m.name,
        type: m.type,
        size: m.size,
        date: m.date,
        path: path.join("/media", m.name),
        thumb: path.join("/thumbs", thumb),
        width: await this.getWidth(m.name, m.type),
        height: await this.getHeight(m.name, m.type),
        format: await this.getFormat(m.name, m.type),
        createdAt: this.getCreatedAt(m.name, m.type)
      });
    }
    return result;
  }

  /* ------------------ DELETE ------------------ */

  deleteMedia(fileName) {
    for (const hash in this.hashIndex) {
      const m = this.hashIndex[hash];
      if (m.name === fileName) {
        const dir = this.paths.media;
        fs.unlinkSync(path.join(dir, fileName));
        fs.unlinkSync(path.join(this.paths.thumbs, this.getThumb(fileName)));
        delete this.hashIndex[hash];
        this._saveHashIndex();
        return;
      }
    }
    throw new Error("Fichier introuvable");
  }

  /* ------------------ STORAGE ------------------ */

  getDiskUsage() {
    const stats = fs.statfsSync(this.paths.media);
    const total = stats.blocks * stats.bsize;
    const free = stats.bfree * stats.bsize;
    const used = total - free;

    return {
      total,
      used,
      percent: (used / total) * 100
    };
  }
}

module.exports = FileManager;
