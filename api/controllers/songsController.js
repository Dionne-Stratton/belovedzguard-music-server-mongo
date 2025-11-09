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

const BANDCAMP_BASE_URL = "https://belovedzguard.bandcamp.com/track";
const ASSET_FIELD_CONFIG = [
  { assetKey: "mp3", keyField: "mp3Key" },
  { assetKey: "songThumbnail", keyField: "songThumbnailKey" },
  { assetKey: "animatedSongThumbnail", keyField: "animatedSongThumbnailKey" },
  { assetKey: "videoThumbnail", keyField: "videoThumbnailKey" },
  { assetKey: "lyrics", keyField: "lyricsKey" },
];

function extractAssetFields(body = {}) {
  const assets = body.assets;
  if (!assets || typeof assets !== "object") return {};

  return ASSET_FIELD_CONFIG.reduce((acc, { assetKey, keyField }) => {
    const payload = assets[assetKey];
    if (payload && typeof payload === "object") {
      if (Object.prototype.hasOwnProperty.call(payload, "publicUrl")) {
        acc[assetKey] = payload.publicUrl;
      }
      if (Object.prototype.hasOwnProperty.call(payload, "key")) {
        acc[keyField] = payload.key;
      }
    }
    return acc;
  }, {});
}

function withAssetDefaults(body = {}) {
  const assetsFromPayload = extractAssetFields(body);
  const base = {};

  ASSET_FIELD_CONFIG.forEach(({ assetKey, keyField }) => {
    if (!Object.prototype.hasOwnProperty.call(assetsFromPayload, assetKey)) {
      if (Object.prototype.hasOwnProperty.call(body, assetKey)) {
        base[assetKey] = body[assetKey];
      }
    }

    if (!Object.prototype.hasOwnProperty.call(assetsFromPayload, keyField)) {
      if (Object.prototype.hasOwnProperty.call(body, keyField)) {
        base[keyField] = body[keyField];
      }
    }
  });

  return { ...base, ...assetsFromPayload };
}

function buildBandcampUrl(title) {
  const slug = slugifyTitle(title);
  return `${BANDCAMP_BASE_URL}/${slug}`;
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
    const assetFields = withAssetDefaults(req.body);
    const newSong = new Song({
      title,
      genre,
      youTube,
      description,
      verse,
      ...assetFields,
      bandcamp: buildBandcampUrl(title),
      isDraft,
    });
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

    const updates = { ...req.body };
    const assetUpdates = withAssetDefaults(updates);
    delete updates.assets;
    Object.assign(updates, assetUpdates);

    if (Object.prototype.hasOwnProperty.call(updates, "title") && !Object.prototype.hasOwnProperty.call(updates, "bandcamp")) {
      updates.bandcamp = buildBandcampUrl(updates.title);
    }

    const song = await Song.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
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
