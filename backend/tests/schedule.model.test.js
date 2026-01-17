describe("Schedule Model", () => {
    let scheduleModel;
    let prisma;
  
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
  
      jest.mock("../src/generated/prisma", () => {
        const prismaMock = {
          schedule: {
            create: jest.fn(),
            findUnique: jest.fn(),
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
  
    test("createSchedule should call prisma.schedule.create", async () => {
      const mockData = {
        organization_id: 1,
        date_from: "2025-01-01",
        date_to: "2025-02-01",
        deadline_generate_date: "2024-12-01",
      };
  
      prisma.schedule.create.mockResolvedValue({ schedule_id: 1, ...mockData });
  
      const result = await scheduleModel.createSchedule(mockData);
  
      expect(prisma.schedule.create).toHaveBeenCalledWith({ data: mockData });
      expect(result).toEqual({ schedule_id: 1, ...mockData });
    });
  
    test("getScheduleById should call findUnique", async () => {
      prisma.schedule.findUnique.mockResolvedValue({ schedule_id: 7 });
  
      const result = await scheduleModel.getScheduleById(7);
  
        expect(prisma.schedule.findUnique).toHaveBeenCalledWith({
            where: { schedule_id: 7 },
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
  
      expect(result).toEqual({ schedule_id: 7 });
    });
    
    test("getScheduleById should call prisma.schedule.findUnique with numeric id", async () => {
        prisma.schedule.findUnique.mockResolvedValue({ schedule_id: 3 });
    
        const res = await scheduleModel.getScheduleById(3);
    
        expect(prisma.schedule.findUnique).toHaveBeenCalledWith({
            where: { schedule_id: 3 },
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
    
        expect(res).toEqual({ schedule_id: 3 });
    });
  
    test("getSchedulesForOrganization should call findMany with orderBy", async () => {
      const mockSchedules = [{ schedule_id: 10 }];
  
      prisma.schedule.findMany.mockResolvedValue(mockSchedules);
  
      const result = await scheduleModel.getSchedulesForOrganization(1);
  
      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        where: { organization_id: 1 },
        include: { assignments: true },
        orderBy: { date_from: "asc" },
      });
  
      expect(result).toEqual(mockSchedules);
    });
  
    test("getSchedulesForUser should call findMany with assignments.some.user_id", async () => {
      prisma.schedule.findMany.mockResolvedValue([{ schedule_id: 1 }]);
  
      const result = await scheduleModel.getSchedulesForUser(5);
  
      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        where: {
          assignments: {
            some: { user_id: 5 },
          },
        },
        include: { assignments: true },
        orderBy: { date_from: "asc" },
      });
  
      expect(result).toEqual([{ schedule_id: 1 }]);
    });
  
    test("updateSchedule should call prisma.update", async () => {
      prisma.schedule.update.mockResolvedValue({ schedule_id: 22 });
  
      const data = { status: "APPROVED" };
  
      const result = await scheduleModel.updateSchedule(22, data);
  
      expect(prisma.schedule.update).toHaveBeenCalledWith({
        where: { schedule_id: 22 },
        data,
      });
  
      expect(result).toEqual({ schedule_id: 22 });
    });
  
    test("deleteSchedule should call prisma.delete", async () => {
      prisma.schedule.delete.mockResolvedValue(true);
  
      const result = await scheduleModel.deleteSchedule(13);
  
      expect(prisma.schedule.delete).toHaveBeenCalledWith({
        where: { schedule_id: 13 },
      });
  
      expect(result).toEqual(true);
    });
  });
  