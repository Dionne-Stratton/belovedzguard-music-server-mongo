const router = require("express").Router();
const SongModel = require("../models/Songs");

router.post("/", (req, res) => {
  const saveSong = SongModel(req.body);
  saveSong
    .save()
    .then((res) => {
      console.log("song is saved", res);
    })
    .catch((err) => {
      console.log(err, "here is the error");
    });
  res.send("song is saved");
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
    const allData = await SongModel.find();
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
