const express = require("express");
const crypto = require("crypto");
const { COOKIE_NAME, signSession, verifySession } = require("../../lib/auth");

const router = express.Router();

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Still run a comparison so the response time doesn't leak length info.
    crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const validEmail = safeEqual(
    String(email).trim().toLowerCase(),
    String(process.env.ADMIN_EMAIL || "").trim().toLowerCase()
  );
  const validPassword = safeEqual(password, process.env.ADMIN_PASSWORD || "");

  if (!validEmail || !validPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = await signSession({ email: process.env.ADMIN_EMAIL });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/",
  });

  res.json({ email: process.env.ADMIN_EMAIL });
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.status(204).end();
});

router.get("/me", async (req, res) => {
  const session = await verifySession(req.cookies?.[COOKIE_NAME]);
  if (!session) return res.status(401).json({ error: "Not authenticated" });
  res.json({ email: session.email });
});

module.exports = router;
