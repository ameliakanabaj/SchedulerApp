const scheduleModel = require("../models/schedule.model");
const scheduleGenerator = require("../services/scheduleGenerator.service");

async function createSchedule(req, res, next) {
  try {
    const { organization_id, date_from, date_to, deadline_generate_date } = req.body;

    if (
      req.user.role !== "GLOBAL_ADMIN" &&
      Number(req.user.organization_id) !== Number(organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    }

    const schedule = await scheduleModel.createSchedule({
      organization_id,
      date_from,
      date_to,
      deadline_generate_date,
    });

    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
}

async function getSchedulesByOrganization(req, res, next) {
  try {
    const { organizationId } = req.params;

    if (
      req.user.role !== "GLOBAL_ADMIN" &&
      Number(req.user.organization_id) !== Number(organizationId)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    }

    const schedules = await scheduleModel.getSchedulesForOrganization(organizationId);
    res.json(schedules);
  } catch (err) {
    next(err);
  }
}

async function getSchedulesForUser(req, res, next) {
  try {
    const { userId } = req.params;

    if (
      req.user.role === "EMPLOYEE" &&
      Number(req.user.user_id) !== Number(userId)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    } else if (req.user.role !== "GLOBAL_ADMIN" &&
      Number(req.user.organization_id) !== Number(organizationId)) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "Access denied",
          statusCode: 403,
        });
    }

    const schedules = await scheduleModel.getSchedulesForUser(userId);
    res.json(schedules);
  } catch (err) {
    next(err);
  }
}

async function updateSchedule(req, res, next) {
  try {
    const { scheduleId } = req.params;

    const existing = await scheduleModel.getScheduleById(scheduleId);
    if (!existing) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Schedule not found",
        statusCode: 404,
      });
    }

    if (
      req.user.role !== "GLOBAL_ADMIN" &&
      Number(req.user.organization_id) !== Number(existing.organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    }

    const updated = await scheduleModel.updateSchedule(scheduleId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteSchedule(req, res, next) {
  try {
    const { scheduleId } = req.params;

    const schedule = await scheduleModel.getScheduleById(scheduleId);
    if (!schedule) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Schedule not found",
        statusCode: 404,
      });
    }

    if (
        req.user.role !== "GLOBAL_ADMIN" &&
        Number(req.user.organization_id) !== Number(schedule.organization_id)
    ) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "Access denied",
          statusCode: 403,
        });
    }

    await scheduleModel.deleteSchedule(scheduleId);
    res.json({ message: "Schedule deleted" });
  } catch (err) {
    next(err);
  }
}

async function getScheduleById(req, res, next) {
  try {
    const { scheduleId } = req.params;

    const schedule = await scheduleModel.getScheduleById(scheduleId);
    if (!schedule) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Schedule not found",
        statusCode: 404,
      });
    }

    if (
      req.user.role !== "GLOBAL_ADMIN" &&
      Number(req.user.organization_id) !== Number(schedule.organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    }

    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

async function generateSchedule(req, res, next) {
  try {
    const { scheduleId } = req.body;

    if (!scheduleId) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "scheduleId is required",
        statusCode: 400,
      });
    }

    const schedule = await scheduleModel.getScheduleById(scheduleId);

    if (!schedule) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Schedule not found",
        statusCode: 404,
      });
    }

    if (
      req.user.role !== "GLOBAL_ADMIN" &&
      Number(req.user.organization_id) !== Number(schedule.organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    }

    const assignments = await scheduleGenerator.generateSchedule(scheduleId);

    res.json({
      message: "Schedule generated",
      assignments,
    });
  } catch (err) {
    next(err);
  }
}

async function checkIfScheduleReady(req, res, next) {
  try {
    const { scheduleId } = req.params;

    const schedule = await scheduleModel.getScheduleById(scheduleId);

    if (!schedule) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Schedule not found",
        statusCode: 404,
      });
    }

    if (
      req.user.role !== "GLOBAL_ADMIN" &&
      Number(req.user.organization_id) !== Number(schedule.organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    }

    const result = await scheduleModel.canGenerateSchedule(scheduleId);

    res.json(result);
  } catch (err) {
    next(err);
  }
}


module.exports = {
  createSchedule,
  getSchedulesByOrganization,
  getSchedulesForUser,
  updateSchedule,
  deleteSchedule,
  getScheduleById,
  generateSchedule,
  checkIfScheduleReady
};
