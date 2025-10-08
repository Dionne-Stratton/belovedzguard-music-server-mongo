import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URL);
const bucketBase = "https://media.belovedzguard.com/animated-song-thumbnails";

// Improved slugify: handles &, apostrophes, diacritics
function slugify(title) {
  return String(title)
    .toLowerCase()
    .normalize("NFKD") // split diacritics
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/&/g, " and ") // replace & → and
    .replace(/['’]/g, "") // drop apostrophes
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/(^-|-$)/g, ""); // trim leading/trailing hyphens
}

async function run() {
  await client.connect();
  const db = client.db();
  const songs = db.collection("songs");

  const docs = await songs.find({}).toArray();
  console.log(`Found ${docs.length} songs\n`);

  let willSetNew = 0;
  let willUnsetOld = 0;
  let noChange = 0;

  for (const s of docs) {
    const slug = slugify(s.title || "");
    const targetUrl = `${bucketBase}/${slug}.mp4`;

    const hasNew =
      typeof s.animatedSongThumbnail === "string" &&
      s.animatedSongThumbnail.length > 0;
    const hasOld =
      typeof s.animatedThumbnail === "string" && s.animatedThumbnail.length > 0;

    const needsSetNew = !hasNew || s.animatedSongThumbnail !== targetUrl;
    const needsUnsetOld = hasOld; // always remove old key if present

    console.log(`🎵 ${s.title}`);
    console.log(
      `   current.animatedSongThumbnail: ${
        hasNew ? s.animatedSongThumbnail : "(missing)"
      }`
    );
    console.log(
      `   current.animatedThumbnail    : ${
        hasOld ? s.animatedThumbnail : "(missing)"
      }`
    );
    console.log(`   target                       : ${targetUrl}`);
    console.log(
      `   plan: ${needsSetNew ? "SET animatedSongThumbnail" : "keep"}${
        needsUnsetOld ? " + UNSET animatedThumbnail" : ""
      }\n`
    );

    if (needsSetNew) willSetNew++;
    if (needsUnsetOld) willUnsetOld++;
    if (!needsSetNew && !needsUnsetOld) noChange++;
  }

  console.log(`Summary:`);
  console.log(`  Will SET animatedSongThumbnail → ${willSetNew}`);
  console.log(`  Will UNSET animatedThumbnail   → ${willUnsetOld}`);
  console.log(`  No change                      → ${noChange}`);
  console.log(`\n(Dry-run only — no database writes were made.)`);

  await client.close();
}

run().catch(async (e) => {
  console.error("Dry-run error:", e);
  await client.close();
});
