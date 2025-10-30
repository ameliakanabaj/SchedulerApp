const db = require("../services/db.service");

async function createOrganization({ name }) {
  const result = await db.query(
    `INSERT INTO "Organization" (name) VALUES ($1) RETURNING organization_id, name`,
    [name]
  );
  return result.rows[0];
}

async function getAllOrganizations() {
  const result = await db.query(`SELECT organization_id, name FROM "Organization" ORDER BY name ASC`);
  return result.rows;
}

async function getOrganizationById(id) {
  const result = await db.query(`SELECT organization_id, name FROM "Organization" WHERE organization_id = $1`, [id]);
  return result.rows[0] || null;
}

async function updateOrganization(id, { name }) {
  const result = await db.query(
    `UPDATE "Organization" SET name = $1 WHERE organization_id = $2 RETURNING organization_id, name`,
    [name, id]
  );
  return result.rows[0] || null;
}

async function deleteOrganization(id) {
  await db.query(`DELETE FROM "Organization" WHERE organization_id = $1`, [id]);
  return true;
}

module.exports = {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization
};
