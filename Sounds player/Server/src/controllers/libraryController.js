const prisma = require("../utils/prisma");

// Upsert a track and add it to user's favorites
exports.addFavorite = async (req, res) => {
  const { id: userId } = req.user;
  const { deezerId, title, artist, coverUrl } = req.body;

  if (!deezerId || !title || !artist || !coverUrl) {
    return res.status(400).json({ message: "Track metadata is required" });
  }

  try {
    const track = await prisma.track.upsert({
      where: { deezerId },
      update: {},
      create: { deezerId, title, artist, coverUrl },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        favorites: { connect: { id: track.id } },
      },
    });

    res.status(201).json(track);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add track to favorites" });
  }
};

// Get user's favorite tracks
exports.getFavorites = async (req, res) => {
  const { id: userId } = req.user;

  try {
    const userWithFavorites = await prisma.user.findUnique({
      where: { id: userId },
      include: { favorites: true },
    });

    res.json(userWithFavorites.favorites);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve favorites" });
  }
};

// Create a new playlist
exports.createPlaylist = async (req, res) => {
  const { id: userId } = req.user;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Playlist name is required" });
  }

  try {
    const playlist = await prisma.playlist.create({
      data: {
        name,
        userId,
      },
    });
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to create playlist" });
  }
};

// Add a track to a playlist
exports.addTrackToPlaylist = async (req, res) => {
  const { id: userId } = req.user;
  const { id: playlistId } = req.params;
  const { deezerId, title, artist, coverUrl } = req.body;

  try {
    // Verify playlist belongs to the user
    const playlist = await prisma.playlist.findFirst({
      where: { id: playlistId, userId },
    });

    if (!playlist) {
      return res
        .status(404)
        .json({ message: "Playlist not found or access denied" });
    }

    const track = await prisma.track.upsert({
      where: { deezerId },
      update: {},
      create: { deezerId, title, artist, coverUrl },
    });

    await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        tracks: { connect: { id: track.id } },
      },
    });

    res.status(201).json({ message: "Track added to playlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add track to playlist" });
  }
};
