const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET";
const JWT_EXPIRES = "30d";

function extractOrgIdsFromUser(user) {
  if (!user || !user.userOrganizations) return [];
  return user.userOrganizations.map(uo => Number(uo.organization_id));
}

function generateToken(user) {
  const organization_ids = extractOrgIdsFromUser(user);
  return jwt.sign(
    {
      user_id: user.user_id,
      role: user.role,
      organization_ids,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

async function register(data) {
  const existing = await userModel.getUserByEmail(data.email);
  if (existing) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await userModel.createUser({
    ...data,
    password: hashed,
  });

  const token = generateToken(user);
  if (user.password) delete user.password;

  return { user, token };
}

async function login({ email, password }) {
  const user = await userModel.getUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = generateToken(user);
  if (user.password) delete user.password;

  return { token, user };
}

module.exports = { register, login };
