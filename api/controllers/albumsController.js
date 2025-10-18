const mongoose = require("mongoose");
const Album = mongoose.model("Album");
const { isAdmin } = require("../middleware/adminAuth");

exports.createAlbum = async (req, res) => {
  try {
    const { title, songs } = req.body;
    const auth0Id = req.auth0Id;

    if (!auth0Id) {
      return res.status(401).json({ error: "Missing Auth0 user ID" });
    }

    if (!isAdmin(auth0Id)) {
      return res.status(403).json({ error: "Admin access required" });
    }

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
};

exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate("songs");
    res.json(albums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate("songs");
    if (!album) return res.status(404).json({ error: "Album not found" });
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    const auth0Id = req.auth0Id;

    if (!auth0Id) {
      return res.status(401).json({ error: "Missing Auth0 user ID" });
    }

    if (!isAdmin(auth0Id)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const album = await Album.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!album) return res.status(404).json({ error: "Album not found" });
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const auth0Id = req.auth0Id;

    if (!auth0Id) {
      return res.status(401).json({ error: "Missing Auth0 user ID" });
    }

    if (!isAdmin(auth0Id)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ error: "Album not found" });
    res.json({ message: "Album deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
