const express = require("express");
const multer = require("multer");
const config = require("../config.json");

module.exports = function api(fileManager) {
  const router = express.Router();

  const upload = multer({
    dest: "./tmp",
    limits: { fileSize: config.upload.maxFileSizeMB * 1024 * 1024 }
  });

  /* ---------- UPLOAD ---------- */
  router.post("/upload", upload.single("media"), async (req, res) => {
    try {
      const result = await fileManager.saveMedia(
        req.file.path,
        req.file.originalname,
        req.file.mimetype
      );
      res.json({ success: true, media: result });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  /* ---------- LIST ---------- */
  router.get("/media", async (req, res) => {
    try {
      const mediaData = await fileManager.listMedia();

      console.log(mediaData);

      res.json(mediaData || []);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ---------- DELETE ---------- */
  router.delete("/media/:name", (req, res) => {
    try {
      fileManager.deleteMedia(req.params.name);
      res.json({ success: true });
    } catch (e) {
      res.status(404).json({ success: false, error: e.message });
    }
  });

  /* ---------- STORAGE ---------- */
  router.get("/storage", (req, res) => {
    const { total, used, percent } = fileManager.getDiskUsage();
    const unit = config.storage.unit;
    
    res.json({
      total: (fileManager.convert(total, unit)).toFixed(2),
      used: (fileManager.convert(used, unit)).toFixed(2),
      percent: percent.toFixed(1),
      unit: unit
    });
  });

  return router;
};
