const router = require("express").Router();
const SongModel = require("../models/Songs");

// router.post("/", (req, res) => {
//   const saveSong = SongModel(req.body);
//   saveSong
//     .save()
//     .then((res) => {
//       console.log("song is saved", res);
//     })
//     .catch((err) => {
//       console.log(err, "here is the error");
//     });
//   res.send("song is saved");
// });

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "") // remove apostrophes
    .replace(/\s+/g, "-"); // spaces → dashes
}

function makeSongData({ title, genre, youTube = null }) {
  const slug = slugifyTitle(title);

  const base = "https://media.belovedzguard.com";

  return {
    title,
    genre,
    mp3: `${base}/music-files/${slug}.mp3`,
    songThumbnail: `${base}/song-thumbnails/${slug}.jpg`,
    videoThumbnail: `${base}/video-thumbnails/${slug}.jpg`,
    youTube,
    lyrics: `${base}/lyrics/${slug}.md`,
  };
}

router.post("/", async (req, res) => {
  try {
    const { title, genre, youTube } = req.body;

    if (!title || !genre) {
      return res.status(400).send("Title and genre are required");
    }

    const songData = makeSongData({ title, genre, youTube });
    const newSong = new SongModel(songData);
    await newSong.save();

    res.status(201).json(newSong);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/bulk-add", async (req, res) => {
  try {
    const songs = req.body;
    const savedSongs = await SongModel.insertMany(songs);
    res.status(201).json(savedSongs);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const allData = await SongModel.find().sort({ _id: -1 }).lean();
    res.json(allData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleSong = await SongModel.findById(id);
    if (!singleSong) {
      return res.status(404).send({ error: "song not found" });
    }
    console.log("get by ID", id);
    res.send(singleSong);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await SongModel.findByIdAndDelete(id);
    console.log(id);
    res.send(`deleted`);
  } catch (error) {
    console.log(id);
    res.status(500).send(error.message);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const song = await SongModel.findByIdAndUpdate(id, req.body, { new: true });
    //sending back the newly updated array of songs
    res.send(song);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
