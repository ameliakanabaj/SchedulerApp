const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createOrganization({ name }) {
  return await prisma.organization.create({
    data: { name },
  });
}

async function getAllOrganizations() {
  return await prisma.organization.findMany({
  include: {
    users: {
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        position: true,
        organization_id: true
      }
    }
  },
  orderBy: { name: "asc" }
  });
}

async function getOrganizationById(id) {
  return await prisma.organization.findUnique({
    where: { organization_id: Number(id) },
    include: { users: true },
  });
}

async function getOrganizationsByIds(ids = []) {
  return await prisma.organization.findMany({
    where: { organization_id: { in: ids.map(Number) } },
    include: { users: true },
    orderBy: { name: "asc" },
  });
}

async function updateOrganization(id, { name }) {
  return await prisma.organization.update({
    where: { organization_id: Number(id) },
    data: { name },
  });
}

async function deleteOrganization(id) {
  await prisma.organization.delete({
    where: { organization_id: Number(id) },
  });
  return true;
}

module.exports = {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  getOrganizationsByIds,
  updateOrganization,
  deleteOrganization,
};
