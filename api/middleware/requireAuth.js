// middleware/requireAuth.js
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const mongoose = require("mongoose");
const MusicUser = mongoose.model("MusicUser");

const AUTH0_DOMAIN_DEV = process.env.AUTH0_DOMAIN_DEV;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

if (!AUTH0_DOMAIN_DEV || !AUTH0_AUDIENCE) {
  console.warn(
    "⚠️ AUTH0_DOMAIN_DEV or AUTH0_AUDIENCE missing from environment."
  );
}

// Always log the incoming Authorization header
const logAuthHeader = (req, res, next) => {
  const auth = req.headers.authorization || "(none)";
  console.log(
    `➡️  ${req.method} ${req.originalUrl} | Auth header: ${auth.slice(
      0,
      50
    )}...`
  );
  next();
};

// Verify JWT signature / issuer
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${AUTH0_DOMAIN_DEV}/.well-known/jwks.json`,
  }),
  audience: AUTH0_AUDIENCE,
  issuer: `https://${AUTH0_DOMAIN_DEV}/`,
  algorithms: ["RS256"],
}).unless({
  path: [], // none skipped
});

//  Catch any JWT 401s explicitly
const jwtErrorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    console.error("❌ JWT rejected:", err.code, err.message);
    return res.status(401).json({ error: "Invalid or mismatched token" });
  }
  next(err);
};

// Ensure corresponding MusicUser exists
const ensureUser = async (req, res, next) => {
  console.log("🔹 ensureUser middleware hit");

  try {
    const payload = req.auth?.payload || req.auth;
    const sub = payload?.sub;
    const displayName = payload?.name || "New User";

    console.log("🔸 Auth0 payload:", JSON.stringify(payload, null, 2));
    console.log("🔸 Auth0 sub:", sub);
    console.log("🔸 displayName:", displayName);

    if (!sub) {
      console.warn("⚠️ Missing sub claim in token payload");
      return res.status(401).json({ error: "Unauthorized: missing sub claim" });
    }

    let user = await MusicUser.findOne({ auth0Id: sub });
    if (user) {
      console.log(`✅ Found existing MusicUser for sub ${sub}: ${user._id}`);
    }

    // Create new record if none exists
    if (!user) {
      console.log(`⚙️ No MusicUser found for ${sub}. Creating new record...`);
      try {
        user = await MusicUser.create({
          auth0Id: sub,
          displayName,
        });
        console.log(`✅ Created new MusicUser ${user._id} for sub ${sub}`);
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

    console.log(`➡️ Attached user ${user._id} to request`);
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

module.exports = [logAuthHeader, checkJwt, jwtErrorHandler, ensureUser];
