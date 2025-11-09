const express = require("express");
const cors = require("cors");

const songRouter = require("./routes/songs");
const userRouter = require("./routes/users");
const albumsRouter = require("./routes/albums");
const uploadsRouter = require("./routes/uploads");
const public = require("./routes/public");
const requireAuth = require("./middleware/requireAuth");

const server = express();

server.use(express.json());
server.use(cors());

server.use("/api/songs", requireAuth, songRouter);
server.use("/api/users", requireAuth, userRouter);
server.use("/api/albums", requireAuth, albumsRouter);
server.use("/api/uploads", requireAuth, uploadsRouter);
server.use("/api/public", public);

server.use((err, req, res, next) => {
  // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

server.get("/", (req, res) => {
  res.send(`Welcome to my API!!`);
});

module.exports = server;
