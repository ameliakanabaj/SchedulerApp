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
  password_must_be_reset = true,
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
      password_must_be_reset,
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

  const { password_must_be_reset, ...restWithoutPasswordReset } = rest;

  let updateData = {
    ...restWithoutPasswordReset,
  };
  
  if (password_must_be_reset !== undefined) {
    updateData.password_must_be_reset = password_must_be_reset;
  }

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
  getAllUsers,
  getUsersByOrganization,
  deleteUser,
  updateUser,
};
