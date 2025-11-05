const assignmentModel = require("../models/assignment.model");
const shiftModel = require("../models/shift.model");
const userModel = require("../models/user.model");
const { extractOrgIdsFromUser } = require("../services/auth.service");

async function createAssignment(req, res, next) {
  try {
    const { shift_id, user_id, role_on_shift } = req.body;

    const shift = await shiftModel.getShiftById(shift_id);
    const targetUser = await userModel.getUserById(user_id);

    if (!shift || !targetUser) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Shift or user not found",
        statusCode: 404,
      });
    }

    const shiftOrgId = Number(shift.organization_id);
    const userOrgIds = extractOrgIdsFromUser(targetUser);

    if (
      req.user.role === "ORG_ADMIN" &&
      !((req.user.organization_ids || []).map(Number).includes(shiftOrgId))
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only manage assignments in your own organization(s)",
        statusCode: 403,
      });
    }

    if (!userOrgIds.includes(shiftOrgId)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "User and shift must belong to the same organization",
        statusCode: 400,
      });
    }

    const assignment = await assignmentModel.createAssignment({
      shift_id,
      user_id,
      role_on_shift,
    });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

// dodam sprawdzenie - czy zmiana o shift_id należy do jednej z jego organizacji
async function getAssignmentsByShift(req, res, next) {
  try {
    const assignments = await assignmentModel.getAssignmentsByShift(req.params.shift_id);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

// dodam sprawdzenie - czy user o user_id należy do jednej z jego organizacji
async function getAssignmentsByUser(req, res, next) {
  try {
    const assignments = await assignmentModel.getAssignmentsByUser(req.params.user_id);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

// dodam - czy przydzial dotyczy zmiany lub usera z jednej z jego organizacji
async function deleteAssignment(req, res, next) {
  try {
    await assignmentModel.deleteAssignment(req.params.id);
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    next(err);
  }
}

// dodam tez update

module.exports = { 
  createAssignment, 
  getAssignmentsByShift, 
  getAssignmentsByUser, 
  deleteAssignment,
};
