const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET";
const JWT_EXPIRES = "30d";

async function register(data) {
  const existing = await userModel.getUserByEmail(data.email);
  if (existing) throw new Error("Email already exists");

  const password_hash = await bcrypt.hash(data.password, 10);
  const user = await userModel.createUser({
    ...data,
    password_hash,
  });

  return user;
}

async function login({ email, password }) {
  const user = await userModel.getUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { user_id: user.user_id, role: user.role, organization_id: user.organization_id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return { token, user };
}

module.exports = { register, login };
