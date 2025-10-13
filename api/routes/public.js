// routes/publicRoutes.js
const router = require("express").Router();
const mongoose = require("mongoose");

const Album = mongoose.model("Album");
const Song = mongoose.model("Song");
const Playlist = mongoose.model("Playlist");

// ===============================
// PUBLIC ROUTES (no auth required)
// ===============================

// [GET] /public/albums  — list all albums (oldest first)
router.get("/albums", async (req, res) => {
  try {
    const albums = await Album.find().populate("songs").sort({ _id: 1 }).lean();
    res.json(albums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [GET] /public/albums/:id  — single album by id
router.get("/albums/:id", async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate("songs").lean();
    if (!album) return res.status(404).json({ error: "Album not found" });
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [GET] /public/songs  — list all songs (newest first)
router.get("/songs", async (req, res) => {
  try {
    const songs = await Song.find().sort({ _id: -1 }).lean();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [GET] /public/songs/:id  — single song by id
router.get("/songs/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).lean();
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [GET] /public/playlists/:id  — single playlist by id (PUBLIC)
// Note: exposes songs in the playlist; omits owner by default for privacy.
router.get("/playlists/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .select("-owner") // hide owner (optional)
      .populate("songs") // include song docs
      .lean();

    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
