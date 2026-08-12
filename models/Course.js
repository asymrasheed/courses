const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    // Folder under /public where videos for this course are uploaded.
    // Fixed at creation time — renaming the course must not orphan uploaded videos.
    folder: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Course || mongoose.model("Course", CourseSchema);
