const express = require("express");
const { getTrack } = require("../controllers/tracksController");

const router = express.Router();

router.get("/:deezerId", getTrack);

module.exports = router;
