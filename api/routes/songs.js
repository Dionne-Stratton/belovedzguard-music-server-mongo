const router = require("express").Router();
const songsController = require("../controllers/songsController");

// ===============================
// SONG CRUD ROUTES
// ===============================

router.post("/", songsController.createSong);
router.get("/", songsController.getAllSongs);
router.get("/:id", songsController.getSongById);
router.put("/:id", songsController.updateSong);
router.delete("/:id", songsController.deleteSong);

module.exports = router;
