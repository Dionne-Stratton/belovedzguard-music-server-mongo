const { url } = require("inspector");
const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: String,
  youTubeUrl: String,
  perspective: String,
  lyrics: String,
  songThumbnailURL: String,
  videoThumbnailURL: String,
  musicFileURL: String,
  sunoUrl: String,
});

module.exports = SongModel = mongoose.model("Song", songSchema);
