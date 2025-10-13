// routes/userRoutes.js
const router = require("express").Router();
const mongoose = require("mongoose");
const Album = mongoose.model("Album");

// ===============================
// ALBUM CRUD ROUTES Restricted in api/server.js
// ===============================

// CREATE album
router.post("/", async (req, res) => {
  try {
    const { title, songs } = req.body;

    if (!title || !songs) {
      return res.status(400).json({ error: "Title and songs are required" });
    }
    if (!Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({ error: "Songs must be a non-empty array" });
    }

    const newAlbum = new Album(req.body);
    await newAlbum.save();

    res.status(201).json(newAlbum);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ all albums
router.get("/", async (req, res) => {
  try {
    const albums = await Album.find().populate("songs");
    res.json(albums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ single album
router.get("/:id", async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate("songs");
    if (!album) return res.status(404).json({ error: "Album not found" });
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE album
router.put("/:id", async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!album) return res.status(404).json({ error: "Album not found" });
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE album
router.delete("/:id", async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ error: "Album not found" });
    res.json({ message: "Album deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
