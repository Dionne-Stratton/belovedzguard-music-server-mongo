const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MusicUser",
      required: true,
    },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true }, // for shareable links
  },
  { timestamps: true }
);

mongoose.model("Playlist", playlistSchema);
