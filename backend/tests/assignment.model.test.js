let assignmentModel;
let prisma;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("Assignment Model", () => {
  beforeEach(() => {
    jest.mock("../src/generated/prisma", () => {
      const prismaMock = {
        assignment: {
          create: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          delete: jest.fn(),
          update: jest.fn(),
        },
      };

      return {
        PrismaClient: jest.fn(() => prismaMock),
      };
    });

    jest.isolateModules(() => {
      const { PrismaClient } = require("../src/generated/prisma");
      prisma = new PrismaClient();
      assignmentModel = require("../src/models/assignment.model");
    });
  });

  test("createAssignment should call prisma.assignment.create", async () => {
    prisma.assignment.create.mockResolvedValue({ id: 1 });

    await assignmentModel.createAssignment({
      shift_id: 10,
      user_id: 20,
      role_on_shift: "CASHIER",
    });

    expect(prisma.assignment.create).toHaveBeenCalledWith({
      data: {
        shift: { connect: { shift_id: 10 } },
        user: { connect: { user_id: 20 } },
        role_on_shift: "CASHIER",
      },
    });
  });

  test("getAssignmentById should call findUnique", async () => {
    prisma.assignment.findUnique.mockResolvedValue({ id: 1 });

    await assignmentModel.getAssignmentById(3);

    expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
      where: { assignment_id: 3 },
      include: expect.any(Object),
    });
  });

  test("getAssignmentsByShift should call findMany", async () => {
    prisma.assignment.findMany.mockResolvedValue([{ id: 1 }]);

    await assignmentModel.getAssignmentsByShift(4);

    expect(prisma.assignment.findMany).toHaveBeenCalledWith({
      where: { shift_id: 4 },
      include: { user: true },
    });
  });

  test("getAssignmentsByUser should call findMany", async () => {
    prisma.assignment.findMany.mockResolvedValue([{ id: 1 }]);

    await assignmentModel.getAssignmentsByUser(7);

    expect(prisma.assignment.findMany).toHaveBeenCalledWith({
      where: { user_id: 7 },
      include: { shift: true },
    });
  });

  test("deleteAssignment should call delete", async () => {
    prisma.assignment.delete.mockResolvedValue(true);

    await assignmentModel.deleteAssignment(9);

    expect(prisma.assignment.delete).toHaveBeenCalledWith({
      where: { assignment_id: 9 },
    });
  });

  test("updateAssignment should call update", async () => {
    prisma.assignment.update.mockResolvedValue({ id: 1 });

    await assignmentModel.updateAssignment(9, { role_on_shift: "LEADER" });

    expect(prisma.assignment.update).toHaveBeenCalledWith({
      where: { assignment_id: 9 },
      data: { role_on_shift: "LEADER" },
    });
  });
});
