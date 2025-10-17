const mongoose = require("mongoose");
const Playlist = mongoose.model("Playlist");

// ===============================
// PLAYLIST CONTROLLERS (User-specific)
// ===============================

// CREATE playlist for current user
exports.createPlaylist = async (req, res) => {
  const { name, songs } = req.body;
  try {
    const auth0Id = req.auth0Id; // new
    const userId = req.userId; // legacy reference (still attached by middleware)

    if (!auth0Id) {
      return res.status(401).json({ error: "Missing Auth0 user ID" });
    }

    if (!name || name.trim() === "" || !Array.isArray(songs)) {
      return res
        .status(400)
        .json({ error: "Playlist name and songs are required" });
    }

    const newPlaylist = new Playlist({
      ...req.body,
      owner: auth0Id, // store Auth0 ID instead of Mongo _id
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
    const auth0Id = req.auth0Id;
    if (!auth0Id)
      return res.status(401).json({ error: "Missing Auth0 user ID" });

    const playlists = await Playlist.find({ owner: auth0Id })
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
    const auth0Id = req.auth0Id;
    if (!auth0Id)
      return res.status(401).json({ error: "Missing Auth0 user ID" });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    if (playlist.owner !== auth0Id) {
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
    const auth0Id = req.auth0Id;
    if (!auth0Id)
      return res.status(401).json({ error: "Missing Auth0 user ID" });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    if (playlist.owner !== auth0Id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await playlist.deleteOne();
    res.json({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD song to playlist (owned by current user)
exports.addSongToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    const auth0Id = req.auth0Id;

    if (!auth0Id) {
      return res.status(401).json({ error: "Missing Auth0 user ID" });
    }

    if (!songId) {
      return res.status(400).json({ error: "Song ID is required" });
    }

    // Find the playlist and verify ownership
    const playlist = await Playlist.findOne({
      _id: id,
      owner: auth0Id,
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Add song ID to playlist using $push (allows duplicates)
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      id,
      { $push: { songs: songId } },
      { new: true }
    ).populate("songs");

    res.json(updatedPlaylist);
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
