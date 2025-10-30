const assignmentModel = require("../models/assignment.model");
const db = require("../services/db.service");

async function createAssignment(req, res, next) {
  try {
    const { shift_id, user_id, role_on_shift } = req.body;

    const shiftOrg = await db.query(`SELECT organization_id FROM "Shift" WHERE shift_id = $1`, [shift_id]);
    const userOrg = await db.query(`SELECT organization_id FROM "User" WHERE user_id = $1`, [user_id]);

    if (shiftOrg.rowCount === 0 || userOrg.rowCount === 0) {
      return next({ type: "BUSINESS_LOGIC", message: "Shift or user not found", statusCode: 404 });
    }

    const shiftOrgId = shiftOrg.rows[0].organization_id;
    const userOrgId = userOrg.rows[0].organization_id;

    if (req.user.role === "ORG_ADMIN" && req.user.organization_id !== shiftOrgId) {
      return next({ type: "BUSINESS_LOGIC", message: "You can only manage assignments in your own organization", statusCode: 403 });
    }

    if (shiftOrgId !== userOrgId) {
      return next({ type: "BUSINESS_LOGIC", message: "User and shift must belong to the same organization", statusCode: 400 });
    }

    const assignment = await assignmentModel.createAssignment({ shift_id, user_id, role_on_shift });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

async function getAssignmentsByShift(req, res, next) {
  try {
    const { shift_id } = req.params;
    const assignments = await assignmentModel.getAssignmentsByShift(shift_id);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

async function getAssignmentsByUser(req, res, next) {
  try {
    const { user_id } = req.params;
    const assignments = await assignmentModel.getAssignmentsByUser(user_id);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

async function deleteAssignment(req, res, next) {
  try {
    await assignmentModel.deleteAssignment(req.params.id);
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  createAssignment, 
  getAssignmentsByShift, 
  getAssignmentsByUser, 
  deleteAssignment 
};
