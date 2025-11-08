const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    isDraft: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mongoose.model("Album", albumSchema);
