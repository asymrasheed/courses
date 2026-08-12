const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const Upload = require("../../models/Upload");

const router = express.Router();

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);

function sanitizeFolder(folder) {
  const cleaned = String(folder || "misc").toLowerCase().replace(/[^a-z0-9-]/g, "");
  return cleaned || "misc";
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const folder = sanitizeFolder(req.query.folder);
      const dir = path.join(process.cwd(), "public", "uploads", folder);
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, ALLOWED_EXTENSIONS.has(path.extname(file.originalname).toLowerCase()));
  },
});

// POST /api/uploads?folder=<course-folder> — upload an image for the rich text editor
router.post("/", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed" });
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded, or file type not allowed" });
    }

    const folder = sanitizeFolder(req.query.folder);
    const url = `/uploads/${folder}/${req.file.filename}`;
    const doc = await Upload.create({ filename: req.file.filename, folder, path: url });
    res.status(201).json({ url, id: doc._id });
  });
});

module.exports = router;
