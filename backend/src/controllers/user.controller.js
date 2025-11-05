const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const { generateToken, extractOrgIdsFromUser } = require("../services/auth.service");
require("dotenv").config();

async function getMe(req, res, next) {
  try {
    const user = await userModel.getUserById(req.user.user_id);
    if (!user)
      return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });
    if (user.password) delete user.password;
    res.json(user);
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
      const userOrgIds = extractOrgIdsFromUser(user);
      const allowed = (req.user.organization_ids || []).map(Number).some(id => userOrgIds.includes(Number(id)));
      if (!allowed) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "Forbidden: You can only view users from your organization(s)",
          statusCode: 403,
        });
      }
    }

    if (user.password) delete user.password;
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
      users = await userModel.getUsersByOrganizations(requester.organization_ids || []);
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
    const { organization_ids = [], first_name, last_name, email, password, role, position } = req.body;

    if (req.user.role === "ORG_ADMIN") {
      const invalid = organization_ids.some(id => !(req.user.organization_ids || []).map(Number).includes(Number(id)));
      if (invalid) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "You can only create users in your organization(s)",
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
      organization_ids,
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

async function deleteUser(req, res, next) {
  try {
    const targetUser = await userModel.getUserById(req.params.id);
    if (!targetUser)
      return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });

    if (req.user.role === "ORG_ADMIN") {
      const targetOrgs = extractOrgIdsFromUser(targetUser);
      const allowed = (req.user.organization_ids || []).some(id =>
        targetOrgs.includes(Number(id))
      );
      if (!allowed) {
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
      const targetOrgs = extractOrgIdsFromUser(targetUser);
      const allowed = (req.user.organization_ids || []).some(id =>
        targetOrgs.includes(Number(id))
      );
      if (!allowed) {
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
    deleteUser,
    updateUser,
};
