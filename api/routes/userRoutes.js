const router = require("express").Router();
const mongoose = require("mongoose");
const MusicUser = mongoose.model("MusicUser");
const Playlist = mongoose.model("Playlist");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

// ===============================
// PROFILE CRUD ROUTES
// ===============================

// Read profile
router.get("/", async (req, res) => {
  try {
    const currentProfile = await MusicUser.findById(req.user._id);
    if (!currentProfile) {
      return res.status(404).send({ error: "Profile not found" });
    }
    res.send(currentProfile);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update profile
router.put("/", async (req, res) => {
  try {
    const updatedProfile = await MusicUser.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true }
    );
    if (!updatedProfile) {
      return res.status(404).send({ error: "Profile not found" });
    }
    res.send(updatedProfile);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Delete profile
router.delete("/", async (req, res) => {
  try {
    const deleteResult = await MusicUser.deleteOne({ _id: req.user._id });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).send({ error: "Profile not found" });
    }
    res.send(`${deleteResult.deletedCount} profile deleted`);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ===============================
// PLAYLIST CRUD ROUTES
// ===============================

// CREATE playlist
router.post("/playlists", async (req, res) => {
  try {
    const newPlaylist = new Playlist({
      ...req.body,
      owner: req.user._id, // tie it to logged-in user
    });
    await newPlaylist.save();
    res.status(201).send(newPlaylist);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// READ all playlists for current user
router.get("/playlists", async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id }).populate(
      "songs"
    );
    res.send(playlists);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// READ single playlist
router.get("/playlists/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist) return res.status(404).send({ error: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: "Not authorized" });
    }
    res.send(playlist);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// UPDATE playlist
router.put("/playlists/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).send({ error: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: "Not authorized" });
    }

    Object.assign(playlist, req.body);
    await playlist.save();

    res.send(playlist);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// DELETE playlist
router.delete("/playlists/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).send({ error: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: "Not authorized" });
    }

    await playlist.deleteOne();
    res.send({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
