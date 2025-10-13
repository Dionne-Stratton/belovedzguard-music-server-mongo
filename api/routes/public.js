const router = require("express").Router();
const albumsController = require("../controllers/albumsController");
const songsController = require("../controllers/songsController");
const playlistsController = require("../controllers/playlistsController");

// ===============================
// PUBLIC ROUTES (no auth required)
// ===============================

// ALBUMS
router.get("/albums", albumsController.getAllAlbums);
router.get("/albums/:id", albumsController.getAlbumById);

// SONGS
router.get("/songs", songsController.getAllSongs);
router.get("/songs/:id", songsController.getSongById);

// PLAYLISTS (PUBLIC)
// Exposes songs in the playlist but hides owner for privacy
router.get("/playlists/:id", playlistsController.getUserPlaylistById);

module.exports = router;
