import ImageKit from "@imagekit/nodejs";

// ✅ SOLUTION IN USE — Lazy Initialization
// ImageKit client is created only when the first request arrives,
// by which time dotenv.config() in app.js has already run.
// This avoids the ES Module ordering problem where storage.service.js
// is evaluated BEFORE app.js (and therefore before dotenv loads .env).

let imagekitClient;

function getClient() {
  if (!imagekitClient) {
    imagekitClient = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imagekitClient;
}

async function uploadFile(file) {
  try {
    const result = await getClient().files.upload({
      file,
      fileName: "music_" + Date.now(),
      folder: "spotify-backend/music",
    });

    return result;
  } catch (error) {
    console.error("Error uploading file to ImageKit:", error);
    return null;
  }
}

export { uploadFile };

// ─────────────────────────────────────────────────────────────────
// OTHER SOLUTIONS FOR THE SAME PROBLEM (for reference)
// ─────────────────────────────────────────────────────────────────

// SOLUTION 2 — Node.js built-in --env-file flag (no dotenv needed)
// Change package.json scripts to:
//   "dev":   "npx nodemon --env-file=.env server.js"
//   "start": "node --env-file=.env server.js"
// This loads .env at the OS process level, BEFORE any JS module runs.
// With this, the original simple code below works perfectly:
//
// import ImageKit from "@imagekit/nodejs";
// const imagekitClient = new ImageKit({
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
//   publicKey:  process.env.IMAGEKIT_PUBLIC_KEY,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
// });
// ─────────────────────────────────────────────────────────────────

// SOLUTION 3 — import 'dotenv/config' as the FIRST import in server.js
// Since ES modules evaluate imports depth-first, dotenv/config (being
// a leaf with no dependency on your code) runs before everything else.
//
// server.js:
//   import 'dotenv/config'      // ← MUST be first
//   import app from './src/app.js'
//   ...
//
// ⚠️  Fragile: if imports are ever reordered, the bug comes back.
// ─────────────────────────────────────────────────────────────────

// export { uploadFile };
