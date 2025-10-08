import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URL);
const bucketBase = "https://media.belovedzguard.com/animated-song-thumbnails";

// Same improved slugify (handles &, apostrophes, diacritics)
function slugify(title) {
  return String(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function run() {
  await client.connect();
  const db = client.db();
  const songs = db.collection("songs");

  const allSongs = await songs.find({}).toArray();
  console.log(`Found ${allSongs.length} songs\n`);

  let modified = 0;

  for (const s of allSongs) {
    const slug = slugify(s.title || "");
    const targetUrl = `${bucketBase}/${slug}.mp4`;

    const hasNew =
      typeof s.animatedSongThumbnail === "string" &&
      s.animatedSongThumbnail.length > 0;
    const hasOld =
      typeof s.animatedThumbnail === "string" && s.animatedThumbnail.length > 0;

    const needsSetNew = !hasNew || s.animatedSongThumbnail !== targetUrl;
    const needsUnsetOld = hasOld;

    const update = {};
    if (needsSetNew) {
      update.$set = {
        ...(update.$set || {}),
        animatedSongThumbnail: targetUrl,
      };
    }
    if (needsUnsetOld) {
      update.$unset = { ...(update.$unset || {}), animatedThumbnail: "" };
    }

    if (Object.keys(update).length > 0) {
      await songs.updateOne({ _id: s._id }, update);
      modified++;
      console.log(`✔ Updated: ${s.title}`);
    }
  }

  console.log(`\n✅ Done. Modified ${modified} documents.`);
  await client.close();
}

run().catch(async (e) => {
  console.error("Update error:", e);
  await client.close();
});
