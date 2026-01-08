const axios = require("axios");
const ytSearch = require("yt-search");
const prisma = require("../utils/prisma");

// Multiple Piped instances for reliability
const PIPED_INSTANCES = [
  "https://pipedapi-libre.kavin.rocks",
  "https://pipedapi.garudar.xyz",
  "https://pipedapi.kavin.rocks",
];

const PIPED_INSTANCE = process.env.PIPED_INSTANCE || PIPED_INSTANCES[0];

exports.streamTrack = async (req, res) => {
  const { deezerId } = req.params;

  if (!deezerId) {
    return res.status(400).json({ message: "Deezer ID is required" });
  }

  try {
    // 1. Check if track exists in database
    const existingTrack = await prisma.track.findUnique({
      where: { deezerId },
    });

    let youtubeId;

    if (existingTrack) {
      // 2. If track exists and has youtubeId, use it directly
      if (existingTrack.youtubeId) {
        youtubeId = existingTrack.youtubeId;
        console.log(
          `Using cached YouTube ID: ${youtubeId} for track: ${existingTrack.title}`
        );
      } else {
        // 3. If no youtubeId, search YouTube and update database
        const searchQuery = `${existingTrack.title} ${existingTrack.artist} official audio`;
        const { videos } = await ytSearch(searchQuery);

        if (!videos || videos.length === 0) {
          return res
            .status(404)
            .json({ message: "Could not find a matching YouTube video" });
        }

        youtubeId = videos[0].videoId;

        // Update database with youtubeId for future use
        await prisma.track.update({
          where: { deezerId },
          data: { youtubeId: videoId },
        });

        console.log(
          `Found and cached YouTube ID: ${youtubeId} for track: ${existingTrack.title}`
        );
      }
    } else {
      // 4. If track not in database, get info from Deezer and search YouTube
      const { getTrackInfo } = require("../services/deezerService");
      const trackInfo = await getTrackInfo(deezerId);
      if (!trackInfo) {
        return res.status(404).json({ message: "Track not found on Deezer" });
      }

      const searchQuery = `${trackInfo.title} ${trackInfo.artist} official audio`;
      const { videos } = await ytSearch(searchQuery);

      if (!videos || videos.length === 0) {
        return res
          .status(404)
          .json({ message: "Could not find a matching YouTube video" });
      }

      youtubeId = videos[0].videoId;

      // Create track in database with youtubeId
      await prisma.track.create({
        data: {
          deezerId,
          title: trackInfo.title,
          artist: trackInfo.artist,
          album: trackInfo.album,
          coverUrl: trackInfo.coverUrl,
          durationMs: trackInfo.durationMs,
          youtubeId: videoId,
        },
      });

      console.log(
        `Created new track with YouTube ID: ${youtubeId} for track: ${trackInfo.title}`
      );
    }

    // 5. Try to get audio stream with multiple fallbacks
    let streamUrl = null;
    let lastError = null;

    // Try multiple Piped instances
    for (const instance of PIPED_INSTANCES) {
      try {
        console.log(`Trying Piped instance: ${instance}`);

        const pipedResponse = await axios.get(
          `${instance}/streams/${youtubeId}`,
          {
            timeout: 8000,
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; StreamAPI)",
              Accept: "application/json",
            },
          }
        );

        if (pipedResponse.data && pipedResponse.data.audioStreams) {
          const audioStreams = pipedResponse.data.audioStreams;

          if (audioStreams && audioStreams.length > 0) {
            // Find best audio stream
            let bestStream =
              audioStreams.find((stream) => stream.codec === "m4a") ||
              audioStreams.find((stream) => stream.codec === "opus") ||
              audioStreams.reduce(
                (best, current) =>
                  !best ||
                  (current.bitrate &&
                    parseInt(current.bitrate) > parseInt(best.bitrate))
                    ? current
                    : best,
                null
              );

            if (bestStream && bestStream.url) {
              streamUrl = bestStream.url;
              console.log(` Success with instance: ${instance}`);
              console.log(
                `Stream codec: ${bestStream.codec}, bitrate: ${
                  bestStream.bitrate || "unknown"
                }`
              );
              break;
            }
          }
        }

        if (streamUrl) break; // Success, exit the loop
      } catch (error) {
        console.error(`Instance ${instance} failed:`, error.message);
        lastError = error;
        continue; // Try next instance
      }
    }

    // If we got a stream URL from Piped, redirect to it
    if (streamUrl) {
      console.log(`Redirecting to audio stream: ${streamUrl}`);
      return res.redirect(302, streamUrl);
    }

    // Fallback options if all Piped instances fail
    console.log("All Piped instances failed, trying fallbacks...");

    // Fallback 1: Invidious instance
    try {
      const invidiousResponse = await axios.get(
        `https://yewtu.be/api/v1/videos/${youtubeId}`,
        {
          timeout: 5000,
        }
      );

      if (invidiousResponse.data && invidiousResponse.data.formats) {
        const audioFormat = invidiousResponse.data.formats.find(
          (f) => f.type.startsWith("audio") && f.quality === "medium"
        );

        if (audioFormat && audioFormat.url) {
          console.log(" Fallback to Invidious successful");
          return res.redirect(302, audioFormat.url);
        }
      }
    } catch (invidiousError) {
      console.error("Invidious fallback failed:", invidiousError.message);
    }

    // Fallback 2: Direct YouTube (last resort)
    console.log("Final fallback: direct YouTube redirect");
    return res.redirect(302, `https://www.youtube.com/watch?v=${youtubeId}`);
  } catch (error) {
    console.error("Error in streamTrack controller:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
