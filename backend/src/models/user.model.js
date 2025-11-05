const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getUserById(user_id) {
  return await prisma.user.findUnique({
    where: { user_id: Number(user_id) },
    include: {
      userOrganizations: { include: { organization: true } },
    },
  });
}

async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      userOrganizations: { include: { organization: true } },
    },
  });
}

async function getAllUsers() {
  return await prisma.user.findMany({
    include: {
      userOrganizations: { include: { organization: true } },
    },
  });
}

// async function getUsersByOrganizations(organization_ids) {
//   return await prisma.user.findMany({
//     where: {
//       userOrganizations: {
//         some: { organization_id: { in: organization_ids.map(Number) } },
//       },
//     },
//     include: {
//       userOrganizations: { include: { organization: true } },
//     },
//   });
// }

async function createUser({
  organization_ids = [],
  first_name,
  last_name,
  email,
  password_hash,
  role,
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
      userOrganizations: {
        create: organization_ids.map((id) => ({
          organization: { connect: { organization_id: Number(id) } },
        })),
      },
    },
    include: {
      userOrganizations: { include: { organization: true } },
    },
  });
}

async function deleteUser(user_id) {
  return await prisma.user.delete({
    where: { user_id: Number(user_id) },
  });
}

async function updateUser(user_id, data) {
  const { organization_ids, password, ...rest } = data;

  let orgOps = {};
  if (organization_ids) {
    orgOps = {
      userOrganizations: {
        deleteMany: {},
        create: organization_ids.map((id) => ({
          organization: { connect: { organization_id: Number(id) } },
        })),
      },
    };
  }

  let updateData = {
    ...rest,
    ...orgOps,
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  return await prisma.user.update({
    where: { user_id: Number(user_id) },
    data: updateData,
    include: {
      userOrganizations: { include: { organization: true } },
    },
  });
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  // getUsersByOrganizations,
  deleteUser,
  updateUser,
};
