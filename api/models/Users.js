const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MusicUserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
  },
  favorite_songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
});

MusicUserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }

      user.password = hash;
      next();
    });
  });
});

MusicUserSchema.methods.comparePassword = function (pwd) {
  const user = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(pwd, user.password, (err, isMatch) => {
      if (err) {
        return next(err);
      }

      if (!isMatch) {
        return reject(false);
      } else {
        resolve(true);
      }
    });
  });
};

mongoose.model("MusicUser", MusicUserSchema);
