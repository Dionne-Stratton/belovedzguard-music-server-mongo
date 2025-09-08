const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ error: "log in" });
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, secret, async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: "log in" });
    }

    const { userId } = payload;

    const user = await User.findById(userId);
    req.user = user;
    next();
  });
};
