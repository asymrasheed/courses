require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const next = require("next");
const connectDB = require("./lib/mongodb");
const requireAuth = require("./server/middleware/requireAuth");
const authRoutes = require("./server/routes/auth");
const categoryRoutes = require("./server/routes/categories");
const courseRoutes = require("./server/routes/courses");
const questionRoutes = require("./server/routes/questions");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3006;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function main() {
  await connectDB();
  await app.prepare();

  const server = express();

  server.use(express.json());
  server.use(cookieParser());

  server.use("/api/auth", authRoutes);
  server.use("/api/categories", requireAuth, categoryRoutes);
  server.use("/api/courses", requireAuth, courseRoutes);
  server.use("/api/questions", requireAuth, questionRoutes);

  // JSON error handler for the API routes above
  server.use("/api", (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  });

  // Everything else is handled by Next.js (pages, app router, static assets)
  server.all(/(.*)/, (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
