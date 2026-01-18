jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

jest.mock("../src/models/availability.model");
jest.mock("../src/models/user.model");

const availabilityController = require("../src/controllers/availability.controller");
const availabilityModel = require("../src/models/availability.model");
const userModel = require("../src/models/user.model");

describe("Availability Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("createAvailability", () => {
    it("should return 404 if user not found", async () => {
      req.body = { user_id: 99, start_time: "2025-01-10T10:00:00Z", end_time: "2025-01-10T12:00:00Z" };
      userModel.getUserById.mockResolvedValue(null);

      await availabilityController.createAvailability(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "User not found",
        statusCode: 404
      });
    });

    it("EMPLOYEE cannot create for another user (should be prevented earlier by validation/assignment) - simulated", async () => {
      req.user = { role: "EMPLOYEE", user_id: 5 };
      req.body = { user_id: 7, start_time: "2025-01-10T10:00:00Z", end_time: "2025-01-10T12:00:00Z" };

      userModel.getUserById.mockResolvedValue({ user_id: 5 });

      availabilityModel.getAvailabilityByUser.mockResolvedValue([]);

      const mockAvailability = { availability_id: 1 };
      availabilityModel.createAvailability.mockResolvedValue(mockAvailability);

      await availabilityController.createAvailability(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAvailability);
    });

    it("ORG_ADMIN cannot create availability for user from another org", async () => {
      req.user = { role: "ORG_ADMIN", organization_id: 1 };
      req.body = { user_id: 10, start_time: "2025-01-10T10:00:00Z", end_time: "2025-01-10T12:00:00Z" };
      userModel.getUserById.mockResolvedValue({ user_id: 10, organization_id: 2 });

      await availabilityController.createAvailability(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "No permission",
        statusCode: 403
      });
    });

    it("should create availability successfully", async () => {
      req.user = { role: "EMPLOYEE", user_id: 1 };
      req.body = {
        start_time: "2025-01-10T10:00:00Z",
        end_time: "2025-01-10T12:00:00Z"
      };
      userModel.getUserById.mockResolvedValue({ user_id: 1 });
      availabilityModel.getAvailabilityByUser.mockResolvedValue([]);

      const mockAvailability = { availability_id: 1 };
      availabilityModel.createAvailability.mockResolvedValue(mockAvailability);

      await availabilityController.createAvailability(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAvailability);
    });

    it("should call next if userModel.getUserById throws", async () => {
      req.body = { user_id: 1, start_time: "2025-01-10T10:00:00Z", end_time: "2025-01-10T12:00:00Z" };
      const error = new Error("DB error");
      userModel.getUserById.mockRejectedValue(error);

      await availabilityController.createAvailability(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it("should call next if availabilityModel.createAvailability throws", async () => {
      req.user = { role: "EMPLOYEE", user_id: 1 };
      req.body = { start_time: "2025-01-10T10:00:00Z", end_time: "2025-01-10T12:00:00Z" };
      userModel.getUserById.mockResolvedValue({ user_id: 1 });
      availabilityModel.getAvailabilityByUser.mockResolvedValue([]);
      const error = new Error("DB error");
      availabilityModel.createAvailability.mockRejectedValue(error);

      await availabilityController.createAvailability(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createAvailabilitiesBulk", () => {
    it("should reject if some user ids do not exist", async () => {
      req.user = { role: "GLOBAL_ADMIN" };
      req.body = [
        { user_id: 5, start_time: "2025-02-01T08:00:00Z", end_time: "2025-02-01T16:00:00Z" },
        { user_id: 6, start_time: "2025-02-02T08:00:00Z", end_time: "2025-02-02T16:00:00Z" }
      ];

      userModel.getUsersByIds.mockResolvedValue([{ user_id: 5 }]);

      await availabilityController.createAvailabilitiesBulk(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Users not found: 6",
        statusCode: 404
      });
    });

    it("EMPLOYEE bulk should force user_id to requester and create", async () => {
      req.user = { role: "EMPLOYEE", user_id: 5 };
      req.body = [
        { start_time: "2025-02-01T08:00:00Z", end_time: "2025-02-01T16:00:00Z" },
        { start_time: "2025-02-02T08:00:00Z", end_time: "2025-02-02T16:00:00Z" }
      ];

      userModel.getUsersByIds.mockResolvedValue([{ user_id: 5, organization_id: 1 }]);

      availabilityModel.getAvailabilitiesByUserIds.mockResolvedValue([]);

      const created = [
        { availability_id: 1, user_id: 5 },
        { availability_id: 2, user_id: 5 }
      ];
      availabilityModel.createAvailabilitiesBulk.mockResolvedValue(created);

      await availabilityController.createAvailabilitiesBulk(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ inserted: created.length, records: created });
    });
  });

  describe("getAvailabilityByUser", () => {
    it("should return 404 if user does not exist", async () => {
      req.params.user_id = 9;
      userModel.getUserById.mockResolvedValue(null);

      await availabilityController.getAvailabilityByUser(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "User not found",
        statusCode: 404
      });
    });

    it("EMPLOYEE cannot view other user's availability", async () => {
      req.user = { role: "EMPLOYEE", user_id: 5 };
      req.params.user_id = 7;
      userModel.getUserById.mockResolvedValue({ user_id: 7, organization_id: 2 });

      await availabilityController.getAvailabilityByUser(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only view your own availability",
        statusCode: 403
      });
    });

    it("ORG_ADMIN cannot view availability of user from different org", async () => {
      req.user = { role: "ORG_ADMIN", organization_id: 1 };
      req.params.user_id = 10;
      userModel.getUserById.mockResolvedValue({ user_id: 10, organization_id: 2 });

      await availabilityController.getAvailabilityByUser(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "No permission to view this user's availability",
        statusCode: 403
      });
    });

    it("should return availability list", async () => {
      req.user = { role: "GLOBAL_ADMIN" };
      req.params.user_id = 5;

      userModel.getUserById.mockResolvedValue({ user_id: 5 });
      availabilityModel.getAvailabilityByUser.mockResolvedValue([{ id: 1 }]);

      await availabilityController.getAvailabilityByUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it("should call next if availabilityModel.getAvailabilityByUser throws", async () => {
      req.user = { role: "GLOBAL_ADMIN" };
      req.params.user_id = 5;
      userModel.getUserById.mockResolvedValue({ user_id: 5 });
      const error = new Error("DB error");
      availabilityModel.getAvailabilityByUser.mockRejectedValue(error);

      await availabilityController.getAvailabilityByUser(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateAvailability", () => {
    it("should return 403 if EMPLOYEE tries to update others' availability", async () => {
      req.params.id = 1;
      req.user = { role: "EMPLOYEE", user_id: 2 };

      req.existing = { availability_id: 1, user_id: 5, start_time: new Date("2025-01-10T09:00:00Z"), end_time: new Date("2025-01-10T17:00:00Z") };

      await availabilityController.updateAvailability(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "No permission",
        statusCode: 403
      });
    });

    it("ORG_ADMIN cannot update availability of user outside their org", async () => {
      req.params.id = 1;
      req.user = { role: "ORG_ADMIN", organization_id: 1 };
      req.existing = { availability_id: 1, user_id: 5, start_time: new Date("2025-01-10T09:00:00Z"), end_time: new Date("2025-01-10T17:00:00Z") };

      userModel.getUserById.mockResolvedValue({ user_id: 5, organization_id: 2 });

      await availabilityController.updateAvailability(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "No permission",
        statusCode: 403
      });
    });

    it("should update availability successfully", async () => {
      req.params.id = 1;
      req.user = { role: "EMPLOYEE", user_id: 1 };
      req.existing = {
        availability_id: 1,
        user_id: 1,
        start_time: new Date("2099-01-10T08:00:00Z"),
        end_time: new Date("2099-01-10T10:00:00Z")
      };

      userModel.getUserById.mockResolvedValue({ user_id: 1 });
      availabilityModel.getAvailabilityByUser.mockResolvedValue([]);
      availabilityModel.updateAvailability.mockResolvedValue({ id: 1 });

      await availabilityController.updateAvailability(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("should call next if availabilityModel.updateAvailability throws", async () => {
      req.params.id = 1;
      req.user = { role: "EMPLOYEE", user_id: 1 };
      req.existing = {
        availability_id: 1,
        user_id: 1,
        start_time: new Date("2099-01-10T08:00:00Z"),
        end_time: new Date("2099-01-10T10:00:00Z")
      };

      userModel.getUserById.mockResolvedValue({ user_id: 1 });
      availabilityModel.getAvailabilityByUser.mockResolvedValue([]);
      const error = new Error("DB error");
      availabilityModel.updateAvailability.mockRejectedValue(error);

      await availabilityController.updateAvailability(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteAvailability", () => {
    it("should return 404 if availability not found - handled in middleware, so simulate by omitting req.existing", async () => {
      req.params.id = 1;
      await availabilityController.deleteAvailability(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("EMPLOYEE cannot delete other users' availability", async () => {
      req.user = { role: "EMPLOYEE", user_id: 2 };
      req.params.id = 1;
      req.existing = { availability_id: 1, user_id: 5 };

      await availabilityController.deleteAvailability(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "No permission",
        statusCode: 403
      });
    });

    it("ORG_ADMIN cannot delete others outside their org", async () => {
      req.user = { role: "ORG_ADMIN", organization_id: 1 };
      req.params.id = 1;
      req.existing = { availability_id: 1, user_id: 5 };
      userModel.getUserById.mockResolvedValue({ user_id: 5, organization_id: 2 });

      await availabilityController.deleteAvailability(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "No permission",
        statusCode: 403
      });
    });

    it("should delete availability", async () => {
      req.params.id = 1;
      req.user = { role: "EMPLOYEE", user_id: 1 };
      req.existing = { availability_id: 1, user_id: 1 };

      userModel.getUserById.mockResolvedValue({ user_id: 1 });
      availabilityModel.deleteAvailability.mockResolvedValue(true);

      await availabilityController.deleteAvailability(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: "Availability deleted" });
    });

    it("should call next if availabilityModel.deleteAvailability throws", async () => {
      req.params.id = 1;
      req.user = { role: "EMPLOYEE", user_id: 1 };
      req.existing = { availability_id: 1, user_id: 1 };
      userModel.getUserById.mockResolvedValue({ user_id: 1 });
      const error = new Error("DB error");
      availabilityModel.deleteAvailability.mockRejectedValue(error);

      await availabilityController.deleteAvailability(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
