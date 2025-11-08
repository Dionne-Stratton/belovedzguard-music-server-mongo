const mongoose = require("mongoose");
const Song = mongoose.model("Song");
const { isAdmin } = require("../middleware/adminAuth");

// Helper: convert title to slug
function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "") // remove apostrophes
    .replace(/\s+/g, "-"); // spaces → dashes
}

// Helper: create derived song data
function makeSongData({
  title,
  genre,
  youTube = null,
  description = null,
  verse = null,
  isDraft = false,
}) {
  const slug = slugifyTitle(title);
  const base = process.env.MEDIA_BASE_URL || "https://media.belovedzguard.com";

  return {
    title,
    genre,
    mp3: `${base}/music-files/${slug}.mp3`,
    songThumbnail: `${base}/song-thumbnails/${slug}.jpg`,
    animatedSongThumbnail: `${base}/animated-song-thumbnails/${slug}.mp4`,
    videoThumbnail: `${base}/video-thumbnails/${slug}.jpg`,
    youTube,
    bandcamp: `https://belovedzguard.bandcamp.com/track/${slug}`,
    lyrics: `${base}/lyrics/${slug}.md`,
    description,
    verse,
    isDraft,
  };
}

// ===============================
// CONTROLLER METHODS
// ===============================

// CREATE song
exports.createSong = async (req, res) => {
  try {
    const { title, genre, youTube, description, verse } = req.body;
    const rawIsDraft = req.body.isDraft ?? false;
    const isDraft =
      typeof rawIsDraft === "string"
        ? rawIsDraft === "true"
        : Boolean(rawIsDraft);
    const auth0Id = req.auth0Id;

    if (!auth0Id) {
      return res.status(401).json({ error: "Missing Auth0 user ID" });
    }

    if (!isAdmin(auth0Id)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (!title || !genre) {
      return res.status(400).json({ error: "Title and genre are required" });
    }

    // Duplicate titles are allowed (versions differ by thumbnails)
    const songData = makeSongData({
      title,
      genre,
      youTube,
      description,
      verse,
      isDraft,
    });
    const newSong = new Song(songData);
    await newSong.save();

    res.status(201).json(newSong);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ all songs
exports.getAllSongs = async (req, res) => {
  try {
    const includeDrafts = req.auth0Id && isAdmin(req.auth0Id);
    const filter = includeDrafts ? {} : { isDraft: { $ne: true } };

    const allData = await Song.find(filter).sort({ _id: -1 }).lean();
    res.json(allData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ single song
exports.getSongById = async (req, res) => {
  const { id } = req.params;
  try {
    const singleSong = await Song.findById(id);
    const includeDrafts = req.auth0Id && isAdmin(req.auth0Id);
    if (!singleSong || (singleSong.isDraft && !includeDrafts)) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(singleSong);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE song
exports.updateSong = async (req, res) => {
  const { id } = req.params;
  const auth0Id = req.auth0Id;

  try {
    if (!auth0Id) {
      return res.status(401).json({ error: "Missing Auth0 user ID" });
    }

    if (!isAdmin(auth0Id)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const song = await Song.findByIdAndUpdate(id, req.body, { new: true });
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE song
exports.deleteSong = async (req, res) => {
  const { id } = req.params;
  const auth0Id = req.auth0Id;

  try {
    if (!auth0Id) {
      return res.status(401).json({ error: "Missing Auth0 user ID" });
    }

    if (!isAdmin(auth0Id)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const song = await Song.findByIdAndDelete(id);
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json({ message: "Song deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
