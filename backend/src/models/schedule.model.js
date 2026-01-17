const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createSchedule({ organization_id, date_from, date_to, deadline_generate_date }) {
  return await prisma.schedule.create({
    data: {
      organization_id,
      date_from,
      date_to,
      deadline_generate_date,
    },
  });
}

async function getScheduleById(id) {
  return await prisma.schedule.findUnique({
    where: { schedule_id: Number(id) },
    include: {
      assignments: {
        include: {
            shift: true,
            user: true,
        },
      },
      organization: true,
    },
  });
}

async function getSchedulesForOrganization(organizationId) {
  return await prisma.schedule.findMany({
    where: { organization_id: Number(organizationId) },
    include: {
      assignments: true,
    },
    orderBy: { date_from: "asc" },
  });
}

async function getSchedulesForUser(userId) {
  return await prisma.schedule.findMany({
    where: {
      assignments: {
        some: { user_id: Number(userId) },
      },
    },
    include: { assignments: true },
    orderBy: { date_from: "asc" },
  });
}

async function updateSchedule(id, data) {
  return await prisma.schedule.update({
    where: { schedule_id: Number(id) },
    data,
  });
}

async function deleteSchedule(id) {
  await prisma.schedule.delete({
    where: { schedule_id: Number(id) },
  });
  return true;
}

async function canGenerateSchedule(scheduleId) {
  const schedule = await prisma.schedule.findUnique({
    where: { schedule_id: Number(scheduleId) },
    include: {
      organization: {
        include: {
          users: {
            include: {
              availabilities: true,
            },
          },
        },
      },
    },
  });

  if (!schedule) return null;

  const now = new Date();

  const deadlineDatePassed = now >= schedule.deadline_generate_date;

  const users = schedule.organization.users;

  const allUsersSentAvailability =
    users.length > 0 &&
    users.every((user) => user.availabilities.length > 0);

  return {
    deadlineDatePassed,
    allUsersSentAvailability,
    canGenerate: deadlineDatePassed || allUsersSentAvailability,
  };
}


module.exports = {
  createSchedule,
  getScheduleById,
  getSchedulesForOrganization,
  getSchedulesForUser,
  updateSchedule,
  deleteSchedule,
  canGenerateSchedule
};
