const rateLimit = require("express-rate-limit");

// Rate limiting for contact form - 3 submissions per IP per hour
const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    error: "Too many contact form submissions. Please try again in an hour.",
    retryAfter: "1 hour",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests (only count failed ones)
  skipSuccessfulRequests: false,
  // Custom key generator to use IP address
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  // Custom handler for when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many contact form submissions. Please try again in an hour.",
      retryAfter: "1 hour",
      limit: 3,
      windowMs: "1 hour",
    });
  },
});

module.exports = contactFormLimiter;
