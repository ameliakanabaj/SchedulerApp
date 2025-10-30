const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET";
const JWT_EXPIRES = "30d";

function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      role: user.role,
      organization_id: user.organization_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

async function getMe(req, res, next) {
  try {
    const user = await userModel.getUserById(req.user.user_id);
    if (!user) return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });

    const requester = req.user;
    if (requester.role === "ORG_ADMIN" && requester.organization_id !== user.organization_id) {
      return next({ type: "BUSINESS_LOGIC", message: "Forbidden: You can only view users from your organization", statusCode: 403 });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const requester = req.user;
    let users;

    if (requester.role === "GLOBAL_ADMIN") {
      users = await userModel.getAllUsers();
    } else if (requester.role === "ORG_ADMIN") {
      users = await userModel.getUsersByOrganization(requester.organization_id);
    } else {
      return next({ type: "BUSINESS_LOGIC", message: "Forbidden", statusCode: 403 });
    }

    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { organization_id, first_name, last_name, email, password, role, position } = req.body;

    if (req.user.role === "ORG_ADMIN" && organization_id !== req.user.organization_id) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only create users in your organization",
        statusCode: 403,
      });
    }

    const existing = await userModel.getUserByEmail(email);
    if (existing) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Email already in use",
        statusCode: 400,
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      organization_id,
      first_name,
      last_name,
      email,
      password_hash,
      role,
      position,
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
      token,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
    getMe, 
    getUserById, 
    getAllUsers, 
    createUser 
};
