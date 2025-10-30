const db = require("../services/db.service");

async function createShift({ organization_id, date, start_time, end_time, place }) {
  const result = await db.query(
    `INSERT INTO "Shift" (organization_id, date, start_time, end_time, place)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *;`,
    [organization_id, date, start_time, end_time, place]
  );
  return result.rows[0];
}

async function getAllShiftsByOrganization(organization_id) {
  const result = await db.query(
    `SELECT * FROM "Shift" WHERE organization_id = $1 ORDER BY date ASC, start_time ASC`,
    [organization_id]
  );
  return result.rows;
}

async function getShiftById(shift_id) {
  const result = await db.query(`SELECT * FROM "Shift" WHERE shift_id = $1`, [shift_id]);
  return result.rows[0] || null;
}

async function updateShift(shift_id, data) {
  const { date, start_time, end_time, place } = data;
  const result = await db.query(
    `UPDATE "Shift"
     SET date = $1, start_time = $2, end_time = $3, place = $4
     WHERE shift_id = $5
     RETURNING *`,
    [date, start_time, end_time, place, shift_id]
  );
  return result.rows[0] || null;
}

async function deleteShift(shift_id) {
  await db.query(`DELETE FROM "Shift" WHERE shift_id = $1`, [shift_id]);
  return true;
}

module.exports = {
  createShift,
  getAllShiftsByOrganization,
  getShiftById,
  updateShift,
  deleteShift,
};
