const { COOKIE_NAME, verifySession } = require("../../lib/auth");

async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const session = await verifySession(token);

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  req.user = session;
  next();
}

module.exports = requireAuth;
