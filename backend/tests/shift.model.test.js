beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("Shift Model", () => {
  let shiftModel;
  let prisma;

  beforeEach(() => {
    jest.mock("../src/generated/prisma", () => {
      const shiftMock = {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
      };

      const prismaMock = {
        shift: shiftMock,
        $transaction: jest.fn(async (callback) => {
          const tx = { shift: shiftMock };
          return callback(tx);
        }),
      };

      return { PrismaClient: jest.fn(() => prismaMock) };
    });

    jest.isolateModules(() => {
      const { PrismaClient } = require("../src/generated/prisma");
      prisma = new PrismaClient();
      shiftModel = require("../src/models/shift.model");
    });
  });

  test("createShift should call prisma.shift.create with organization connect and dates", async () => {
    prisma.shift.create.mockResolvedValue({ shift_id: 1 });

    const result = await shiftModel.createShift({
      organization_id: 2,
      start_time: "2025-02-01T08:00:00Z",
      end_time: "2025-02-01T16:00:00Z",
      place: "HQ",
      required_people: 4,
    });

    expect(prisma.shift.create).toHaveBeenCalledWith({
      data: {
        organization: { connect: { organization_id: 2 } },
        start_time: new Date("2025-02-01T08:00:00Z"),
        end_time: new Date("2025-02-01T16:00:00Z"),
        place: "HQ",
        required_people: 4,
      },
    });
    expect(result).toEqual({ shift_id: 1 });
  });

  test("getAllShifts should call findMany with orderBy", async () => {
    prisma.shift.findMany.mockResolvedValue([]);
    const res = await shiftModel.getAllShifts();

    expect(prisma.shift.findMany).toHaveBeenCalledWith({
      orderBy: [{ start_time: "asc" }],
    });
    expect(res).toEqual([]);
  });

  test("getAllShiftsByOrganizations should call findMany with in mapped numbers", async () => {
    prisma.shift.findMany.mockResolvedValue([{ shift_id: 2 }]);
    const res = await shiftModel.getAllShiftsByOrganizations(["3", 4]);

    expect(prisma.shift.findMany).toHaveBeenCalledWith({
      where: { organization_id: { in: [3, 4] } },
      orderBy: [{ start_time: "asc" }],
    });
    expect(res).toEqual([{ shift_id: 2 }]);
  });

  test("getShiftById should call findUnique with numeric id", async () => {
    prisma.shift.findUnique.mockResolvedValue({ shift_id: 5 });
    const res = await shiftModel.getShiftById("5");

    expect(prisma.shift.findUnique).toHaveBeenCalledWith({
      where: { shift_id: 5 },
    });
    expect(res).toEqual({ shift_id: 5 });
  });

  test("getShiftsByUser should call findMany with assignments.some.user_id and orderBy", async () => {
    prisma.shift.findMany.mockResolvedValue([{ shift_id: 7 }]);
    const res = await shiftModel.getShiftsByUser("10");

    expect(prisma.shift.findMany).toHaveBeenCalledWith({
      where: {
        assignments: { some: { user_id: 10 } },
      },
      orderBy: [{ start_time: "asc" }],
    });
    expect(res).toEqual([{ shift_id: 7 }]);
  });

  test("updateShift should call update with date conversions when provided", async () => {
    prisma.shift.update.mockResolvedValue({ shift_id: 9 });
    const res = await shiftModel.updateShift(9, { start_time: "2025-03-01T08:00:00Z", place: "New" });

    expect(prisma.shift.update).toHaveBeenCalledWith({
      where: { shift_id: 9 },
      data: {
        start_time: new Date("2025-03-01T08:00:00Z"),
        end_time: undefined,
        place: "New",
        required_people: undefined,
      },
    });
    expect(res).toEqual({ shift_id: 9 });
  });

  test("deleteShift should call delete with numeric id and return true", async () => {
    prisma.shift.delete.mockResolvedValue(true);
    const res = await shiftModel.deleteShift("8");

    expect(prisma.shift.delete).toHaveBeenCalledWith({
      where: { shift_id: 8 },
    });
    expect(res).toEqual(true);
  });

  test("createShiftsBulk should call prisma.$transaction and tx.shift.create for each item", async () => {
    const createMock = jest.fn().mockImplementation(async (data) => ({
      ...data.data,
      shift_id: Math.floor(Math.random() * 100),
    }));

    prisma.$transaction.mockImplementation(async (callback) => {
      const tx = { shift: { create: createMock } };
      return callback(tx);
    });

    const items = [
      {
        organization_id: 1,
        start_time: "2030-01-01T10:00:00Z",
        end_time: "2030-01-01T12:00:00Z",
        place: "A",
        required_people: 2,
      },
      {
        organization_id: 1,
        start_time: "2030-01-02T10:00:00Z",
        end_time: "2030-01-02T12:00:00Z",
        place: "B",
        required_people: 3,
      },
    ];

    const result = await shiftModel.createShiftsBulk(items);

    expect(createMock).toHaveBeenCalledTimes(2);
    expect(createMock).toHaveBeenNthCalledWith(1, {
      data: {
        organization: { connect: { organization_id: 1 } },
        start_time: new Date("2030-01-01T10:00:00Z"),
        end_time: new Date("2030-01-01T12:00:00Z"),
        place: "A",
        required_people: 2,
      },
    });
    expect(createMock).toHaveBeenNthCalledWith(2, {
      data: {
        organization: { connect: { organization_id: 1 } },
        start_time: new Date("2030-01-02T10:00:00Z"),
        end_time: new Date("2030-01-02T12:00:00Z"),
        place: "B",
        required_people: 3,
      },
    });

    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty("shift_id");
  });
});
