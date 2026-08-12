const express = require("express");
const Question = require("../../models/Question");
const Course = require("../../models/Course");

const router = express.Router();

// GET /api/questions?course=<id>&category=<slug>&search=<text>
// No filters -> every question, populated with course + category (explore view)
router.get("/", async (req, res) => {
  const { course, category, search } = req.query;
  const filter = {};

  if (course) filter.course = course;
  if (search) filter.question = { $regex: search, $options: "i" };

  let query = Question.find(filter)
    .populate({ path: "course", populate: { path: "category" } })
    .sort({ course: 1, order: 1, createdAt: 1 })
    .lean();

  let questions = await query;

  if (category) {
    questions = questions.filter(
      (q) => q.course?.category?.slug === category
    );
  }

  res.json(questions);
});

// POST /api/questions — create
router.post("/", async (req, res) => {
  const { course, question, answer } = req.body || {};
  if (!course || !question || !answer) {
    return res
      .status(400)
      .json({ error: "course, question and answer are required" });
  }

  const courseDoc = await Course.findById(course);
  if (!courseDoc) return res.status(400).json({ error: "Invalid course" });

  const lastQuestion = await Question.findOne({ course }).sort({ order: -1 });
  const order = lastQuestion ? lastQuestion.order + 1 : 0;

  const doc = await Question.create({ course, question, answer, order });
  res.status(201).json(doc);
});

// PUT /api/questions/:id — update
router.put("/:id", async (req, res) => {
  const { question, answer, order } = req.body || {};
  const doc = await Question.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Question not found" });

  if (question !== undefined) doc.question = question;
  if (answer !== undefined) doc.answer = answer;
  if (order !== undefined) doc.order = order;

  await doc.save();
  res.json(doc);
});

// DELETE /api/questions/:id
router.delete("/:id", async (req, res) => {
  const doc = await Question.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: "Question not found" });
  res.status(204).end();
});

module.exports = router;
