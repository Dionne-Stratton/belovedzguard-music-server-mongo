const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getAssetLocation } = require("../utils/assets");
const { isAdmin } = require("../middleware/adminAuth");

let r2Client;

function getR2Client() {
  if (r2Client) return r2Client;

  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("Missing Cloudflare R2 credentials or endpoint configuration.");
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return r2Client;
}

exports.createPresignedUpload = async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    if (!auth0Id) {
      return res.status(401).json({ error: "Missing Auth0 user ID" });
    }

    if (!isAdmin(auth0Id)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { assetType, fileName } = req.body || {};

    if (!assetType || !fileName) {
      return res.status(400).json({ error: "assetType and fileName are required" });
    }

    const { key, publicUrl, contentType, field } = getAssetLocation({ assetType, fileName });
    const bucket = process.env.CLOUDFLARE_R2_BUCKET;

    if (!bucket) {
      throw new Error("Missing environment variable: CLOUDFLARE_R2_BUCKET");
    }

    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });

    res.json({
      uploadUrl,
      key,
      publicUrl,
      field,
      expiresIn: 300,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

