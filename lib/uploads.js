const Upload = require("../models/Upload");

function extractUploadFilenames(html) {
  const matches = [...String(html || "").matchAll(/\/uploads\/[a-z0-9-]+\/([a-zA-Z0-9._-]+)/g)];
  return matches.map((m) => m[1]);
}

// Re-links Upload docs referenced in this question's saved HTML to it, and
// unlinks any it previously referenced but no longer does — so removed/replaced
// images become eligible for the orphan cleanup job again.
async function syncQuestionUploads(questionId, htmlBlocks) {
  const filenames = htmlBlocks.flatMap(extractUploadFilenames);

  await Upload.updateMany({ question: questionId }, { question: null });
  if (filenames.length) {
    await Upload.updateMany({ filename: { $in: filenames } }, { question: questionId });
  }
}

module.exports = { syncQuestionUploads };
