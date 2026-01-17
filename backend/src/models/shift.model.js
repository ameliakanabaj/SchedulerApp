const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createShift({ organization_id, start_time, end_time, place, required_people }) {
  return await prisma.shift.create({
    data: {
      organization: organization_id ? { connect: { organization_id: Number(organization_id) } } : undefined,
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      place,
      required_people: required_people ?? undefined,
    },
  });
}

async function createShiftsBulk(items = []) {
  if (!Array.isArray(items) || items.length === 0) return [];

  return await prisma.$transaction(async (tx) => {
    const created = [];

    for (const i of items) {
      const record = await tx.shift.create({
        data: {
          organization: i.organization_id
            ? { connect: { organization_id: Number(i.organization_id) } }
            : undefined,
          start_time: new Date(i.start_time),
          end_time: new Date(i.end_time),
          place: i.place,
          required_people: i.required_people ?? undefined,
        },
      });

      created.push(record);
    }

    return created;
  });
}

async function getAllShifts() {
  return await prisma.shift.findMany({
    orderBy: [{ start_time: "asc" }],
  });
}

async function getAllShiftsByOrganizations(organization_ids) {
  return await prisma.shift.findMany({
    where: { organization_id: { in: organization_ids.map(Number) } },
    orderBy: [{ start_time: "asc" }],
  });
}

async function getShiftById(shift_id) {
  return await prisma.shift.findUnique({
    where: { shift_id: Number(shift_id) },
  });
}

async function getShiftsByUser(user_id) {
  return await prisma.shift.findMany({
    where: {
      assignments: {
        some: {
          user_id: Number(user_id)
        }
      }
    },
    orderBy: [{ start_time: "asc" }],
  });
}

async function updateShift(shift_id, data) {
  const { start_time, end_time, place, required_people } = data;
  return await prisma.shift.update({
    where: { shift_id: Number(shift_id) },
    data: {
      start_time: start_time ? new Date(start_time) : undefined,
      end_time: end_time ? new Date(end_time) : undefined,
      place,
      required_people: required_people ?? undefined,
    },
  });
}

async function deleteShift(shift_id) {
  await prisma.shift.delete({ where: { shift_id: Number(shift_id) } });
  return true;
}

module.exports = {
  createShift,
  createShiftsBulk,
  getAllShifts,
  getAllShiftsByOrganizations,
  getShiftById,
  getShiftsByUser,
  updateShift,
  deleteShift,
};
