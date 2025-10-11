// middleware/requireAuth.js
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const mongoose = require("mongoose");
const MusicUser = mongoose.model("MusicUser");

// Read from .env (you already set these)
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
  console.warn("⚠️ AUTH0_DOMAIN or AUTH0_AUDIENCE missing from environment.");
}

// 1) Verify the JWT from Auth0
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: AUTH0_AUDIENCE,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

// 2) Ensure there's a corresponding MusicUser and attach it to req
const ensureUser = async (req, res, next) => {
  try {
    // express-jwt puts the claims at req.auth (payload at req.auth.payload)
    const payload = req.auth?.payload || req.auth;
    const sub = payload?.sub;
    if (!sub)
      return res.status(401).json({ error: "Unauthorized: missing sub" });

    // Prefer email/name from token if present
    const emailFromToken = payload?.email;
    const nameFromToken = payload?.name;

    // Try find by auth0Id first
    let user = await MusicUser.findOne({ auth0Id: sub });

    // If not found, try to link existing local user by email (if any)
    if (!user && emailFromToken) {
      user = await MusicUser.findOne({ email: emailFromToken });
      if (user) {
        user.auth0Id = sub;
        await user.save();
      }
    }

    // Still not found? Create a new MusicUser for this Auth0 account.
    if (!user) {
      const fallbackEmail = (
        emailFromToken || `${sub.replace("|", "_")}@auth0.local`
      ).toLowerCase();
      user = await MusicUser.create({
        auth0Id: sub,
        email: fallbackEmail, // your model requires email
        displayName: nameFromToken || "New User",
        // no password for Auth0 accounts (model should allow this when auth0Id exists)
      });
    }

    // Attach for downstream routes (supports both old and new code paths)
    req.user = user; // legacy usage: req.user._id
    req.userId = user._id; // convenience
    req.auth0Id = sub; // convenience

    next();
  } catch (err) {
    console.error("ensureUser error:", err);
    res.status(500).json({ error: "Failed to resolve user" });
  }
};

// Export as a middleware chain (same requireAuth usage as before)
module.exports = [checkJwt, ensureUser];
