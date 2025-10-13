const router = require("express").Router();
const mongoose = require("mongoose");
const Song = mongoose.model("Song");

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "") // remove apostrophes
    .replace(/\s+/g, "-"); // spaces → dashes
}

function makeSongData({ title, genre, youTube = null }) {
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
    lyrics: `${base}/lyrics/${slug}.md`,
  };
}

// ===============================
// SONG CRUD ROUTES Restricted in api/server.js
// ===============================

// CREATE song
router.post("/", async (req, res) => {
  try {
    const { title, genre, youTube } = req.body;
    if (!title || !genre) {
      return res.status(400).json({ error: "Title and genre are required" });
    }
    // Note: duplicate titles allowed (different versions distinguished by thumbnails)
    const songData = makeSongData({ title, genre, youTube });
    const newSong = new Song(songData);
    await newSong.save();

    res.status(201).json(newSong);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ all songs
router.get("/", async (req, res) => {
  try {
    const allData = await Song.find().sort({ _id: -1 }).lean();
    res.json(allData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ single song
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleSong = await Song.findById(id);
    if (!singleSong) {
      return res.status(404).json({ error: "song not found" });
    }
    res.json(singleSong);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE song
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const song = await Song.findByIdAndUpdate(id, req.body, { new: true });
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE song
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const song = await Song.findByIdAndDelete(id);
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json({ message: "Song deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
