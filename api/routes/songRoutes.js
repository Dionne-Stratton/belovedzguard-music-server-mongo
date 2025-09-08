const router = require("express").Router();
const SongModel = require("../models/Songs");

router.post("/", (req, res) => {
  const saveSong = SongModel({
    title: req.body.title,
    youTubeUrl: req.body.youTubeUrl,
    perspective: req.body.perspective,
    lyrics: req.body.lyrics,
    songThumbnailURL: req.body.songThumbnailURL,
    videoThumbnailURL: req.body.videoThumbnailURL,
    musicFileURL: req.body.musicFileURL,
    sunoUrl: req.body.sunoUrl,
  });
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

router.get("/", async (req, res) => {
  try {
    const allData = await SongModel.find();
    res.json(allData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const singleSong = await SongModel.find({ _id: req.params.id });
    console.log("get by ID", req.params.id);
    res.send(singleSong);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await SongModel.deleteOne({ _id: req.params.id });
    console.log(req.params.id);
    res.send(`deleted`);
  } catch (error) {
    console.log(req.params.id);
    res.status(500).send(error.message);
  }
});

router.put("/:id", async (req, res) => {
  try {
    await SongModel.updateOne({ _id: req.params.id }, req.body);
    //sending back the newly updated array of songs
    let songListing = await SongModel.find({ _id: req.params.id });
    res.send(songListing);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
