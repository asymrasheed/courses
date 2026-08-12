// Client-safe helpers for the folder-tree shape returned by
// GET /api/courses/:id/videos (see lib/videos.js on the server side).

export function countVideos(node) {
  return node.videos.length + node.folders.reduce((sum, f) => sum + countVideos(f), 0);
}

// Depth-first traversal (own videos, then each subfolder) into a flat,
// ordered list — used for prev/next navigation and for finding a video by path.
// Each video is tagged with `section` (its immediate parent folder's name, if any).
export function flattenVideoTree(node, sectionName = null) {
  const list = node.videos.map((video) => ({ ...video, section: sectionName }));
  for (const folder of node.folders) {
    list.push(...flattenVideoTree(folder, folder.name));
  }
  return list;
}
