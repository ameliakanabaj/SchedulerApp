const scheduleModel = require("../models/schedule.model");
const scheduleGenerator = require("../services/scheduleGenerator.service");
const notificationService = require("../services/notifications.service");
const userModel = require("../models/user.model");

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

    if (schedule) {
        const users = await userModel.getUsersByOrganization(organization_id);
        const employees = users.filter(u => u.role === "EMPLOYEE");

        employees.forEach(user => {
            const startStr = new Date(date_from).toLocaleDateString("pl-PL");
            const endStr = new Date(date_to).toLocaleDateString("pl-PL");
            const deadlineStr = new Date(deadline_generate_date).toLocaleDateString("pl-PL");

            notificationService.sendNotification({
                userId: user.user_id,
                scheduleId: schedule.schedule_id,
                type: "AVAILABILITY_OPEN",
                message: `Availability is open for period: ${startStr} to ${endStr}. Please submit before ${deadlineStr}.`
            }).catch(err => console.error("Notification error:", err));
        });
    }

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
