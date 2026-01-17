const availabilityModel = require("../models/availability.model");
const userModel = require("../models/user.model");

function canManageAvailability(requester, targetUser) {

  if (requester.role === "GLOBAL_ADMIN") return true;

  if (requester.role === "EMPLOYEE") {
    return Number(requester.user_id) === Number(targetUser.user_id);
  }

  if (requester.role === "ORG_ADMIN") {
    return Number(requester.organization_id) === Number(targetUser.organization_id);
  }

  return false;
}

async function createAvailability(req, res, next) {
  try {
    let { user_id, start_time, end_time, comments } = req.body;

    if (req.user.role === "EMPLOYEE") {
      user_id = req.user.user_id;
    }

    const targetUser = await userModel.getUserById(user_id);
    if (!targetUser) {
      return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });
    }

    if (!canManageAvailability(req.user, targetUser)) {
      return next({ type: "BUSINESS_LOGIC", message: "No permission", statusCode: 403 });
    }

    const day = new Date(start_time).toISOString().split("T")[0];

    await availabilityModel.deleteAvailabilityByUserAndDay(user_id, day);

    const availability = await availabilityModel.createAvailability({
      user_id,
      start_time,
      end_time,
      comments
    });

    res.status(201).json(availability);

  } catch (err) {
    next(err);
  }
}


async function createAvailabilitiesBulk(req, res, next) {
  try {
    // Support both array and { days: [...] } for req.body
    let items = Array.isArray(req.body) ? req.body : req.body.days;
    if (!Array.isArray(items)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Invalid request body for bulk availability",
        statusCode: 400
      });
    }

    if (req.user.role === "EMPLOYEE") {
      items.forEach(i => i.user_id = req.user.user_id);
    }

    for (const i of items) {
      i.user_id = Number(i.user_id);
    }

    if (items.some(i => isNaN(i.user_id))) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Invalid or missing user_id in bulk items",
        statusCode: 400,
      });
    }

    const userIds = [...new Set(items.map(i => i.user_id))];

    const users = await userModel.getUsersByIds(userIds);
    const foundIds = users.map(u => Number(u.user_id));
    const missing = userIds.filter(id => !foundIds.includes(id));
    if (missing.length > 0) {
      return next({
        type: "BUSINESS_LOGIC",
        message: `Users not found: ${missing.join(", ")}`,
        statusCode: 404
      });
    }

    for (const u of users) {
      if (!canManageAvailability(req.user, u)) {
        return next({
          type: "BUSINESS_LOGIC",
          message: `No permission to create availability for user ${u.user_id}`,
          statusCode: 403
        });
      }
    }

    for (const item of items) {
      const day = new Date(item.start_time).toISOString().split("T")[0];
      await availabilityModel.deleteAvailabilityByUserAndDay(item.user_id, day);
    }

    const created = await availabilityModel.createAvailabilitiesBulk(items);

    res.status(201).json({
      inserted: created.length,
      records: created
    });

  } catch (err) {
    console.log('BŁĄD');
    console.log(req.body);
    
    console.log(err);
    
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

    if (!canManageAvailability(req.user, targetUser)) {
      const message =
        req.user.role === "EMPLOYEE"
          ? "You can only view your own availability"
          : "No permission to view this user's availability";

      return next({
        type: "BUSINESS_LOGIC",
        message,
        statusCode: 403,
      });
    }

    const availabilities = await availabilityModel.getAvailabilityByUser(user_id);
    console.log(availabilities);
    
    res.json(availabilities);

  } catch (err) {
    next(err);
  }
}

async function updateAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const existing = req.existing;

    const updateData = Array.isArray(req.body) ? req.body[0] : req.body;

    if (!updateData) {
      return next({ type: "BUSINESS_LOGIC", message: "Missing update data", statusCode: 400 });
    }

    const targetUser = await userModel.getUserById(existing.user_id);

    if (!canManageAvailability(req.user, targetUser)) {
      return next({ type: "BUSINESS_LOGIC", message: "No permission", statusCode: 403 });
    }

    const s = updateData.start_time ? new Date(updateData.start_time) : existing.start_time;
    const now = new Date();
    if (s <= now) {
      return next({ type: "BUSINESS_LOGIC", message: "start_time must be in the future", statusCode: 400 });
    }

    const updated = await availabilityModel.updateAvailability(id, updateData, existing);

    res.json(updated);

  } catch (err) {
    next(err);
  }
}

async function deleteAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const existing = req.existing;

    const targetUser = await userModel.getUserById(existing.user_id);

    if (!canManageAvailability(req.user, targetUser)) {
      return next({ type: "BUSINESS_LOGIC", message: "No permission", statusCode: 403 });
    }

    await availabilityModel.deleteAvailability(id);
    res.json({ message: "Availability deleted" });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAvailability,
  createAvailabilitiesBulk,
  getAvailabilityByUser,
  updateAvailability,
  deleteAvailability,
};
