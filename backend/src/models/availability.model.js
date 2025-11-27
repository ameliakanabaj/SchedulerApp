const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createAvailability({ user_id, start_time, end_time, comments }) {
  return await prisma.availability.create({
    data: {
      user: { connect: { user_id: Number(user_id) } },
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      comments,
    },
  });
}

async function createAvailabilitiesBulk(items = []) {
  if (!Array.isArray(items) || items.length === 0) return [];

  return await prisma.$transaction(async (tx) => {
    const created = [];

    for (const i of items) {
      const record = await tx.availability.create({
        data: {
          user: { connect: { user_id: Number(i.user_id) } },
          start_time: new Date(i.start_time),
          end_time: new Date(i.end_time),
          comments: i.comments ?? null,
        },
      });

      created.push(record);
    }

    return created;
  });
}

async function getAvailabilityByUser(user_id) {
  return await prisma.availability.findMany({
    where: { user_id: Number(user_id) },
    orderBy: { start_time: "asc" },
  });
}

async function getAvailabilityById(availability_id) {
  return await prisma.availability.findUnique({
    where: { availability_id: Number(availability_id) },
  });
}

async function getAvailabilitiesByUserIds(userIds = []) {
  return await prisma.availability.findMany({
    where: {
      user_id: {
        in: userIds.map(Number),
      },
    },
    orderBy: [
      { user_id: "asc" },
      { start_time: "asc" },
    ],
  });
}

async function updateAvailability(id, data) {
  const allowed = {};
  if (data.start_time) allowed.start_time = new Date(data.start_time);
  if (data.end_time) allowed.end_time = new Date(data.end_time);
  if (data.comments !== undefined) allowed.comments = data.comments;

  return await prisma.availability.update({
    where: { availability_id: Number(id) },
    data: allowed,
  });
}

async function deleteAvailability(id) {
  await prisma.availability.delete({
    where: { availability_id: Number(id) },
  });
  return true;
}

module.exports = {
  createAvailability,
  createAvailabilitiesBulk,
  getAvailabilityByUser,
  getAvailabilityById,
  getAvailabilitiesByUserIds,
  updateAvailability,
  deleteAvailability,
};
