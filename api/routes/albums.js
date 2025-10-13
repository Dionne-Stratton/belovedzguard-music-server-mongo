const router = require("express").Router();
const albumsController = require("../controllers/albumsController");

// ===============================
// ALBUM CRUD ROUTES
// ===============================

router.post("/", albumsController.createAlbum);
router.get("/", albumsController.getAllAlbums);
router.get("/:id", albumsController.getAlbumById);
router.put("/:id", albumsController.updateAlbum);
router.delete("/:id", albumsController.deleteAlbum);

module.exports = router;
