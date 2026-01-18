const scheduleController = require("../src/controllers/schedule.controller");
const scheduleModel = require("../src/models/schedule.model");
const userModel = require("../src/models/user.model");
const notificationService = require("../src/services/notifications.service");

jest.mock("../src/models/schedule.model");
jest.mock("../src/models/user.model");
jest.mock("../src/services/notifications.service");

describe("Schedule Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
    
    if (notificationService.sendNotification) {
        notificationService.sendNotification.mockResolvedValue(true);
    }
  });

  describe("createSchedule", () => {
    it("should create schedule for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.body = {
        organization_id: 1,
        date_from: "2025-01-01T00:00:00Z",
        date_to: "2025-01-07T23:59:00Z",
        deadline_generate_date: "2024-12-20T23:59:00Z",
      };

      const created = { schedule_id: 1, ...req.body };
      scheduleModel.createSchedule.mockResolvedValue(created);
      userModel.getUsersByOrganization.mockResolvedValue([]); 

      await scheduleController.createSchedule(req, res, next);

      expect(scheduleModel.createSchedule).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("should deny access for ORG_ADMIN trying to create schedule in another org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 5;

      req.body.organization_id = 7;

      await scheduleController.createSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
      expect(scheduleModel.createSchedule).not.toHaveBeenCalled();
    });

    it("should call next(err) when model throws error", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.body.organization_id = 1;

      const err = new Error("DB error");
      scheduleModel.createSchedule.mockRejectedValue(err);

      await scheduleController.createSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("getScheduleById", () => {
    it("should return a schedule by id", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.scheduleId = 5;

      const schedule = { schedule_id: 5, organization_id: 1 };
      scheduleModel.getScheduleById.mockResolvedValue(schedule);

      await scheduleController.getScheduleById(req, res, next);

      expect(scheduleModel.getScheduleById).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(schedule);
    });

    it("should return 404 if schedule not found", async () => {
      req.params.scheduleId = 99;

      scheduleModel.getScheduleById.mockResolvedValue(null);

      await scheduleController.getScheduleById(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Schedule not found",
        statusCode: 404,
      });
    });

    it("should call next(error) on DB error", async () => {
      req.params.scheduleId = 5;

      const error = new Error("DB error");
      scheduleModel.getScheduleById.mockRejectedValue(error);

      await scheduleController.getScheduleById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSchedulesByOrganization", () => {
    it("should return schedules for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.organizationId = 1;

      const schedules = [{ schedule_id: 1 }];
      scheduleModel.getSchedulesForOrganization.mockResolvedValue(schedules);

      await scheduleController.getSchedulesByOrganization(req, res, next);

      expect(scheduleModel.getSchedulesForOrganization).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(schedules);
    });

    it("should deny access if ORG_ADMIN tries to access a different org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 3;
      req.params.organizationId = 99;

      await scheduleController.getSchedulesByOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
      expect(scheduleModel.getSchedulesForOrganization).not.toHaveBeenCalled();
    });

    it("should call next(err) when model throws", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.organizationId = 1;

      const error = new Error("DB error");
      scheduleModel.getSchedulesForOrganization.mockRejectedValue(error);

      await scheduleController.getSchedulesByOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSchedulesForUser", () => {
    it("should return schedules for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.userId = 4;

      const schedules = [{ schedule_id: 2 }];
      scheduleModel.getSchedulesForUser.mockResolvedValue(schedules);

      await scheduleController.getSchedulesForUser(req, res, next);

      expect(scheduleModel.getSchedulesForUser).toHaveBeenCalledWith(4);
      expect(res.json).toHaveBeenCalledWith(schedules);
    });

    it("should deny EMPLOYEE from accessing schedules of others", async () => {
      req.user.role = "EMPLOYEE";
      req.user.user_id = 10;
      req.params.userId = 999;

      await scheduleController.getSchedulesForUser(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });

      expect(scheduleModel.getSchedulesForUser).not.toHaveBeenCalled();
    });

    it("should call next(err) when model fails", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.userId = 7;

      const error = new Error("DB error");
      scheduleModel.getSchedulesForUser.mockRejectedValue(error);

      await scheduleController.getSchedulesForUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateSchedule", () => {
    it("should update schedule for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.scheduleId = 5;

      scheduleModel.getScheduleById.mockResolvedValue({ 
        schedule_id: 5, 
        organization_id: 1,
        deadline_generate_date: new Date("2025-01-01"),
        date_from: new Date("2025-02-01"),
        date_to: new Date("2025-02-07")
      });

      const updated = { schedule_id: 5, status: "APPROVED" };
      scheduleModel.updateSchedule.mockResolvedValue(updated);
      
      userModel.getUsersByOrganization.mockResolvedValue([]);

      req.body = { status: "APPROVED" };

      await scheduleController.updateSchedule(req, res, next);

      expect(scheduleModel.updateSchedule).toHaveBeenCalledWith(5, req.body);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("should return 404 if schedule does not exist", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.scheduleId = 55;

      scheduleModel.getScheduleById.mockResolvedValue(null);

      await scheduleController.updateSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Schedule not found",
        statusCode: 404,
      });
    });

    it("should deny ORG_ADMIN updating schedule from another organization", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;

      req.params.scheduleId = 14;

      scheduleModel.getScheduleById.mockResolvedValue({ schedule_id: 14, organization_id: 99 });

      await scheduleController.updateSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    });

    it("should call next(err) when model.updateSchedule fails", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.scheduleId = 1;

      scheduleModel.getScheduleById.mockResolvedValue({ schedule_id: 1, organization_id: 1 });
      const error = new Error("DB error");
      scheduleModel.updateSchedule.mockRejectedValue(error);

      await scheduleController.updateSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteSchedule", () => {
    it("should delete schedule for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.scheduleId = 9;

      scheduleModel.getScheduleById.mockResolvedValue({ schedule_id: 9, organization_id: 1 });
      scheduleModel.deleteSchedule.mockResolvedValue(true);

      await scheduleController.deleteSchedule(req, res, next);

      expect(scheduleModel.deleteSchedule).toHaveBeenCalledWith(9);
      expect(res.json).toHaveBeenCalledWith({ message: "Schedule deleted" });
    });

    it("should return 404 if schedule not found", async () => {
      req.params.scheduleId = 9;
      req.user.role = "GLOBAL_ADMIN";

      scheduleModel.getScheduleById.mockResolvedValue(null);

      await scheduleController.deleteSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Schedule not found",
        statusCode: 404,
      });
    });

    it("should deny ORG_ADMIN deleting schedule from another org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 1;

      req.params.scheduleId = 99;
      scheduleModel.getScheduleById.mockResolvedValue({
        schedule_id: 99,
        organization_id: 888,
      });

      await scheduleController.deleteSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    });

    it("should call next(err) when model.deleteSchedule fails", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.scheduleId = 5;

      scheduleModel.getScheduleById.mockResolvedValue({ schedule_id: 5 });
      const error = new Error("DB error");

      scheduleModel.deleteSchedule.mockRejectedValue(error);

      await scheduleController.deleteSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("generateSchedule", () => {
    it("should generate schedule for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.body.scheduleId = 1;
  
      scheduleModel.getScheduleById.mockResolvedValue({
        schedule_id: 1,
        organization_id: 1,
      });
  
      const mockAssignments = [{ shift_id: 1, user_id: 2 }];
      const scheduleGenerator = require("../src/services/scheduleGenerator.service");
      jest.spyOn(scheduleGenerator, "generateSchedule").mockResolvedValue(mockAssignments);
  
      await scheduleController.generateSchedule(req, res, next);
  
      expect(scheduleGenerator.generateSchedule).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Schedule generated",
        assignments: mockAssignments,
      });
    });
  
    it("should return 404 if schedule not found", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.body.scheduleId = 99;
  
      scheduleModel.getScheduleById.mockResolvedValue(null);
  
      await scheduleController.generateSchedule(req, res, next);
  
      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Schedule not found",
        statusCode: 404,
      });
    });
  });  
});
