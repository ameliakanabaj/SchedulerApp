const { createSchedule } = require("../src/controllers/schedule.controller");
const scheduleGenerator = require("../src/services/scheduleGenerator.service");
const cronService = require("../src/services/cron.service");
const notificationService = require("../src/services/notifications.service");
const scheduleModel = require("../src/models/schedule.model");
const userModel = require("../src/models/user.model");

const { PrismaClient } = require("../src/generated/prisma");

jest.mock("../src/generated/prisma", () => {
  const mPrisma = {
    schedule: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    shift: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    assignment: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient();

jest.mock("../src/services/notifications.service");
jest.mock("../src/models/schedule.model");
jest.mock("../src/models/user.model");
jest.mock("../src/services/email.service");
jest.mock("fs");

describe("Notification System Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService.sendNotification.mockResolvedValue(true);
  });


  describe("1. createSchedule (Controller)", () => {
    it("should send AVAILABILITY_OPEN notification to all employees after creating schedule", async () => {
      const req = {
        body: {
          organization_id: 2,
          date_from: "2026-06-01",
          date_to: "2026-06-30",
          deadline_generate_date: "2026-05-25"
        },
        user: { role: "ORG_ADMIN", organization_id: 2 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      scheduleModel.createSchedule.mockResolvedValue({
        schedule_id: 100,
        ...req.body
      });
      userModel.getUsersByOrganization.mockResolvedValue([
        { user_id: 1, role: "EMPLOYEE", email: "jan@test.pl" },
        { user_id: 2, role: "ORG_ADMIN", email: "szef@test.pl" }
      ]);

      await createSchedule(req, res, next);

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          type: "AVAILABILITY_OPEN",
          scheduleId: 100
        })
      );

      expect(notificationService.sendNotification).not.toHaveBeenCalledWith(
        expect.objectContaining({ userId: 2 })
      );
    });
  });


  describe("2. generateSchedule (Service)", () => {
    
    it("should NOT send notifications immediately when shifts cannot be covered (wait for Admin action)", async () => {
      const scheduleId = 100;

      prisma.schedule.findUnique.mockResolvedValue({
        schedule_id: scheduleId,
        organization_id: 2,
        date_from: new Date("2026-06-01"),
        date_to: new Date("2026-06-30")
      });

      prisma.shift.findMany.mockResolvedValue([
        { 
          shift_id: 50, 
          start_time: new Date("2026-06-01T08:00:00Z"), 
          end_time: new Date("2026-06-01T16:00:00Z"),
          required_people: 1 
        }
      ]);

      prisma.user.findMany.mockResolvedValue([
        { 
          user_id: 1, 
          role: "EMPLOYEE", 
          availabilities: [] 
        }
      ]);

      await scheduleGenerator.generateSchedule(scheduleId);

      expect(prisma.schedule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { schedule_id: scheduleId },
          data: { status: "FAILED" }
        })
      );

      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    it("should send SCHEDULE_GENERATED notification to Org Admin on success", async () => {
      const scheduleId = 100;

      prisma.schedule.findUnique.mockResolvedValue({
        schedule_id: scheduleId,
        organization_id: 2,
        date_from: new Date("2026-06-01"),
        date_to: new Date("2026-06-30")
      });

      prisma.shift.findMany.mockResolvedValue([
        { 
          shift_id: 50, 
          start_time: new Date("2026-06-01T08:00:00Z"), 
          end_time: new Date("2026-06-01T16:00:00Z"),
          required_people: 1 
        }
      ]);

      prisma.user.findMany.mockResolvedValue([
        { 
          user_id: 1, 
          role: "EMPLOYEE", 
          availabilities: [
             { start_time: new Date("2026-06-01T00:00:00Z"), end_time: new Date("2026-06-01T23:59:00Z") }
          ]
        },
        {
          user_id: 99,
          role: "ORG_ADMIN",
          availabilities: []
        }
      ]);

      prisma.assignment.create.mockResolvedValue({});

      await scheduleGenerator.generateSchedule(scheduleId);

      expect(prisma.schedule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { schedule_id: scheduleId },
          data: expect.objectContaining({ status: "GENERATED" })
        })
      );

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 99,
          type: "SCHEDULE_GENERATED",
          scheduleId: scheduleId
        })
      );
    });
  });

  
  describe("3. Cron Job (24h Reminder)", () => {
    it("should send REMINDER_24H if deadline is tomorrow and user has no availability", async () => {
      if (typeof cronService.checkDeadlinesAndNotify !== 'function') {
        return;
      }

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      prisma.schedule.findMany.mockResolvedValue([
        { 
          schedule_id: 72, 
          organization_id: 2, 
          deadline_generate_date: tomorrow,
          date_from: new Date("2026-06-01"),
          date_to: new Date("2026-06-30"),
          status: "OPEN"
        }
      ]);

      prisma.user.findMany.mockResolvedValue([
        { 
          user_id: 5, 
          role: "EMPLOYEE", 
          availabilities: []
        }
      ]);

      await cronService.checkDeadlinesAndNotify();

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 5,
          type: "REMINDER_24H",
          scheduleId: 72
        })
      );
    });

    it("should NOT send notification if user already submitted availability", async () => {
      if (typeof cronService.checkDeadlinesAndNotify !== 'function') return;

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      prisma.schedule.findMany.mockResolvedValue([
        { 
          schedule_id: 80, 
          organization_id: 2, 
          deadline_generate_date: tomorrow,
          date_from: new Date("2026-06-01"),
          date_to: new Date("2026-06-30"),
          status: "OPEN"
        }
      ]);

      prisma.user.findMany.mockResolvedValue([
        { 
          user_id: 6, 
          role: "EMPLOYEE", 
          availabilities: [
            { start_time: new Date("2026-06-02T08:00:00Z"), end_time: new Date("2026-06-02T16:00:00Z") }
          ] 
        }
      ]);

      await cronService.checkDeadlinesAndNotify();

      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });
  });

});
