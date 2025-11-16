const availabilityModel = require("../models/availability.model");
const userModel = require("../models/user.model");

async function createAvailability(req, res, next) {
  try {
    const { start_time, end_time, comments, status } = req.body;
    const user_id = req.body.user_id || req.user.user_id;

    const targetUser = await userModel.getUserById(user_id);
    if (!targetUser) {
      return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });
    }

    if (req.user.role === "EMPLOYEE" && Number(req.user.user_id) !== Number(user_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only create your own availability",
        statusCode: 403,
      });
    }

    if (req.user.role === "ORG_ADMIN" && Number(req.user.organization_id) !== Number(targetUser.organization_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "User is not in your organization",
        statusCode: 403,
      });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);
    if (isNaN(start) || isNaN(end)) {
      return next({ type: "BUSINESS_LOGIC", message: "Invalid dates", statusCode: 400 });
    }
    if (end <= start) {
      return next({ type: "BUSINESS_LOGIC", message: "end_time must be after start_time", statusCode: 400 });
    }

    const availability = await availabilityModel.createAvailability({
      user_id,
      start_time,
      end_time,
      comments,
      status,
    });

    res.status(201).json(availability);

  } catch (err) {
    next(err);
  }
}

async function getAvailabilityByUser(req, res, next) {
  try {
    const { user_id } = req.params;

    const targetUser = await userModel.getUserById(user_id);
    if (!targetUser) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "User not found",
        statusCode: 404,
      });
    }

    if (req.user.role === "EMPLOYEE" && Number(req.user.user_id) !== Number(user_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only view your own availability",
        statusCode: 403,
      });
    }

    if (req.user.role === "ORG_ADMIN" && Number(req.user.organization_id) !== Number(targetUser.organization_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "User is not in your organization",
        statusCode: 403,
      });
    }

    const availabilities = await availabilityModel.getAvailabilityByUser(user_id);
    res.json(availabilities);

  } catch (err) {
    next(err);
  }
}

async function updateAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await availabilityModel.getAvailabilityById(id);

    if (!existing) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Availability not found",
        statusCode: 404,
      });
    }

    if (req.user.role === "EMPLOYEE" && Number(existing.user_id) !== Number(req.user.user_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only update your own availability",
        statusCode: 403,
      });
    }

    if (req.user.role === "ORG_ADMIN" && Number(existing.user_id) !== Number(req.user.user_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "ORG_ADMIN can only update their own availability",
        statusCode: 403,
      });
    }

    if (req.body.start_time || req.body.end_time) {
      const start = req.body.start_time ? new Date(req.body.start_time) : new Date(existing.start_time);
      const end = req.body.end_time ? new Date(req.body.end_time) : new Date(existing.end_time);

      if (end <= start) {
        return next({ type: "BUSINESS_LOGIC", message: "end_time must be after start_time", statusCode: 400 });
      }
    }

    const updated = await availabilityModel.updateAvailability(id, req.body);
    res.json(updated);

  } catch (err) {
    next(err);
  }
}

async function deleteAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await availabilityModel.getAvailabilityById(id);

    if (!existing) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Availability not found",
        statusCode: 404,
      });
    }

    if (req.user.role === "EMPLOYEE" && Number(existing.user_id) !== Number(req.user.user_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only delete your own availability",
        statusCode: 403,
      });
    }

    if (req.user.role === "ORG_ADMIN" && Number(existing.user_id) !== Number(req.user.user_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "ORG_ADMIN can only delete their own availability",
        statusCode: 403,
      });
    }

    await availabilityModel.deleteAvailability(id);
    res.json({ message: "Availability deleted" });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAvailability,
  getAvailabilityByUser,
  updateAvailability,
  deleteAvailability,
};
