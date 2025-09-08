const express = require("express");
const cors = require("cors");

const songRouter = require("./routes/songRoutes");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

const server = express();

server.use(express.json());
server.use(cors());

server.use("/songs", songRouter);
server.use("/auth", authRouter);
server.use("/users", userRouter);

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
