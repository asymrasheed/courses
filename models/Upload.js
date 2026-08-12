const mongoose = require("mongoose");

const UploadSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    folder: { type: String, required: true }, // course folder under public/uploads/<folder>/
    path: { type: String, required: true }, // public URL, e.g. /uploads/<folder>/<filename>
    // Linked once a question's saved content actually references this file.
    // Uploads left null past a grace period are orphaned and get garbage-collected.
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Upload || mongoose.model("Upload", UploadSchema);
