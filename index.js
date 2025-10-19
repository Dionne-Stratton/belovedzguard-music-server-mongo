require("dotenv").config();
require("./api/models/User");
require("./api/models/Song");
require("./api/models/Playlist");
require("./api/models/Album");
const server = require("./api/server");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 9000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("mongo connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

server.listen(PORT, () => {
  console.log(`server running successfully on port ${PORT}`);
});
