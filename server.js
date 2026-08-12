const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3006;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(express.json());

  // Custom Express API routes live here, separate from Next.js
  server.get("/api/express/hello", (req, res) => {
    res.json({ message: "Hello from the Express API!" });
  });

  // Everything else is handled by Next.js (pages, app router, static assets)
  server.all(/(.*)/, (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
