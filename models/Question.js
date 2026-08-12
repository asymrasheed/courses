const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    // Path of the video this note is anchored to, relative to the course folder.
    // Null for a general course note (e.g. added before any videos are uploaded).
    video: { type: String, default: null },
    // Seconds into the video where this note applies. Null when there's no video.
    timestamp: { type: Number, default: null, min: 0 },
    title: { type: String, required: true }, // plain text
    notes: { type: String, required: true }, // rich text HTML
  },
  { timestamps: true }
);

QuestionSchema.index({ course: 1, video: 1, timestamp: 1 });

module.exports =
  mongoose.models.Question || mongoose.model("Question", QuestionSchema);
