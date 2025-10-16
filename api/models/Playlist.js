const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true }, // stores Auth0 ID instead of ObjectId
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    background_image: { type: String, default: "" },
    details_color: { type: String, default: "#6e6c6cff" },
  },
  { timestamps: true }
);

mongoose.model("Playlist", playlistSchema);
