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
  mp3Key: String,
  songThumbnailKey: String,
  animatedSongThumbnailKey: String,
  videoThumbnailKey: String,
  lyricsKey: String,
  isDraft: { type: Boolean, default: false },
  lyrics: String,
  description: String,
  verse: String,
});

module.exports = SongModel = mongoose.model("Song", songSchema);
