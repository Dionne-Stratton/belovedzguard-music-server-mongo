const mongoose = require("mongoose");
const User = mongoose.model("MusicUser");

// ===============================
// USER CRUD CONTROLLERS
// ===============================

// READ current user
exports.getCurrentUser = async (req, res) => {
  const userId = req.userId;
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(currentUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE current user
exports.updateCurrentUser = async (req, res) => {
  const userId = req.userId;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE current user
exports.deleteCurrentUser = async (req, res) => {
  const userId = req.userId;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: `User ${deletedUser._id} deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
