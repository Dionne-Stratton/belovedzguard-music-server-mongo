// routes/userRoutes.js
const router = require("express").Router();
const mongoose = require("mongoose");
const User = mongoose.model("MusicUser");
const Playlist = mongoose.model("Playlist");

// ===============================
// USER CRUD ROUTES Restricted in api/server.js
// ===============================

//read:
router.get("/", async (req, res) => {
  const userId = req.userId;
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(currentUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//update:
router.put("/", async (req, res) => {
  const userId = req.userId;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//delete:
router.delete("/", async (req, res) => {
  const userId = req.userId;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: `User ${deletedUser._id} deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// PLAYLIST CRUD ROUTES Specific to User
// ===============================

// CREATE playlist
router.post("/playlists", async (req, res) => {
  const { name, songs } = req.body;
  try {
    const userId = req.userId;
    if (!userId)
      return res
        .status(404)
        .json({ error: "User not found for playlist creation" });

    if (!name || name.trim() === "" || !Array.isArray(songs)) {
      return res
        .status(400)
        .json({ error: "Playlist name and songs are required" });
    }
    const newPlaylist = new Playlist({
      ...req.body,
      owner: userId, // tie it to Mongo user
    });

    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ all playlists for current user
router.get("/playlists", async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(404).json({ error: "User not found" });

    const playlists = await Playlist.find({ owner: userId })
      .populate("songs")
      .sort({ _id: -1 });
    return res.json(playlists || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ single playlist
router.get("/playlists/:id", async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(404).json({ error: "User not found" });

    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (playlist.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE playlist
router.put("/playlists/:id", async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(404).json({ error: "User not found" });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (playlist.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    Object.assign(playlist, req.body);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE playlist
router.delete("/playlists/:id", async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(404).json({ error: "User not found" });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (playlist.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await playlist.deleteOne();
    res.json({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
