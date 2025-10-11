// routes/userRoutes.js
const router = require("express").Router();
const mongoose = require("mongoose");
const MusicUser = mongoose.model("MusicUser");
const Playlist = mongoose.model("Playlist");
const requireAuth = require("../middleware/requireAuth");

router.use(...requireAuth);

// ===============================
// PROFILE CRUD ROUTES
// ===============================

// Read profile
router.get("/", async (req, res) => {
  try {
    const user = req.userId;
    if (!user) return res.status(404).send({ error: "Profile not found" });
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update profile
router.put("/", async (req, res) => {
  try {
    const user = req.userId;
    if (!user) return res.status(404).send({ error: "Profile not found" });

    Object.assign(user, req.body);
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Delete profile
router.delete("/", async (req, res) => {
  try {
    const user = req.userId;
    if (!user) return res.status(404).send({ error: "Profile not found" });

    await user.deleteOne();
    res.send({ message: "Profile deleted" });
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
    const user = req.userId;
    if (!user)
      return res
        .status(404)
        .send({ error: "User not found for playlist creation" });

    const newPlaylist = new Playlist({
      ...req.body,
      owner: user._id, // tie it to Mongo user
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
    const user = req.userId;
    if (!user) return res.status(404).send({ error: "User not found" });

    const playlists = await Playlist.find({ owner: user._id }).populate(
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
    const user = req.userId;
    if (!user) return res.status(404).send({ error: "User not found" });

    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist) return res.status(404).send({ error: "Playlist not found" });
    if (playlist.owner.toString() !== user._id.toString()) {
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
    const user = req.userId;
    if (!user) return res.status(404).send({ error: "User not found" });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).send({ error: "Playlist not found" });
    if (playlist.owner.toString() !== user._id.toString()) {
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
    const user = req.userId;
    if (!user) return res.status(404).send({ error: "User not found" });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).send({ error: "Playlist not found" });
    if (playlist.owner.toString() !== user._id.toString()) {
      return res.status(403).send({ error: "Not authorized" });
    }

    await playlist.deleteOne();
    res.send({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
