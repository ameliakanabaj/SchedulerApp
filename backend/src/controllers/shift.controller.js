const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const shiftModel = require("../models/shift.model");

async function createShift(req, res, next) {
  try {
    const { organization_id, start_time, end_time, place, required_people } = req.body;

    if (
      req.user.role === "ORG_ADMIN" &&
      Number(req.user.organization_id) !== Number(organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only create shifts in your organization",
        statusCode: 403,
      });
    }

    const shift = await shiftModel.createShift({
      organization_id,
      start_time,
      end_time,
      place,
      required_people,
    });
    res.status(201).json(shift);
  } catch (err) {
    next(err);
  }
}

async function createShiftsBulk(req, res, next) {
  try {
    const items = req.body;

    if (req.user.role === "ORG_ADMIN") {
      for (const i of items) {
        if (Number(i.organization_id) !== Number(req.user.organization_id)) {
          return next({
            type: "BUSINESS_LOGIC",
            message: `You can only create shifts for your organization (${req.user.organization_id})`,
            statusCode: 403
          });
        }
      }
    }

    const now = new Date();

    for (const i of items) {
      const start = new Date(i.start_time);

      if (start < now) {
        return next({
          type: "BUSINESS_LOGIC",
          message: `Shift start_time cannot be in the past (${i.start_time})`,
          statusCode: 400
        });
      }
    }

    const created = await shiftModel.createShiftsBulk(items);

    res.status(201).json({
      inserted: created.length,
      records: created
    });

  } catch (err) {
    next(err);
  }
}

async function getAllShifts(req, res, next) {
  try {
    let shifts;

    if (req.user.role === "GLOBAL_ADMIN") {
      shifts = await shiftModel.getAllShifts();
    } 
    
    else if (req.user.role === "ORG_ADMIN" || req.user.role === "EMPLOYEE") {
      shifts = await shiftModel.getAllShiftsByOrganizations([req.user.organization_id]);
    }

    else {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Forbidden",
        statusCode: 403
      });
    }

    res.json(shifts);
  } catch (err) {
    next(err);
  }
}

async function getShiftById(req, res, next) {
  try {
    const shift = await shiftModel.getShiftById(req.params.id);
    if (!shift)
      return next({ type: "BUSINESS_LOGIC", message: "Shift not found", statusCode: 404 });

    if (req.user.role === "ORG_ADMIN") {
      if (Number(req.user.organization_id) !== Number(shift.organization_id)) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "Access denied to this shift",
          statusCode: 403,
        });
      }
    }

    if (req.user.role === "EMPLOYEE") {
      const isAssigned = await prisma.assignment.findFirst({
        where: {
          shift_id: shift.shift_id,
          user_id: req.user.user_id
        }
      });

      if (!isAssigned) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "You can only view your own shifts",
          statusCode: 403,
        });
      }
    }

    res.json(shift);
  } catch (err) {
    next(err);
  }
}

async function updateShift(req, res, next) {
  try {
    const existing = await shiftModel.getShiftById(req.params.id);
    if (!existing)
      return next({ type: "BUSINESS_LOGIC", message: "Shift not found", statusCode: 404 });

    if (
      req.user.role === "ORG_ADMIN" &&
      Number(req.user.organization_id) !== Number(existing.organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only modify shifts in your organization",
        statusCode: 403,
      });
    }

    const updated = await shiftModel.updateShift(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteShift(req, res, next) {
  try {
    const existing = await shiftModel.getShiftById(req.params.id);
    if (!existing)
      return next({ type: "BUSINESS_LOGIC", message: "Shift not found", statusCode: 404 });

    if (
      req.user.role === "ORG_ADMIN" &&
      Number(req.user.organization_id) !== Number(existing.organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only delete shifts in your organization",
        statusCode: 403,
      });
    }

    await shiftModel.deleteShift(req.params.id);
    res.json({ message: "Shift deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
    createShift,
    createShiftsBulk, 
    getAllShifts, 
    getShiftById, 
    updateShift, 
    deleteShift,
};
