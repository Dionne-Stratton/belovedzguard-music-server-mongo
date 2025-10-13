const mongoose = require("mongoose");

const MusicUserSchema = new mongoose.Schema(
  {
    // The user's unique Auth0 ID (from the "sub" field in the JWT)
    auth0Id: { type: String, required: true, unique: true },

    //still deciding on implementation of favorite songs
    favorite_songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
  },
  { timestamps: true }
);

mongoose.model("MusicUser", MusicUserSchema);
