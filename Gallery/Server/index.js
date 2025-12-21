const express = require("express");
const cors = require("cors");

const api = require("./addon/api");
const FileManager = require("./addon/file");

const config = require("./config.json");

const app = express();

if (config.server.cors) app.use(cors());

const fileManager = new FileManager({
  photosDir: "photos",
  thumbsDir: "thumbs",
  uploadsDir: "uploads"
});

app.use("/api", api(fileManager));
app.use("/media", express.static(config.paths.media));
app.use("/thumbs", express.static(config.paths.thumbs));

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});
