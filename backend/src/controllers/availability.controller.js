const availabilityModel = require("../models/availability.model");
const userModel = require("../models/user.model");

async function createAvailability(req, res, next) {
  try {
    const { user_id, date, start_time, end_time, comments, status } = req.body;

    if (req.user.role === "EMPLOYEE" && req.user.user_id !== user_id) {
      return next({ type: "BUSINESS_LOGIC", message: "You can only create your own availability", statusCode: 403 });
    }

    if (req.user.role === "ORG_ADMIN") {
      const targetUser = await userModel.getUserById(user_id);
      if (!targetUser || targetUser.organization_id !== req.user.organization_id) {
        return next({ type: "BUSINESS_LOGIC", message: "You can only create availability for users in your organization", statusCode: 403 });
      }
    }

    const availability = await availabilityModel.createAvailability({ user_id, date, start_time, end_time, comments, status });
    res.status(201).json(availability);
  } catch (err) {
    next(err);
  }
}

async function getAvailabilityByUser(req, res, next) {
  try {
    const { user_id } = req.params;

    if (req.user.role === "EMPLOYEE" && req.user.user_id != user_id) {
      return next({ type: "BUSINESS_LOGIC", message: "You can only view your own availability", statusCode: 403 });
    }

    if (req.user.role === "ORG_ADMIN") {
      const targetUser = await userModel.getUserById(user_id);
      if (!targetUser || targetUser.organization_id !== req.user.organization_id) {
        return next({ type: "BUSINESS_LOGIC", message: "You can only view users in your organization", statusCode: 403 });
      }
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
    if (!existing) return next({ type: "BUSINESS_LOGIC", message: "Availability not found", statusCode: 404 });

    if (req.user.role === "EMPLOYEE" && req.user.user_id !== existing.user_id) {
      return next({ type: "BUSINESS_LOGIC", message: "You can only update your own availability", statusCode: 403 });
    }

    if (req.user.role === "ORG_ADMIN") {
      const targetUser = await userModel.getUserById(existing.user_id);
      if (!targetUser || targetUser.organization_id !== req.user.organization_id) {
        return next({ type: "BUSINESS_LOGIC", message: "You can only edit users in your organization", statusCode: 403 });
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
    if (!existing) return next({ type: "BUSINESS_LOGIC", message: "Availability not found", statusCode: 404 });

    if (req.user.role === "EMPLOYEE" && req.user.user_id !== existing.user_id) {
      return next({ type: "BUSINESS_LOGIC", message: "You can only delete your own availability", statusCode: 403 });
    }

    if (req.user.role === "ORG_ADMIN") {
      const targetUser = await userModel.getUserById(existing.user_id);
      if (!targetUser || targetUser.organization_id !== req.user.organization_id) {
        return next({ type: "BUSINESS_LOGIC", message: "You can only delete users in your organization", statusCode: 403 });
      }
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
    deleteAvailability 
};
