const db = require("../services/db.service");

async function createAvailability({ user_id, date, start_time, end_time, comments, status }) {
  const result = await db.query(
    `INSERT INTO "Availability" (user_id, date, start_time, end_time, comments, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, date, start_time, end_time, comments, status]
  );
  return result.rows[0];
}

async function getAvailabilityByUser(user_id) {
  const result = await db.query(`SELECT * FROM "Availability" WHERE user_id = $1`, [user_id]);
  return result.rows;
}

async function getAvailabilityById(availability_id) {
  const result = await db.query(`SELECT * FROM "Availability" WHERE availability_id = $1`, [availability_id]);
  return result.rows[0] || null;
}

async function updateAvailability(id, data) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    fields.push(`"${key}" = $${i}`);
    values.push(value);
    i++;
  }

  if (fields.length === 0) return null;

  const query = `
    UPDATE "Availability"
    SET ${fields.join(", ")}
    WHERE availability_id = $${i}
    RETURNING *;
  `;

  values.push(id);

  const result = await db.query(query, values);
  return result.rows[0] || null;
}

async function deleteAvailability(id) {
  await db.query(`DELETE FROM "Availability" WHERE availability_id = $1`, [id]);
}

module.exports = {
  createAvailability,
  getAvailabilityByUser,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
};
