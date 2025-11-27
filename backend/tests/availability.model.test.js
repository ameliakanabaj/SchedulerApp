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
        },
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

  test("getAvailabilityByUser should call findMany", async () => {
    prisma.availability.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await availabilityModel.getAvailabilityByUser(3);

    expect(prisma.availability.findMany).toHaveBeenCalledWith({
      where: { user_id: 3 },
      orderBy: { start_time: "asc" },
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

    await availabilityModel.updateAvailability(7, { comments: "updated" });

    expect(prisma.availability.update).toHaveBeenCalledWith({
      where: { availability_id: 7 },
      data: { comments: "updated" },
    });
  });

  test("deleteAvailability should call delete", async () => {
    prisma.availability.delete.mockResolvedValue(true);

    await availabilityModel.deleteAvailability(9);

    expect(prisma.availability.delete).toHaveBeenCalledWith({
      where: { availability_id: 9 },
    });
  });
});
