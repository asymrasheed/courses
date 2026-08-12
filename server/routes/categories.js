const express = require("express");
const Category = require("../../models/Category");
const Course = require("../../models/Course");
const { makeUniqueSlug } = require("../../lib/slug");

const router = express.Router();

// GET /api/categories — list all, with course counts
router.get("/", async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  const counts = await Course.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  res.json(
    categories.map((c) => ({
      ...c,
      courseCount: countMap.get(String(c._id)) || 0,
    }))
  );
});

// GET /api/categories/:slug — single category by slug
router.get("/:slug", async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) return res.status(404).json({ error: "Category not found" });
  const courseCount = await Course.countDocuments({ category: category._id });
  res.json({ ...category, courseCount });
});

// POST /api/categories — create
router.post("/", async (req, res) => {
  const { name, description = "", color } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  const slug = await makeUniqueSlug(Category, name);
  const category = await Category.create({
    name: name.trim(),
    slug,
    description,
    ...(color ? { color } : {}),
  });

  res.status(201).json(category);
});

// PUT /api/categories/:id — update
router.put("/:id", async (req, res) => {
  const { name, description, color } = req.body || {};
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });

  if (name && name.trim() && name.trim() !== category.name) {
    category.name = name.trim();
    category.slug = await makeUniqueSlug(Category, name, category._id);
  }
  if (description !== undefined) category.description = description;
  if (color) category.color = color;

  await category.save();
  res.json(category);
});

// DELETE /api/categories/:id — delete (blocked if courses still reference it)
router.delete("/:id", async (req, res) => {
  const courseCount = await Course.countDocuments({ category: req.params.id });
  if (courseCount > 0) {
    return res.status(409).json({
      error: `Cannot delete: ${courseCount} course(s) still belong to this category`,
    });
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });
  res.status(204).end();
});

module.exports = router;
