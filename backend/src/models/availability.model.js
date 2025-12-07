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

async function updateAvailability(id, data, existing) {
  const allowed = {
    start_time: data.start_time ? new Date(data.start_time) : existing.start_time,
    end_time: data.end_time ? new Date(data.end_time) : existing.end_time,
    comments: data.comments !== undefined ? data.comments : existing.comments,
  };

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

async function deleteAvailabilityByUserAndDay(user_id, dateString) {
  const startOfDay = new Date(dateString + "T00:00:00.000Z");
  const nextDayStart = new Date(startOfDay);
  nextDayStart.setDate(nextDayStart.getDate() + 1);

  return await prisma.availability.deleteMany({
    where: {
      user_id: Number(user_id),
      start_time: {
        gte: startOfDay,
        lt: nextDayStart
      }
    },
  });
}

module.exports = {
  createAvailability,
  createAvailabilitiesBulk,
  getAvailabilityByUser,
  getAvailabilityById,
  getAvailabilitiesByUserIds,
  updateAvailability,
  deleteAvailability,
  deleteAvailabilityByUserAndDay,
};
