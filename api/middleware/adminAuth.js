// Admin authorization helper
const isAdmin = (auth0Id) => {
  return auth0Id === process.env.ADMIN_AUTH0_ID;
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  const auth0Id = req.auth0Id;

  if (!auth0Id) {
    return res.status(401).json({ error: "Missing Auth0 user ID" });
  }

  if (!isAdmin(auth0Id)) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

module.exports = { isAdmin, requireAdmin };
