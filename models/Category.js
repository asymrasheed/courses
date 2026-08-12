const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    color: { type: String, default: "#6366f1" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
