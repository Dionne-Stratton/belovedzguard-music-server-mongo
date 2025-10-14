const mongoose = require("mongoose");
const User = mongoose.model("MusicUser");

// ===============================
// USER CRUD CONTROLLERS (SAFE)
// ===============================

// READ current user
exports.getCurrentUser = async (req, res) => {
  const userId = req.userId;

  // 🛡️ Guard against missing or invalid ID
  if (!userId) {
    return res.status(401).json({ error: "No user ID provided" });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const currentUser = await User.findById(userId).exec();
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(currentUser);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE current user
exports.updateCurrentUser = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "No user ID provided" });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    }).exec();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE current user
exports.deleteCurrentUser = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "No user ID provided" });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId).exec();

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: `User ${deletedUser._id} deleted` });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
};
