const mongoose = require("mongoose");

const MusicUserSchema = new mongoose.Schema(
  {
    // The user's unique Auth0 ID (from the "sub" field in the JWT)
    auth0Id: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

mongoose.model("MusicUser", MusicUserSchema);
