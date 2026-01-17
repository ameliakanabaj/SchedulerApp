beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("Availability Model", () => {
  let availabilityModel;
  let prisma;

  beforeEach(() => {
    jest.mock("../src/generated/prisma", () => {
      const prismaMock = {
        availability: {
          create: jest.fn(),
          findMany: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          deleteMany: jest.fn(),
        },
        $transaction: jest.fn(),
      };

      return {
        PrismaClient: jest.fn(() => prismaMock),
      };
    });

    jest.isolateModules(() => {
      const { PrismaClient } = require("../src/generated/prisma");
      prisma = new PrismaClient();
      availabilityModel = require("../src/models/availability.model");
    });
  });

  test("createAvailability should call prisma.availability.create", async () => {
    prisma.availability.create.mockResolvedValue({ id: 1 });

    await availabilityModel.createAvailability({
      user_id: 5,
      start_time: "2025-01-01T10:00:00Z",
      end_time: "2025-01-01T12:00:00Z",
      comments: "note",
    });

    expect(prisma.availability.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user: { connect: { user_id: 5 } },
        start_time: new Date("2025-01-01T10:00:00Z"),
        end_time: new Date("2025-01-01T12:00:00Z"),
        comments: "note",
      }),
    });
  });

  test("createAvailabilitiesBulk should call $transaction and create multiple records", async () => {
    const items = [
      { user_id: 1, start_time: "2025-01-01T10:00:00Z", end_time: "2025-01-01T12:00:00Z" },
      { user_id: 2, start_time: "2025-01-02T10:00:00Z", end_time: "2025-01-02T12:00:00Z" },
    ];

    const mockTx = {
      availability: {
        create: jest.fn()
          .mockResolvedValueOnce({ id: 1 })
          .mockResolvedValueOnce({ id: 2 }),
      },
    };

    prisma.$transaction.mockImplementation(async (cb) => cb(mockTx));

    const result = await availabilityModel.createAvailabilitiesBulk(items);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    expect(mockTx.availability.create).toHaveBeenCalledTimes(2);
  });

  test("getAvailabilityByUser should call findMany", async () => {
    prisma.availability.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await availabilityModel.getAvailabilityByUser(3);

    expect(prisma.availability.findMany).toHaveBeenCalledWith({
      where: { user_id: 3 },
      orderBy: { start_time: "asc" },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  test("getAvailabilitiesByUserIds should call findMany with in", async () => {
    prisma.availability.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await availabilityModel.getAvailabilitiesByUserIds([1, 2, 3]);

    expect(prisma.availability.findMany).toHaveBeenCalledWith({
      where: { user_id: { in: [1, 2, 3] } },
      orderBy: [
        { user_id: "asc" },
        { start_time: "asc" },
      ],
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  test("getAvailabilityById should call findUnique", async () => {
    prisma.availability.findUnique.mockResolvedValue({ id: 1 });

    await availabilityModel.getAvailabilityById(10);

    expect(prisma.availability.findUnique).toHaveBeenCalledWith({
      where: { availability_id: 10 },
    });
  });

  test("updateAvailability should call update", async () => {
    prisma.availability.update.mockResolvedValue({ id: 1 });

    const existing = {
      start_time: new Date("2099-01-10T08:00:00Z"),
      end_time: new Date("2099-01-10T10:00:00Z"),
      comments: "old comment"
    };

    await availabilityModel.updateAvailability(7, { comments: "updated" }, existing);

    expect(prisma.availability.update).toHaveBeenCalledWith({
      where: { availability_id: 7 },
      data: {
        start_time: existing.start_time,
        end_time: existing.end_time,
        comments: "updated",
      },
    });
  });

  test("deleteAvailability should call delete", async () => {
    prisma.availability.delete.mockResolvedValue(true);

    const result = await availabilityModel.deleteAvailability(9);

    expect(prisma.availability.delete).toHaveBeenCalledWith({
      where: { availability_id: 9 },
    });
    expect(result).toBe(true);
  });

  test("deleteAvailabilityByUserAndDay should call deleteMany with date range", async () => {
    prisma.availability.deleteMany.mockResolvedValue({ count: 2 });

    const result = await availabilityModel.deleteAvailabilityByUserAndDay(5, "2025-01-01");

    expect(prisma.availability.deleteMany).toHaveBeenCalledWith({
      where: {
        user_id: 5,
        start_time: {
          gte: new Date("2025-01-01T00:00:00.000Z"),
          lt: new Date("2025-01-02T00:00:00.000Z"),
        },
      },
    });
    expect(result).toEqual({ count: 2 });
  });
});
