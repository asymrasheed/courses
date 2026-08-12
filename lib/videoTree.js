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

// Whether this folder (or one of its subfolders) contains the given video path.
export function folderContainsPath(node, path) {
  if (!path) return false;
  return (
    node.videos.some((v) => v.path === path) ||
    node.folders.some((f) => folderContainsPath(f, path))
  );
}

// Returns a copy of the tree containing only videos whose name matches the
// search term (case-insensitive), pruning folders left with no matches.
// Returns null when nothing in this subtree matches.
export function filterVideoTree(node, term) {
  const lower = term.trim().toLowerCase();
  if (!lower) return node;

  const videos = node.videos.filter((v) => v.name.toLowerCase().includes(lower));
  const folders = node.folders.map((f) => filterVideoTree(f, term)).filter(Boolean);

  if (!videos.length && !folders.length) return null;
  return { ...node, videos, folders };
}
