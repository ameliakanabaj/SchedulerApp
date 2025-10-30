const db = require("../services/db.service");

async function createAssignment({ shift_id, user_id, role_on_shift }) {
  const query = `
    INSERT INTO "Assignment" (shift_id, user_id, role_on_shift)
    VALUES ($1, $2, $3)
    RETURNING assignment_id, shift_id, user_id, role_on_shift;
  `;
  const values = [shift_id, user_id, role_on_shift];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function getAssignmentsByShift(shift_id) {
  const result = await db.query(
    `SELECT a.*, u.first_name, u.last_name, u.email
     FROM "Assignment" a
     JOIN "User" u ON a.user_id = u.user_id
     WHERE a.shift_id = $1`,
    [shift_id]
  );
  return result.rows;
}

async function getAssignmentsByUser(user_id) {
  const result = await db.query(
    `SELECT a.*, s.date, s.start_time, s.end_time, s.place
     FROM "Assignment" a
     JOIN "Shift" s ON a.shift_id = s.shift_id
     WHERE a.user_id = $1`,
    [user_id]
  );
  return result.rows;
}

async function deleteAssignment(assignment_id) {
  await db.query(`DELETE FROM "Assignment" WHERE assignment_id = $1`, [assignment_id]);
  return true;
}

module.exports = {
  createAssignment,
  getAssignmentsByShift,
  getAssignmentsByUser,
  deleteAssignment
};
