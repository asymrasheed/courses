const fs = require("fs/promises");
const path = require("path");
const Upload = require("../models/Upload");

// Uploads the editor sent to the server but that never ended up in a saved
// question (dropped draft, failed save, image swapped before submit) are
// deleted once they've sat unlinked longer than this grace period.
const GRACE_MS = (Number(process.env.UPLOAD_GRACE_HOURS) || 2) * 60 * 60 * 1000;

async function cleanupOrphanedUploads() {
  const cutoff = new Date(Date.now() - GRACE_MS);
  const orphans = await Upload.find({ question: null, createdAt: { $lt: cutoff } });

  for (const doc of orphans) {
    const filePath = path.join(process.cwd(), "public", "uploads", doc.folder, doc.filename);
    await fs.unlink(filePath).catch(() => {});
    await doc.deleteOne();
  }

  return orphans.length;
}

module.exports = { cleanupOrphanedUploads };
