require("dotenv").config();
require("./api/models/Users");
require("./api/models/Songs");
require("./api/models/Playlists");
const server = require("./api/server");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 9000;

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongo connected successfully"))
  .catch((err) => console.log("it has an error", err));

server.listen(PORT, () => {
  console.log(`server running successfully on port ${PORT}`);
});
