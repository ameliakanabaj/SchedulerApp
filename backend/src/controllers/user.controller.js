const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../services/auth.service");
require("dotenv").config();

async function getMe(req, res, next) {
  try {
    const user = await userModel.getUserById(req.user.user_id);
    if (!user)
      return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user)
      return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });

    if (req.user.role === "ORG_ADMIN") {
      if (!req.user.organization_id || Number(req.user.organization_id) !== Number(user.organization_id)) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "Forbidden: You can only view users from your organization",
          statusCode: 403,
        });
      }
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
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

    users.forEach(u => { if (u.password) delete u.password; });

    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { organization_id = null, first_name, last_name, email, password, role, position } = req.body;

    if (req.user.role === "ORG_ADMIN") {
      if (!organization_id || Number(organization_id) !== Number(req.user.organization_id)) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "You can only create users in your organization",
          statusCode: 403,
        });
      }
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

    if (newUser.password) delete newUser.password;

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

async function getUsersByOrganization(req, res, next) {
  try {
    const { organization_id } = req.params;

    if (req.user.role === "ORG_ADMIN" &&
        Number(req.user.organization_id) !== Number(organization_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only view users from your organization",
        statusCode: 403,
      });
    }

    const users = await userModel.getUsersByOrganization(organization_id);
    users.forEach(u => delete u.password);

    res.json(users);

  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const targetUser = await userModel.getUserById(req.params.id);
    if (!targetUser)
      return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });

    if (req.user.role === "ORG_ADMIN") {
      if (!req.user.organization_id || Number(req.user.organization_id) !== Number(targetUser.organization_id)) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "You can only delete users from your organization",
          statusCode: 403,
        });
      }
    }

    await userModel.deleteUser(req.params.id);

    res.json({ message: "User deleted" });

  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const targetUser = await userModel.getUserById(req.params.id);
    if (!targetUser)
      return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });

    if (req.user.role === "ORG_ADMIN") {
      if (!req.user.organization_id || Number(req.user.organization_id) !== Number(targetUser.organization_id)) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "You can only update users from your organization",
          statusCode: 403,
        });
      }
    }

    const updated = await userModel.updateUser(req.params.id, req.body);
    if (updated.password) delete updated.password;

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { 
    getMe, 
    getUserById, 
    getAllUsers, 
    createUser,
    getUsersByOrganization,
    deleteUser,
    updateUser,
};
