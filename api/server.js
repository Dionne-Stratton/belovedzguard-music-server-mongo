const express = require("express");
const cors = require("cors");

const songRouter = require("./routes/songs");
const userRouter = require("./routes/users");
const albumsRouter = require("./routes/albums");

const server = express();

server.use(express.json());
server.use(cors());

server.use("/songs", songRouter);
server.use("/users", userRouter);
server.use("/albums", albumsRouter);

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
