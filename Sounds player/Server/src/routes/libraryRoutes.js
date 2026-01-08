const express = require("express");
const {
  addFavorite,
  getFavorites,
  createPlaylist,
  addTrackToPlaylist,
} = require("../controllers/libraryController");

const router = express.Router();

// Favorite routes
router.post("/favorites", addFavorite);
router.get("/favorites", getFavorites);

// Playlist routes
router.post("/playlists", createPlaylist);
router.post("/playlists/:id/add", addTrackToPlaylist);

module.exports = router;
