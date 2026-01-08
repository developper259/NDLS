const prisma = require("../utils/prisma");
const { getTrackInfo } = require("../services/deezerService");
const ytSearch = require("yt-search");

exports.getTrack = async (req, res) => {
  const { deezerId } = req.params;

  if (!deezerId) {
    return res.status(400).json({ message: "Deezer ID is required" });
  }

  try {
    // 1. Check if track exists in database
    const existingTrack = await prisma.track.findUnique({
      where: { deezerId },
    });

    if (existingTrack) {
      // Return cached track data
      return res.json({
        id: existingTrack.id,
        deezerId: existingTrack.deezerId,
        title: existingTrack.title,
        artist: existingTrack.artist,
        album: existingTrack.album,
        coverUrl: existingTrack.coverUrl,
        durationMs: existingTrack.durationMs,
        youtubeId: existingTrack.youtubeId,
      });
    }

    // 2. If not found, fetch from Deezer API
    const trackInfo = await getTrackInfo(deezerId);
    if (!trackInfo) {
      return res.status(404).json({ message: "Track not found on Deezer" });
    }

    // 3. Search YouTube automatically for official audio
    let youtubeId = null;
    try {
      const searchQuery = `${trackInfo.title} ${trackInfo.artist} official audio`;
      const { videos } = await ytSearch(searchQuery);

      if (videos && videos.length > 0) {
        youtubeId = videos[0].videoId;
        console.log(
          `Found YouTube ID: ${youtubeId} for track: ${trackInfo.title}`
        );
      } else {
        console.log(`No YouTube video found for track: ${trackInfo.title}`);
      }
    } catch (error) {
      console.error(
        `YouTube search failed for track ${trackInfo.title}:`,
        error.message
      );
    }

    // 4. Create track in database WITH youtubeId
    const newTrack = await prisma.track.create({
      data: {
        deezerId,
        title: trackInfo.title,
        artist: trackInfo.artist,
        album: trackInfo.album,
        coverUrl: trackInfo.coverUrl,
        durationMs: trackInfo.durationMs,
        youtubeId: youtubeId,
      },
    });

    // 5. Return the complete track object
    res.json({
      id: newTrack.id,
      deezerId: newTrack.deezerId,
      title: newTrack.title,
      artist: newTrack.artist,
      album: newTrack.album,
      coverUrl: newTrack.coverUrl,
      durationMs: newTrack.durationMs,
      youtubeId: newTrack.youtubeId,
    });
  } catch (error) {
    console.error("Error in getTrack controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
