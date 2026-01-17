const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createAssignment({ shift_id, user_id, role_on_shift }) {
  return await prisma.assignment.create({
    data: {
      shift: { connect: { shift_id: Number(shift_id) } },
      user: { connect: { user_id: Number(user_id) } },
      role_on_shift,
    },
  });
}

async function getAssignmentById(assignment_id) {
  return prisma.assignment.findUnique({
    where: { assignment_id: Number(assignment_id) },
    include: {
      user: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          email: true,
          role: true,
          position: true,
          organization_id: true
        }
      },
      shift: {
        select: {
          shift_id: true,
          organization_id: true,
          start_time: true,
          end_time: true
        }
      }
    },
  });
}

async function getAssignmentsByShift(shift_id) {
  return await prisma.assignment.findMany({
    where: { shift_id: Number(shift_id) },
    include: { user: true },
  });
}

async function getAssignmentsByUser(user_id) {
  return await prisma.assignment.findMany({
    where: { user_id: Number(user_id) },
    include: { shift: true },
  });
}

async function deleteAssignment(assignment_id) {
  await prisma.assignment.delete({
    where: { assignment_id: Number(assignment_id) },
  });
  return true;
}

async function updateAssignment(assignment_id, data) {
  const updateData = { ...data };
    if (updateData.user_id !== undefined && updateData.user_id !== null && updateData.user_id !== '') {
      const userIdNum = Number(updateData.user_id);
      if (!isNaN(userIdNum)) {
        updateData.user = { connect: { user_id: userIdNum } };
      }
      delete updateData.user_id;
    }
    if (updateData.shift_id !== undefined && updateData.shift_id !== null && updateData.shift_id !== '') {
      const shiftIdNum = Number(updateData.shift_id);
      if (!isNaN(shiftIdNum)) {
        updateData.shift = { connect: { shift_id: shiftIdNum } };
      }
      delete updateData.shift_id;
    }
    if (updateData.schedule_id !== undefined && updateData.schedule_id !== null && updateData.schedule_id !== '') {
      const scheduleIdNum = Number(updateData.schedule_id);
      if (!isNaN(scheduleIdNum)) {
        updateData.schedule = { connect: { schedule_id: scheduleIdNum } };
      }
      delete updateData.schedule_id;
    }

  return prisma.assignment.update({
    where: { assignment_id: Number(assignment_id) },
    data: updateData,
    include: {
      shift: {
        select: {
          shift_id: true,
          organization_id: true,
          start_time: true,
          end_time: true
        }
      }
    }
  });
}

module.exports = {
  createAssignment,
  getAssignmentById,
  getAssignmentsByShift,
  getAssignmentsByUser,
  deleteAssignment,
  updateAssignment,
};
