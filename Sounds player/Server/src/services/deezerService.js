const axios = require("axios");

const DEEZER_API_BASE = "https://api.deezer.com";

const searchTracks = async (query) => {
  try {
    const response = await axios.get(`${DEEZER_API_BASE}/search`, {
      params: { q: query, limit: 10 },
    });

    return response.data.data.map((track) => ({
      deezerId: track.id.toString(),
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      coverUrl: track.album.cover_medium,
      durationMs: track.duration * 1000, // Convert seconds to milliseconds
    }));
  } catch (error) {
    console.error("Error searching tracks on Deezer:", error);
    throw new Error("Failed to search tracks on Deezer");
  }
};

const getTrackInfo = async (deezerId) => {
  try {
    const response = await axios.get(`${DEEZER_API_BASE}/track/${deezerId}`);
    const track = response.data;

    return {
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      coverUrl: track.album.cover_medium,
      durationMs: track.duration * 1000, // Convert seconds to milliseconds
    };
  } catch (error) {
    console.error("Error getting track info from Deezer:", error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error("Failed to get track info from Deezer");
  }
};

module.exports = { searchTracks, getTrackInfo };
