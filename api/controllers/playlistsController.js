const mongoose = require("mongoose");
const Playlist = mongoose.model("Playlist");

// ===============================
// PLAYLIST CONTROLLERS (Mostly User-specific)
// ===============================

// CREATE playlist for current user
exports.createPlaylist = async (req, res) => {
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
};

// READ all playlists for current user
exports.getUserPlaylists = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(404).json({ error: "User not found" });

    const playlists = await Playlist.find({ owner: userId })
      .populate("songs")
      .sort({ _id: -1 });

    res.json(playlists || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ single playlist (owned by current user)
exports.getUserPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE playlist (owned by current user)
exports.updateUserPlaylist = async (req, res) => {
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
};

// DELETE playlist (owned by current user)
exports.deleteUserPlaylist = async (req, res) => {
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
};
