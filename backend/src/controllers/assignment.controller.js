const assignmentModel = require("../models/assignment.model");
const shiftModel = require("../models/shift.model");
const userModel = require("../models/user.model");

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
    const userOrgId = Number(targetUser.organization_id);

    if (
      req.user.role === "ORG_ADMIN" &&
      Number(req.user.organization_id) !== shiftOrgId
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "You can only manage assignments in your own organization",
        statusCode: 403,
      });
    }

    if (userOrgId !== shiftOrgId) {
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

async function getAssignmentById(req, res, next) {
  try {
    const assignment = await assignmentModel.getAssignmentById(req.params.id);
    if (!assignment) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Assignment not found",
        statusCode: 404,
      });
    }

    const shift = assignment.shift;

    if (
      req.user.role === "ORG_ADMIN" &&
      Number(req.user.organization_id) !== Number(shift.organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Forbidden",
        statusCode: 403,
      });
    }

    if (
      req.user.role === "EMPLOYEE" &&
      Number(req.user.user_id) !== Number(assignment.user_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Forbidden",
        statusCode: 403,
      });
    }

    res.json(assignment);
  } catch (err) {
    next(err);
  }
}

async function getAssignmentsByShift(req, res, next) {
  try {
    const shift = await shiftModel.getShiftById(req.params.shift_id);
    if (!shift) {
      return next({ type: "BUSINESS_LOGIC", message: "Shift not found", statusCode: 404 });
    }

    if (req.user.role === "ORG_ADMIN" && Number(req.user.organization_id) !== Number(shift.organization_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Forbidden",
        statusCode: 403,
      });
    }

    const assignments = await assignmentModel.getAssignmentsByShift(req.params.shift_id);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

async function getAssignmentsByUser(req, res, next) {
  try {
    const user = await userModel.getUserById(req.params.user_id);
    if (!user) {
      return next({ type: "BUSINESS_LOGIC", message: "User not found", statusCode: 404 });
    }

    if (req.user.role === "EMPLOYEE" && Number(req.user.user_id) !== Number(req.params.user_id)) {
      return next({ type: "BUSINESS_LOGIC", message: "Forbidden", statusCode: 403 });
    }

    if (req.user.role === "ORG_ADMIN" && Number(req.user.organization_id) !== Number(user.organization_id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Forbidden",
        statusCode: 403,
      });
    }

    const assignments = await assignmentModel.getAssignmentsByUser(req.params.user_id);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

async function deleteAssignment(req, res, next) {
  try {
    const assignmentId = req.params.id;
    const assignment = await assignmentModel.getAssignmentById(assignmentId);
    if (!assignment) {
      return next({ type: "BUSINESS_LOGIC", message: "Assignment not found", statusCode: 404 });
    }

    const shift = await shiftModel.getShiftById(assignment.shift_id);
    if (req.user.role === "ORG_ADMIN" && Number(req.user.organization_id) !== Number(shift.organization_id)) {
      return next({ type: "BUSINESS_LOGIC", message: "Forbidden", statusCode: 403 });
    }

    await assignmentModel.deleteAssignment(req.params.id);
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    next(err);
  }
}

async function updateAssignment(req, res, next) {
  try {
    const assignment = await assignmentModel.getAssignmentById(req.params.id);
    if (!assignment) {
      return next({ type: "BUSINESS_LOGIC", message: "Assignment not found", statusCode: 404 });
    }

    const shift = assignment.shift;

    if (
      req.user.role === "ORG_ADMIN" &&
      Number(req.user.organization_id) !== Number(shift.organization_id)
    ) {
      return next({ type: "BUSINESS_LOGIC", message: "Forbidden", statusCode: 403 });
    }

    const updated = await assignmentModel.updateAssignment(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  createAssignment, 
  getAssignmentById,
  getAssignmentsByShift, 
  getAssignmentsByUser, 
  deleteAssignment,
  updateAssignment,
};
