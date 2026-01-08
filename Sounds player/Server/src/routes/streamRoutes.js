const express = require("express");
const { streamTrack } = require("../controllers/streamController");

const router = express.Router();

router.get("/:deezerId", streamTrack);

module.exports = router;
