require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Music Streaming API is running!");
});

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const searchRoutes = require("./routes/searchRoutes");
app.use("/search", searchRoutes);

const streamRoutes = require("./routes/streamRoutes");
app.use("/stream", streamRoutes);

const tracksRoutes = require("./routes/tracksRoutes");
app.use("/tracks", tracksRoutes);

const libraryRoutes = require("./routes/libraryRoutes");
app.use("/library", libraryRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
