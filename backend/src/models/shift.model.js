const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createShift({ organization_id, date, start_time, end_time, place }) {
  return await prisma.shift.create({
    data: {
      organization: organization_id ? { connect: { organization_id: Number(organization_id) } } : undefined,
      date: date ? new Date(date) : null,
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      place,
    },
  });
}

async function getAllShifts() {
  return await prisma.shift.findMany({
    orderBy: [{ date: "asc" }, { start_time: "asc" }],
  });
}

// jeszcze nieuzywane i nie wiem czy potrzebne
// async function getAllShiftsByOrganization(organization_id) {
//   return await prisma.shift.findMany({
//     where: { organization_id: Number(organization_id) },
//     orderBy: [{ date: "asc" }, { start_time: "asc" }],
//   });
// }

async function getAllShiftsByOrganizations(organization_ids) {
  return await prisma.shift.findMany({
    where: { organization_id: { in: organization_ids.map(Number) } },
    orderBy: [{ date: "asc" }, { start_time: "asc" }],
  });
}

async function getShiftById(shift_id) {
  return await prisma.shift.findUnique({
    where: { shift_id: Number(shift_id) },
  });
}

async function updateShift(shift_id, data) {
  const { date, start_time, end_time, place } = data;
  return await prisma.shift.update({
    where: { shift_id: Number(shift_id) },
    data: {
      date: date ? new Date(date) : undefined,
      start_time: start_time ? new Date(start_time) : undefined,
      end_time: end_time ? new Date(end_time) : undefined,
      place,
    },
  });
}

async function deleteShift(shift_id) {
  await prisma.shift.delete({ where: { shift_id: Number(shift_id) } });
  return true;
}

module.exports = {
  createShift,
  getAllShifts,
  // getAllShiftsByOrganization,
  getAllShiftsByOrganizations,
  getShiftById,
  updateShift,
  deleteShift,
};
