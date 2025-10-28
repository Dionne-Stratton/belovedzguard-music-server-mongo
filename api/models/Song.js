const { url } = require("inspector");
const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: String,
  genre: String,
  mp3: String,
  songThumbnail: String,
  animatedSongThumbnail: String,
  videoThumbnail: String,
  youTube: String,
  bandcamp: String,
  lyrics: String,
  description: String,
  verse: String,
});

module.exports = SongModel = mongoose.model("Song", songSchema);
