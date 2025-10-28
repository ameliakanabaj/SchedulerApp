const db = require("../services/db.service");

async function createUser({ organization_id, first_name, last_name, email, password_hash, role, position }) {
  const query = `
    INSERT INTO "User" (organization_id, first_name, last_name, email, password, role, position)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING user_id, organization_id, first_name, last_name, email, role, position;
  `;
  const values = [organization_id, first_name, last_name, email, password_hash, role, position];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await db.query(`SELECT * FROM "User" WHERE email = $1`, [email]);
  return result.rows[0] || null;
}

async function getUserById(user_id) {
  const result = await db.query(
    `SELECT user_id, organization_id, first_name, last_name, email, role, position 
     FROM "User" WHERE user_id = $1`,
    [user_id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
};
