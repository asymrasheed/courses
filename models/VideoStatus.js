const mongoose = require("mongoose");

const STATUSES = ["pending", "learning", "done"];

const VideoStatusSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    // Path of the video this status applies to, relative to the course folder.
    video: { type: String, required: true },
    status: { type: String, enum: STATUSES, default: "pending" },
  },
  { timestamps: true }
);

VideoStatusSchema.index({ course: 1, video: 1 }, { unique: true });

const VideoStatus =
  mongoose.models.VideoStatus || mongoose.model("VideoStatus", VideoStatusSchema);

module.exports = { VideoStatus, STATUSES };
