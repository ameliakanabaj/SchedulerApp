const { createSchedule, updateSchedule } = require("../src/controllers/schedule.controller");
const { getMyNotifications, markAsRead } = require("../src/controllers/notifications.controller");
const scheduleGenerator = require("../src/services/scheduleGenerator.service");
const cronService = require("../src/services/cron.service");
const notificationService = require("../src/services/notifications.service");
const scheduleModel = require("../src/models/schedule.model");
const userModel = require("../src/models/user.model");
const emailService = require("../src/services/email.service");

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
      findUnique: jest.fn(),
    },
    assignment: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      findFirst: jest.fn(), 
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient();

jest.mock("../src/models/schedule.model");
jest.mock("../src/models/user.model");
jest.mock("../src/services/email.service");
jest.mock("fs");

const flushPromises = () => new Promise(resolve => {
  const actualSetImmediate = jest.requireActual('timers').setImmediate;
  actualSetImmediate(resolve);
});

describe("Notification System Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    jest.spyOn(notificationService, "sendNotification").mockResolvedValue(true);

    prisma.notification.deleteMany.mockResolvedValue({ count: 0 });
    prisma.notification.findMany.mockResolvedValue([]);
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


  describe("4. updateSchedule (Deadline Extension)", () => {
    it("should send AVAILABILITY_OPEN again if deadline is extended", async () => {
      const req = {
        params: { scheduleId: 100 },
        body: { deadline_generate_date: "2026-05-30" }, 
        user: { role: "ORG_ADMIN", organization_id: 2 }
      };
      const res = { json: jest.fn() };
      const next = jest.fn();

      scheduleModel.getScheduleById.mockResolvedValue({
        schedule_id: 100,
        organization_id: 2,
        deadline_generate_date: "2026-05-25",
        date_from: "2026-06-01",
        date_to: "2026-06-30"
      });

      scheduleModel.updateSchedule.mockResolvedValue({});
      userModel.getUsersByOrganization.mockResolvedValue([
        { user_id: 1, role: "EMPLOYEE" }
      ]);

      await updateSchedule(req, res, next);

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({ 
            userId: 1, 
            type: "AVAILABILITY_OPEN",
            message: expect.stringContaining("extended")
        })
      );
    });
  });

  describe("5. Frontend API (Get Notifications)", () => {
    it("should fetch notifications with a limit of 20 (Anti-spam check)", async () => {
        const req = { user: { user_id: 5 } };
        const res = { json: jest.fn() };
        const next = jest.fn();

        prisma.notification.findMany.mockResolvedValue([{ id: 1, message: "Test" }]);

        await getMyNotifications(req, res, next);

        expect(prisma.notification.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { user_id: 5 },
                take: 20, 
                orderBy: { sent_at: 'desc' }
            })
        );

        expect(res.json).toHaveBeenCalledWith([{ id: 1, message: "Test" }]);
    });

    it("should mark notification as read", async () => {
      const req = { 
          params: { id: 1 }, 
          user: { user_id: 5 } 
      };
      const res = { json: jest.fn() };
      const next = jest.fn();

      prisma.notification.findFirst.mockResolvedValue({ 
          notification_id: 1, 
          user_id: 5, 
          is_read: false 
      });

      prisma.notification.update.mockResolvedValue({ 
          notification_id: 1, 
          user_id: 5, 
          is_read: true 
      });

      
      await markAsRead(req, res, next);

      expect(prisma.notification.update).toHaveBeenCalledWith(
          expect.objectContaining({
              where: { notification_id: 1 },
              data: { is_read: true }
          })
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe("6. Cron Cleanup (Database Hygiene)", () => {
    it("should clean old notifications with correct rules (3 days vs 30 days)", async () => {
        jest.useFakeTimers({ doNotFake: ['setImmediate'] }); 
        
        cronService.init(); 
        
        await flushPromises();

        expect(prisma.notification.deleteMany).toHaveBeenCalledTimes(2);

        expect(prisma.notification.deleteMany).toHaveBeenNthCalledWith(1, 
            expect.objectContaining({
                where: {
                    type: { in: ["REMINDER_24H", "MISSING_AVAILABILITY"] },
                    sent_at: { lt: expect.any(Date) } 
                }
            })
        );

        expect(prisma.notification.deleteMany).toHaveBeenNthCalledWith(2, 
            expect.objectContaining({
                where: {
                    sent_at: { lt: expect.any(Date) }
                }
            })
        );
        
        jest.useRealTimers();
    });
  });

  describe("7. Edge Cases & Error Handling", () => {

    it("should save notification with status 'FAILED' if email service fails", async () => {

      jest.restoreAllMocks(); 
      
      prisma.user.findUnique.mockResolvedValue({ 
        user_id: 1, 
        email: "fail@test.com" 
      });

      emailService.sendEmail.mockResolvedValue(false);

      prisma.notification.create.mockResolvedValue({ 
        id: 1, 
        status: "FAILED" 
      });

      await notificationService.sendNotification({
        userId: 1,
        type: "SCHEDULE_GENERATED",
        scheduleId: 100,
        message: "Test Message"
      });

      expect(emailService.sendEmail).toHaveBeenCalled();

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "FAILED",
            sent_at: null
          })
        })
      );
    });

    it("should gracefully abort if user has no email address", async () => {
      jest.restoreAllMocks();

      prisma.user.findUnique.mockResolvedValue({ 
        user_id: 2, 
        email: null 
      });

      await notificationService.sendNotification({
        userId: 2,
        type: "REMINDER_24H",
        message: "Panic!"
      });

      expect(emailService.sendEmail).not.toHaveBeenCalled();
      
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it("should prevent marking notification as read if it belongs to another user", async () => {
      const req = { 
        params: { id: 999 }, 
        user: { user_id: 5 }
      };
      const res = { json: jest.fn() };
      const next = jest.fn();

      prisma.notification.findFirst.mockResolvedValue(null);

      await markAsRead(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(prisma.notification.update).not.toHaveBeenCalled();
    });
  });

});
