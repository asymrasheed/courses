const express = require("express");
const Question = require("../../models/Question");
const Course = require("../../models/Course");
const Upload = require("../../models/Upload");
const { syncQuestionUploads } = require("../../lib/uploads");

const router = express.Router();

// GET /api/questions?course=<id>&video=<path|"">&category=<slug>&search=<text>
// video="" filters to general (video-less) notes only; omit video to get everything.
// No filters -> every note, populated with course + category (explore view)
router.get("/", async (req, res) => {
  const { course, video, category, search } = req.query;
  const filter = {};

  if (course) filter.course = course;
  if (video !== undefined) filter.video = video || null;
  if (search) filter.title = { $regex: search, $options: "i" };

  let questions = await Question.find(filter)
    .populate({ path: "course", populate: { path: "category" } })
    .sort({ course: 1, video: 1, timestamp: 1 })
    .lean();

  if (category) {
    questions = questions.filter(
      (q) => q.course?.category?.slug === category
    );
  }

  res.json(questions);
});

// POST /api/questions — create a note, optionally anchored to a video + timestamp
router.post("/", async (req, res) => {
  const { course, video, timestamp, title, notes } = req.body || {};
  if (!course || !title || !notes) {
    return res
      .status(400)
      .json({ error: "course, title and notes are required" });
  }

  const courseDoc = await Course.findById(course);
  if (!courseDoc) return res.status(400).json({ error: "Invalid course" });

  let seconds = null;
  if (video) {
    seconds = Number(timestamp);
    if (Number.isNaN(seconds) || seconds < 0) {
      return res.status(400).json({ error: "timestamp must be a non-negative number" });
    }
  }

  const doc = await Question.create({
    course,
    video: video || null,
    timestamp: seconds,
    title,
    notes,
  });

  await syncQuestionUploads(doc._id, [notes]);

  res.status(201).json(doc);
});

// PUT /api/questions/:id — update
router.put("/:id", async (req, res) => {
  const { title, notes, timestamp } = req.body || {};
  const doc = await Question.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Question not found" });

  if (title !== undefined) doc.title = title;
  if (notes !== undefined) doc.notes = notes;
  if (timestamp !== undefined && doc.video) {
    const seconds = Number(timestamp);
    if (Number.isNaN(seconds) || seconds < 0) {
      return res.status(400).json({ error: "timestamp must be a non-negative number" });
    }
    doc.timestamp = seconds;
  }

  await doc.save();
  await syncQuestionUploads(doc._id, [doc.notes]);

  res.json(doc);
});

// DELETE /api/questions/:id
router.delete("/:id", async (req, res) => {
  const doc = await Question.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: "Question not found" });
  await Upload.updateMany({ question: doc._id }, { question: null });
  res.status(204).end();
});

module.exports = router;
