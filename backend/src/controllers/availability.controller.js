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

    const existingAvailabilities = await availabilityModel.getAvailabilityByUser(user_id);
    const hasConflict = existingAvailabilities.some(a =>
      (new Date(start_time) < a.end_time && new Date(end_time) > a.start_time)
    );

    if (hasConflict) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Availability overlaps with existing record",
        statusCode: 400,
      });
    }

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
    const items = req.body;

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

    const existingAvailabilities = await availabilityModel.getAvailabilitiesByUserIds(userIds);

    const availabilityMap = {};
    existingAvailabilities.forEach(a => {
      if (!availabilityMap[a.user_id]) availabilityMap[a.user_id] = [];
      availabilityMap[a.user_id].push(a);
    });

    for (const item of items) {
      const existing = availabilityMap[item.user_id] || [];
      const s = new Date(item.start_time);
      const e = new Date(item.end_time);

      const conflict = existing.some(a =>
        s < a.end_time && e > a.start_time
      );

      if (conflict) {
        return next({
          type: "BUSINESS_LOGIC",
          message: `Availability for user ${item.user_id} overlaps with existing record`,
          statusCode: 400,
        });
      }
    }

    const byUser = {};

    for (const i of items) {
      if (!byUser[i.user_id]) byUser[i.user_id] = [];
      byUser[i.user_id].push(i);
    }

    for (const userId in byUser) {
      const arr = byUser[userId];

      arr.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

      for (let i = 0; i < arr.length - 1; i++) {
        const currEnd = new Date(arr[i].end_time);
        const nextStart = new Date(arr[i + 1].start_time);

        if (currEnd > nextStart) {
          return next({
            type: "BUSINESS_LOGIC",
            message: `Bulk conflict for user ${userId}: items overlap with each other`,
            statusCode: 400,
          });
        }
      }
    }

    const created = await availabilityModel.createAvailabilitiesBulk(items);
    res.status(201).json({ inserted: created.length, records: created });

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
    res.json(availabilities);

  } catch (err) {
    next(err);
  }
}

async function updateAvailability(req, res, next) {
  try {
    const { id } = req.params;

    const existing = req.existing;

    const targetUser = await userModel.getUserById(existing.user_id);

    if (!canManageAvailability(req.user, targetUser)) {
      return next({ type: "BUSINESS_LOGIC", message: "No permission", statusCode: 403 });
    }

    const s = req.body.start_time
      ? new Date(req.body.start_time)
      : existing.start_time;

    const e = req.body.end_time
      ? new Date(req.body.end_time)
      : existing.end_time;

    const all = await availabilityModel.getAvailabilityByUser(existing.user_id);

    const conflict = all.some(a =>
      a.availability_id !== existing.availability_id &&
      s < a.end_time &&
      e > a.start_time
    );

    if (conflict) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Updated availability overlaps with existing record",
        statusCode: 400
      });
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
