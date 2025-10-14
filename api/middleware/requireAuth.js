// middleware/requireAuth.js
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const mongoose = require("mongoose");
const MusicUser = mongoose.model("MusicUser");

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
  console.warn("⚠️  AUTH0_DOMAIN or AUTH0_AUDIENCE missing from environment.");
}

// 1️⃣ Verify JWT signature / issuer
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

// 2️⃣ Ensure corresponding MusicUser exists
const ensureUser = async (req, res, next) => {
  try {
    const payload = req.auth?.payload || req.auth;
    const sub = payload?.sub;
    const displayName = payload?.name || "New User";

    if (!sub) {
      return res.status(401).json({ error: "Unauthorized: missing sub claim" });
    }

    let user = await MusicUser.findOne({ auth0Id: sub });

    // Create new record if none exists
    if (!user) {
      try {
        user = await MusicUser.create({
          auth0Id: sub,
          displayName,
        });
      } catch (createErr) {
        console.error("❌ Failed to create MusicUser:", createErr);
        return res.status(500).json({
          error: "Failed to create user record for Auth0 account",
        });
      }
    }

    req.user = user;
    req.userId = user._id;
    req.auth0Id = sub;
    next();
  } catch (err) {
    console.error("❌ ensureUser middleware error:", err);
    if (err.name === "UnauthorizedError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    res.status(500).json({ error: "Authentication middleware failed" });
  }
};

module.exports = [checkJwt, ensureUser];
