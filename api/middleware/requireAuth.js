const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const AUTH0_DOMAIN_DEV = process.env.AUTH0_DOMAIN_DEV;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

if (!AUTH0_DOMAIN_DEV || !AUTH0_AUDIENCE) {
  console.warn(
    "⚠️ AUTH0_DOMAIN_DEV or AUTH0_AUDIENCE missing from environment."
  );
}

// ------------------------------
// Verify JWT signature / issuer
// ------------------------------
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

// ------------------------------
// Handle any 401s cleanly
// ------------------------------
const jwtErrorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    console.error("❌ JWT rejected:", err.code, err.message);
    return res.status(401).json({ error: "Invalid or mismatched token" });
  }
  next(err);
};

// ------------------------------
// Extract Auth0 sub from token
// ------------------------------
const attachAuth0Sub = (req, res, next) => {
  try {
    const payload = req.auth?.payload || req.auth;
    const sub = payload?.sub;

    if (!sub) {
      console.warn("⚠️ Missing sub claim in token payload");
      return res.status(401).json({ error: "Unauthorized: missing sub claim" });
    }

    req.auth0Id = sub;
    req.userSub = sub; // optional alias, useful in logs
    next();
  } catch (err) {
    console.error("❌ Failed to extract Auth0 sub:", err);
    res.status(500).json({ error: "Failed to process token" });
  }
};

module.exports = [checkJwt, jwtErrorHandler, attachAuth0Sub];
