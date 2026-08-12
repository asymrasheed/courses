const express = require("express");
const Course = require("../../models/Course");
const Category = require("../../models/Category");
const Question = require("../../models/Question");
const { makeUniqueSlug } = require("../../lib/slug");

const router = express.Router();

// GET /api/courses?category=<slug>&search=<text> — list, with question counts
router.get("/", async (req, res) => {
  const { category, search } = req.query;
  const filter = {};

  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (!cat) return res.json([]);
    filter.category = cat._id;
  }
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const courses = await Course.find(filter)
    .populate("category")
    .sort({ createdAt: -1 })
    .lean();

  const counts = await Question.aggregate([
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  res.json(
    courses.map((c) => ({
      ...c,
      questionCount: countMap.get(String(c._id)) || 0,
    }))
  );
});

// GET /api/courses/:id — single course
router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id).populate("category").lean();
  if (!course) return res.status(404).json({ error: "Course not found" });
  const questionCount = await Question.countDocuments({ course: course._id });
  res.json({ ...course, questionCount });
});

// POST /api/courses — create
router.post("/", async (req, res) => {
  const { title, description = "", category } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) return res.status(400).json({ error: "Invalid category" });

  const slug = await makeUniqueSlug(Course, title);
  const course = await Course.create({
    title: title.trim(),
    slug,
    description,
    category,
  });

  res.status(201).json(await course.populate("category"));
});

// PUT /api/courses/:id — update
router.put("/:id", async (req, res) => {
  const { title, description, category } = req.body || {};
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });

  if (title && title.trim() && title.trim() !== course.title) {
    course.title = title.trim();
    course.slug = await makeUniqueSlug(Course, title, course._id);
  }
  if (description !== undefined) course.description = description;
  if (category) {
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) return res.status(400).json({ error: "Invalid category" });
    course.category = category;
  }

  await course.save();
  res.json(await course.populate("category"));
});

// DELETE /api/courses/:id — delete course and its questions
router.delete("/:id", async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  await Question.deleteMany({ course: course._id });
  res.status(204).end();
});

module.exports = router;
