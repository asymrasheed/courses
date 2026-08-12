const fs = require("fs/promises");
const path = require("path");

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".ogg", ".mov", ".m4v", ".mkv"]);

// Natural sort so "2-intro" sorts before "10-advanced".
function naturalCompare(a, b) {
  const chunk = (s) => s.match(/\d+|\D+/g) || [];
  const ca = chunk(a);
  const cb = chunk(b);
  const len = Math.max(ca.length, cb.length);
  for (let i = 0; i < len; i++) {
    const x = ca[i] ?? "";
    const y = cb[i] ?? "";
    const nx = Number(x);
    const ny = Number(y);
    if (x !== "" && y !== "" && !Number.isNaN(nx) && !Number.isNaN(ny)) {
      if (nx !== ny) return nx - ny;
    } else if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
}

// Recursively mirrors the on-disk folder structure under `dir` so the UI can
// render it as a real directory tree instead of a flattened list.
async function buildTree(dir, base, courseFolder) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return { folders: [], videos: [] };
  }

  const folders = [];
  const videos = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const relPath = path.relative(base, full).split(path.sep).join("/");

    if (entry.isDirectory()) {
      const child = await buildTree(full, base, courseFolder);
      if (child.videos.length || child.folders.length) {
        folders.push({ name: entry.name, path: relPath, ...child });
      }
    } else if (VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      videos.push({
        path: relPath,
        name: path.basename(entry.name, path.extname(entry.name)),
        url: `/courses/${courseFolder}/${relPath.split("/").map(encodeURIComponent).join("/")}`,
      });
    }
  }

  folders.sort((a, b) => naturalCompare(a.name, b.name));
  videos.sort((a, b) => naturalCompare(a.name, b.name));

  return { folders, videos };
}

function countVideos(node) {
  return node.videos.length + node.folders.reduce((sum, f) => sum + countVideos(f), 0);
}

// Scans public/courses/<courseFolder> and returns it as a folder tree
// mirroring the real directory structure (empty folders are dropped).
async function listCourseVideos(courseFolder) {
  const root = path.join(process.cwd(), "public", "courses", courseFolder);
  const tree = await buildTree(root, root, courseFolder);
  const videoCount = countVideos(tree);
  return { ...tree, videoCount };
}

module.exports = { listCourseVideos, countVideos };
