// models/MusicUser.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MusicUserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true, // allows null/undefined email
  },
  password: { type: String }, // optional for Auth0 accounts
  displayName: String,
  auth0Id: { type: String, unique: true, sparse: true },
  favorite_songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
});

MusicUserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password") || !user.password) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

MusicUserSchema.methods.comparePassword = function (pwd) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(pwd, this.password || "", (err, isMatch) => {
      if (err) return reject(err);
      if (!isMatch) return reject(false);
      resolve(true);
    });
  });
};

mongoose.model("MusicUser", MusicUserSchema);
