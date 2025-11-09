const path = require("path");

const ASSET_CONFIG = {
  mp3: {
    folder: "music-files",
    extension: ".mp3",
    contentType: "audio/mpeg",
    field: "mp3",
  },
  songThumbnail: {
    folder: "song-thumbnails",
    extension: ".jpg",
    contentType: "image/jpeg",
    field: "songThumbnail",
  },
  animatedThumbnail: {
    folder: "animated-song-thumbnails",
    extension: ".mp4",
    contentType: "video/mp4",
    field: "animatedSongThumbnail",
  },
  videoThumbnail: {
    folder: "video-thumbnails",
    extension: ".jpg",
    contentType: "image/jpeg",
    field: "videoThumbnail",
  },
  lyrics: {
    folder: "lyrics",
    extension: ".md",
    contentType: "text/markdown",
    field: "lyrics",
  },
};

function ensureEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function normalizeFileName(fileName) {
  if (!fileName || typeof fileName !== "string") {
    throw new Error("fileName must be a non-empty string");
  }

  if (fileName.includes("/") || fileName.includes("\\")) {
    throw new Error("fileName cannot contain path separators");
  }

  return fileName.trim();
}

function buildPublicUrl(key) {
  const baseUrl = ensureEnv("CLOUDFLARE_R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
  return `${baseUrl}/${key}`;
}

function getAssetLocation({ assetType, fileName }) {
  const config = ASSET_CONFIG[assetType];

  if (!config) {
    const supported = Object.keys(ASSET_CONFIG).join(", ");
    throw new Error(`Unsupported assetType "${assetType}". Supported types: ${supported}`);
  }

  const safeName = normalizeFileName(fileName);
  let finalName = safeName;
  if (!safeName.toLowerCase().endsWith(config.extension)) {
    finalName = `${safeName}${config.extension}`;
  }

  const key = path.posix.join(config.folder, finalName);

  return {
    key,
    publicUrl: buildPublicUrl(key),
    contentType: config.contentType,
    field: config.field,
  };
}

module.exports = {
  getAssetLocation,
};

