const shiftModel = require("../models/shift.model");

async function createShift(req, res, next) {
  try {
    const { organization_id, date, start_time, end_time, place } = req.body;

    if (
      req.user.role === "ORG_ADMIN" &&
      !((req.user.organization_ids || []).map(Number).includes(Number(organization_id)))
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only create shifts in your organization(s)",
        statusCode: 403,
      });
    }

    const shift = await shiftModel.createShift({
      organization_id,
      date,
      start_time,
      end_time,
      place,
    });
    res.status(201).json(shift);
  } catch (err) {
    next(err);
  }
}

async function getAllShifts(req, res, next) {
  try {
    let shifts;
    if (req.user.role === "GLOBAL_ADMIN") {
      shifts = await shiftModel.getAllShifts();
    } else if (req.user.role === "ORG_ADMIN") {
      shifts = await shiftModel.getAllShiftsByOrganizations(req.user.organization_ids || []);
    } else {
      return next({ type: "BUSINESS_LOGIC", message: "Forbidden", statusCode: 403 });
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

    if (
      req.user.role === "ORG_ADMIN" &&
      !((req.user.organization_ids || []).map(Number).includes(Number(shift.organization_id)))
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Access denied to this shift",
        statusCode: 403,
      });
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
      !((req.user.organization_ids || []).map(Number).includes(Number(existing.organization_id)))
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only modify shifts in your organization(s)",
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
      !((req.user.organization_ids || []).map(Number).includes(Number(existing.organization_id)))
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only delete shifts in your organization(s)",
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
    getAllShifts, 
    getShiftById, 
    updateShift, 
    deleteShift,
};
