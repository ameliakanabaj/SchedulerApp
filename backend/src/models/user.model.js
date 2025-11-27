const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getUserById(user_id) {
  return await prisma.user.findUnique({
    where: { user_id: Number(user_id) },
    include: {
      organization: true,
    },
  });
}

async function getUsersByIds(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return await prisma.user.findMany({
    where: { user_id: { in: ids.map(Number) } },
    include: { organization: true },
  });
}

async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      organization: true,
    },
  });
}

async function getAllUsers() {
  return await prisma.user.findMany({
    include: {
      organization: true,
    },
  });
}

async function getUsersByOrganization(organization_id) {
  return await prisma.user.findMany({
    where: { organization_id: Number(organization_id) },
    include: { organization: true },
  });
}

async function createUser({
  organization_id = null,
  first_name,
  last_name,
  email,
  password_hash,
  role = "EMPLOYEE",
  position,
}) {
  return await prisma.user.create({
    data: {
      first_name,
      last_name,
      email,
      password: password_hash,
      role,
      position,
      organization_id: organization_id ? Number(organization_id) : null,
    },
    include: {
      organization: true,
    },
  });
}

async function deleteUser(user_id) {
  return await prisma.user.delete({
    where: { user_id: Number(user_id) },
  });
}

async function updateUser(user_id, data) {
  const { organization_id, password, ...rest } = data;

  let updateData = {
    ...rest,
  };

  if (organization_id !== undefined) {
    updateData.organization = organization_id ? { connect: { organization_id: Number(organization_id) } } : { disconnect: true };
  }

  if (password) {
    updateData.password = password;
  }

  return await prisma.user.update({
    where: { user_id: Number(user_id) },
    data: updateData,
    include: {
      organization: true,
    },
  });
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getUsersByIds,
  getAllUsers,
  getUsersByOrganization,
  deleteUser,
  updateUser,
};
