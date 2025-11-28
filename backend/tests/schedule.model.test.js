beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  
  describe("Schedule Model", () => {
    let scheduleModel;
    let prisma;
  
    beforeEach(() => {
      jest.mock("../src/generated/prisma", () => {
        const prismaMock = {
          schedule: {
            create: jest.fn(),
            findMany: jest.fn(),
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
        scheduleModel = require("../src/models/schedule.model");
      });
    });
  
    test("createSchedule should call prisma.schedule.create with correct data", async () => {
      const data = {
        organization_id: 1,
        date_from: "2025-01-01T00:00:00Z",
        date_to: "2025-01-07T00:00:00Z",
        deadline_generate_date: "2024-12-20T00:00:00Z",
      };
  
      prisma.schedule.create.mockResolvedValue({ schedule_id: 1, ...data });
  
      const result = await scheduleModel.createSchedule(data);
  
      expect(prisma.schedule.create).toHaveBeenCalledWith({
        data,
      });
      expect(result).toEqual({ schedule_id: 1, ...data });
    });
  
    test("getSchedulesForOrganization should call findMany with organization_id", async () => {
      const mockSchedules = [{ schedule_id: 5 }];
      prisma.schedule.findMany.mockResolvedValue(mockSchedules);
  
      const result = await scheduleModel.getSchedulesForOrganization(1);
  
      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        where: { organization_id: 1 },
        include: { assignments: true },
      });
  
      expect(result).toEqual(mockSchedules);
    });
  
    test("getSchedulesForUser should call findMany with assignments.some.user_id", async () => {
      const mockSchedules = [{ schedule_id: 10 }];
      prisma.schedule.findMany.mockResolvedValue(mockSchedules);
  
      const result = await scheduleModel.getSchedulesForUser(7);
  
      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        where: {
          assignments: {
            some: { user_id: 7 },
          },
        },
        include: { assignments: true },
      });
  
      expect(result).toEqual(mockSchedules);
    });

    test("updateSchedule should call prisma.schedule.update with correct arguments", async () => {
      const mockResponse = { schedule_id: 3, status: "APPROVED" };
  
      prisma.schedule.update.mockResolvedValue(mockResponse);
  
      const result = await scheduleModel.updateSchedule("3", { status: "APPROVED" });
  
      expect(prisma.schedule.update).toHaveBeenCalledWith({
        where: { schedule_id: 3 },
        data: { status: "APPROVED" },
      });
  
      expect(result).toEqual(mockResponse);
    });
  
    test("deleteSchedule should delete schedule and return true", async () => {
      prisma.schedule.delete.mockResolvedValue(true);
  
      const result = await scheduleModel.deleteSchedule("8");
  
      expect(prisma.schedule.delete).toHaveBeenCalledWith({
        where: { schedule_id: 8 },
      });
  
      expect(result).toBe(true);
    });
  });
  