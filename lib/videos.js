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

async function walk(dir, base) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full, base)));
    } else if (VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return files;
}

// Scans public/<courseFolder> for video files and groups them into sections
// by their top-level subfolder (null/"" section = videos directly in the course folder).
async function listCourseVideos(courseFolder) {
  const root = path.join(process.cwd(), "public", "courses", courseFolder);
  const relPaths = await walk(root, root);
  relPaths.sort(naturalCompare);

  const sectionsByKey = new Map();
  for (const rel of relPaths) {
    const parts = rel.split("/");
    const sectionName = parts.length > 1 ? parts[0] : null;
    const key = sectionName || "";
    if (!sectionsByKey.has(key)) {
      sectionsByKey.set(key, { name: sectionName, videos: [] });
    }
    sectionsByKey.get(key).videos.push({
      path: rel,
      name: path.basename(rel, path.extname(rel)),
      url: `/courses/${courseFolder}/${rel.split("/").map(encodeURIComponent).join("/")}`,
    });
  }

  const sections = Array.from(sectionsByKey.values());
  sections.sort((a, b) => {
    if (a.name === null) return -1;
    if (b.name === null) return 1;
    return naturalCompare(a.name, b.name);
  });

  return sections;
}

module.exports = { listCourseVideos };
