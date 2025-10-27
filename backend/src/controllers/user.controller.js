const userModel = require("../models/user.model");

async function getMe(req, res) {
  const user = await userModel.getUserById(req.user.user_id);
  res.json(user);
}

async function getUserById(req, res) {
  const user = await userModel.getUserById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const requestingUser = req.user;
  
  
  if (
    requestingUser.role === "ORG_ADMIN" &&
    requestingUser.organization_id !== user.organization_id
  ) {

    return res.status(403).json({ message: "Forbidden: Not authorized to view users from this organization." });
  }
  
  res.json(user);
}

module.exports = {
  getMe,
  getUserById,
};
