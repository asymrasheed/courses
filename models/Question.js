const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    question: { type: String, required: true }, // rich text HTML
    answer: { type: String, required: true }, // rich text HTML
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Question || mongoose.model("Question", QuestionSchema);
