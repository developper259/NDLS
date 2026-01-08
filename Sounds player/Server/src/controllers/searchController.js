const { searchTracks } = require("../services/deezerService");

exports.search = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    const tracks = await searchTracks(query);
    res.json(tracks);
  } catch (error) {
    console.error("Error searching tracks:", error);
    res.status(500).json({ message: "Error searching tracks" });
  }
};
