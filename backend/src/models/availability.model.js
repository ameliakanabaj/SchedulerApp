const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createAvailability({ user_id, date, start_time, end_time, comments, status }) {
  return await prisma.availability.create({
    data: {
      user: { connect: { user_id: Number(user_id) } },
      date: date ? new Date(date) : null,
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      comments,
      status,
    },
  });
}

async function getAvailabilityByUser(user_id) {
  return await prisma.availability.findMany({
    where: { user_id: Number(user_id) },
  });
}

async function getAvailabilityById(availability_id) {
  return await prisma.availability.findUnique({
    where: { availability_id: Number(availability_id) },
  });
}

async function updateAvailability(id, data) {
  const payload = { ...data };
  if (data.date) payload.date = new Date(data.date);
  if (data.start_time) payload.start_time = new Date(data.start_time);
  if (data.end_time) payload.end_time = new Date(data.end_time);
  return await prisma.availability.update({
    where: { availability_id: Number(id) },
    data: payload,
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
  getAvailabilityByUser,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
};
