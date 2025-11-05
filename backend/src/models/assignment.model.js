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

module.exports = {
  createAssignment,
  getAssignmentsByShift,
  getAssignmentsByUser,
  deleteAssignment,
};
