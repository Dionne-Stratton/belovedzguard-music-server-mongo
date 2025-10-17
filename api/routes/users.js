const router = require("express").Router();
const usersController = require("../controllers/usersController");
const playlistsController = require("../controllers/playlistsController");

// ===============================
// USER CRUD ROUTES
// ===============================

router.get("/", usersController.getCurrentUser);
router.put("/", usersController.updateCurrentUser);
router.delete("/", usersController.deleteCurrentUser);

// ===============================
// PLAYLIST ROUTES (User-specific)
// ===============================

router.post("/playlists", playlistsController.createPlaylist);
router.get("/playlists", playlistsController.getUserPlaylists);
router.get("/playlists/:id", playlistsController.getUserPlaylistById);
router.put("/playlists/:id", playlistsController.updateUserPlaylist);
router.delete("/playlists/:id", playlistsController.deleteUserPlaylist);
router.patch("/playlists/:id/addSong", playlistsController.addSongToPlaylist);

module.exports = router;
