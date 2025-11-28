const scheduleController = require("../src/controllers/schedule.controller");
const scheduleModel = require("../src/models/schedule.model");

jest.mock("../src/models/schedule.model");

describe("Schedule Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("createSchedule", () => {
    it("should create a schedule", async () => {
      req.body = {
        organization_id: 1,
        date_from: "2025-01-01T00:00:00Z",
        date_to: "2025-01-07T23:59:00Z",
        deadline_generate_date: "2024-12-20T23:59:00Z"
      };

      const schedule = { schedule_id: 10, ...req.body };
      scheduleModel.createSchedule.mockResolvedValue(schedule);

      await scheduleController.createSchedule(req, res, next);

      expect(scheduleModel.createSchedule).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(schedule);
    });

    it("should call next on error", async () => {
      const error = new Error("DB error");
      scheduleModel.createSchedule.mockRejectedValue(error);

      await scheduleController.createSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSchedulesByOrganization", () => {
    it("should return schedules list", async () => {
      req.params.organizationId = 1;
      const schedules = [{ schedule_id: 1 }];

      scheduleModel.getSchedulesForOrganization.mockResolvedValue(schedules);

      await scheduleController.getSchedulesByOrganization(req, res, next);

      expect(scheduleModel.getSchedulesForOrganization).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(schedules);
    });

    it("should call next on error", async () => {
      req.params.organizationId = 1;

      const error = new Error("DB error");
      scheduleModel.getSchedulesForOrganization.mockRejectedValue(error);

      await scheduleController.getSchedulesByOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSchedulesForUser", () => {
    it("should return schedules for user", async () => {
      req.params.userId = 7;
      const schedules = [{ schedule_id: 1 }];

      scheduleModel.getSchedulesForUser.mockResolvedValue(schedules);

      await scheduleController.getSchedulesForUser(req, res, next);

      expect(scheduleModel.getSchedulesForUser).toHaveBeenCalledWith(7);
      expect(res.json).toHaveBeenCalledWith(schedules);
    });

    it("should call next on error", async () => {
      req.params.userId = 7;

      const error = new Error("DB error");
      scheduleModel.getSchedulesForUser.mockRejectedValue(error);

      await scheduleController.getSchedulesForUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateSchedule", () => {
    it("should update schedule", async () => {
      req.params.scheduleId = 5;
      req.body = { status: "APPROVED" };

      const updated = { schedule_id: 5, status: "APPROVED" };
      scheduleModel.updateSchedule.mockResolvedValue(updated);

      await scheduleController.updateSchedule(req, res, next);

      expect(scheduleModel.updateSchedule).toHaveBeenCalledWith(5, req.body);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("should call next on error", async () => {
      req.params.scheduleId = 5;

      const error = new Error("DB error");
      scheduleModel.updateSchedule.mockRejectedValue(error);

      await scheduleController.updateSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteSchedule", () => {
    it("should delete schedule", async () => {
      req.params.scheduleId = 9;

      scheduleModel.deleteSchedule.mockResolvedValue(true);

      await scheduleController.deleteSchedule(req, res, next);

      expect(scheduleModel.deleteSchedule).toHaveBeenCalledWith(9);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("should call next on error", async () => {
      req.params.scheduleId = 9;
      const error = new Error("DB error");

      scheduleModel.deleteSchedule.mockRejectedValue(error);

      await scheduleController.deleteSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
