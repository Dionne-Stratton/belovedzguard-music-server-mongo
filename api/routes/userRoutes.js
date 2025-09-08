const router = require("express").Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

//profile CRUD routes

//read:
router.get("/", async (req, res) => {
  try {
    const currentProfile = await User.findOne({ _id: req.user._id });
    if (!currentProfile) {
      return res.status(404).send({ error: "profile not found" });
    }
    res.send(currentProfile);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//update:
router.put("/", async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, req.body);
    let updatedProfile = await User.findOne({ _id: req.user._id });
    if (!updatedProfile) {
      return res.status(404).send({ error: "profile not found" });
    }
    res.send(updatedProfile);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//delete:
router.delete("/", async (req, res) => {
  try {
    const deleteProfile = await User.deleteOne({ _id: req.user._id });
    if (!deleteProfile) {
      return res.status(404).send({ error: "profile not found" });
    }
    res.send(`${deleteProfile.deletedCount} profile deleted`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
