const router = require("express").Router();
const mongoose = require("mongoose");
const MusicUser = mongoose.model("MusicUser");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: "email and password are required" });
  }

  const user = await MusicUser.findOne({ email });

  if (user) {
    return res.status(500).json({ message: "email in use" });
  }

  try {
    const user = new MusicUser(req.body);
    await user.save();

    const token = jwt.sign({ userId: user._id }, secret);
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: "provide email and password" });
  }

  const user = await MusicUser.findOne({ email });

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, secret);
    res.send({ token });
  } catch (err) {
    return res.status(401).send({ message: "invalid email or password" });
  }
});

router.get("/users", async (req, res) => {
  const users = await MusicUser.find();
  res.send(users);
});

module.exports = router;
