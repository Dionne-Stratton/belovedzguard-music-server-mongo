const express = require("express");
const cors = require("cors");

const songRouter = require("./routes/songs");
const userRouter = require("./routes/users");
const albumsRouter = require("./routes/albums");
const public = require("./middleware/public");

const server = express();

server.use(express.json());
server.use(cors());

//legacy from before, can be removed later
server.use("/songs", songRouter);
server.use("/users", userRouter);

// New API routes
server.use("/api/songs", songRouter);
server.use("/api/users", userRouter);
server.use("/api/albums", albumsRouter);
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
