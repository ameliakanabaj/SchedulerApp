jest.mock("../src/generated/prisma", () => {
  const mock_prisma = {
    shift: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    assignment: {
      findFirst: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mock_prisma),
  };
});

jest.mock("../src/models/shift.model");

const shiftController = require("../src/controllers/shift.controller");
const shiftModel = require("../src/models/shift.model");
const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

describe("Shift Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("createShift", () => {
    it("should create a shift for allowed user", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.body = { organization_id: 1, start_time: "2025-01-01T08:00:00Z", end_time: "2025-01-01T16:00:00Z", place: "Office", required_people: 3 };
      shiftModel.createShift.mockResolvedValue({ shift_id: 1, ...req.body });

      await shiftController.createShift(req, res, next);

      expect(shiftModel.createShift).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ shift_id: 1, ...req.body });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with 403 if ORG_ADMIN tries to create shift in another org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.body.organization_id = 1;

      await shiftController.createShift(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only create shifts in your organization",
        statusCode: 403,
      });
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next(err) if createShift throws", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.body = { organization_id: 1, start_time: "2025-01-01T08:00:00Z", end_time: "2025-01-01T16:00:00Z", place: "Office", required_people: 3 };
      const error = new Error("DB error");
      shiftModel.createShift.mockRejectedValue(error);

      await shiftController.createShift(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllShifts", () => {
    it("should return all shifts for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      const mockShifts = [{ shift_id: 1 }];
      shiftModel.getAllShifts.mockResolvedValue(mockShifts);

      await shiftController.getAllShifts(req, res, next);

      expect(shiftModel.getAllShifts).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockShifts);
    });

    it("should return org shifts for ORG_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      const mockShifts = [{ shift_id: 2 }];
      shiftModel.getAllShiftsByOrganizations.mockResolvedValue(mockShifts);

      await shiftController.getAllShifts(req, res, next);

      expect(shiftModel.getAllShiftsByOrganizations).toHaveBeenCalledWith([2]);
      expect(res.json).toHaveBeenCalledWith(mockShifts);
    });

    it("should return user shifts for EMPLOYEE", async () => {
      req.user.role = "EMPLOYEE";
      req.user.user_id = 5;
      const mockShifts = [{ shift_id: 3 }];
      shiftModel.getShiftsByUser.mockResolvedValue(mockShifts);

      await shiftController.getAllShifts(req, res, next);

      expect(shiftModel.getShiftsByUser).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(mockShifts);
    });

    it("should call next with 403 for unknown role", async () => {
      req.user.role = "UNKNOWN";

      await shiftController.getAllShifts(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Forbidden",
        statusCode: 403,
      });
    });

    it("should call next(err) if getAllShifts throws", async () => {
      req.user.role = "GLOBAL_ADMIN";
      const error = new Error("DB error");
      shiftModel.getAllShifts.mockRejectedValue(error);

      await shiftController.getAllShifts(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getShiftById", () => {
    it("should return shift for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      const mockShift = { shift_id: 1, organization_id: 2 };
      shiftModel.getShiftById.mockResolvedValue(mockShift);

      await shiftController.getShiftById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockShift);
    });

    it("should call next 404 if shift not found", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      shiftModel.getShiftById.mockResolvedValue(null);

      await shiftController.getShiftById(req, res, next);

      expect(next).toHaveBeenCalledWith({ type: "BUSINESS_LOGIC", message: "Shift not found", statusCode: 404 });
    });

    it("should call next 403 if ORG_ADMIN accessing other org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      shiftModel.getShiftById.mockResolvedValue({ shift_id: 1, organization_id: 1 });

      await shiftController.getShiftById(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Access denied to this shift",
        statusCode: 403,
      });
    });

    it("should call next 403 if EMPLOYEE not assigned", async () => {
      req.user.role = "EMPLOYEE";
      req.user.user_id = 5;
      req.params.id = 1;
      const mockShift = { shift_id: 1, organization_id: 2 };
      shiftModel.getShiftById.mockResolvedValue(mockShift);

      prisma.assignment.findFirst.mockResolvedValue(null);

      await shiftController.getShiftById(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only view your own shifts",
        statusCode: 403,
      });
    });

    it("should return shift if EMPLOYEE assigned", async () => {
      req.user.role = "EMPLOYEE";
      req.user.user_id = 5;
      req.params.id = 1;
      const mockShift = { shift_id: 1, organization_id: 2 };
      shiftModel.getShiftById.mockResolvedValue(mockShift);

      prisma.assignment.findFirst.mockResolvedValue({ shift_id: 1, user_id: 5 });

      await shiftController.getShiftById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockShift);
    });

    it("should call next(err) if getShiftById throws", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      const error = new Error("DB error");
      shiftModel.getShiftById.mockRejectedValue(error);

      await shiftController.getShiftById(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it("should call next(err) if prisma.assignment.findFirst throws", async () => {
      req.user.role = "EMPLOYEE";
      req.user.user_id = 5;
      req.params.id = 1;
      const mockShift = { shift_id: 1, organization_id: 2 };
      shiftModel.getShiftById.mockResolvedValue(mockShift);
      const error = new Error("DB error");
      prisma.assignment.findFirst.mockRejectedValue(error);

      await shiftController.getShiftById(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateShift", () => {
    it("should update shift for allowed ORG_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      const mockExisting = { shift_id: 1, organization_id: 2 };
      const mockUpdated = { shift_id: 1, place: "New Place" };

      shiftModel.getShiftById.mockResolvedValue(mockExisting);
      shiftModel.updateShift.mockResolvedValue(mockUpdated);

      req.body = { place: "New Place" };

      await shiftController.updateShift(req, res, next);

      expect(shiftModel.updateShift).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it("should call next 404 if shift not found", async () => {
      req.params.id = 1;
      shiftModel.getShiftById.mockResolvedValue(null);

      await shiftController.updateShift(req, res, next);

      expect(next).toHaveBeenCalledWith({ type: "BUSINESS_LOGIC", message: "Shift not found", statusCode: 404 });
    });

    it("should call next 403 if ORG_ADMIN tries to update other org's shift", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      shiftModel.getShiftById.mockResolvedValue({ shift_id: 1, organization_id: 1 });

      await shiftController.updateShift(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only modify shifts in your organization",
        statusCode: 403,
      });
    });

    it("should call next(err) if updateShift throws", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      shiftModel.getShiftById.mockResolvedValue({ shift_id: 1, organization_id: 2 });
      const error = new Error("DB error");
      shiftModel.updateShift.mockRejectedValue(error);

      await shiftController.updateShift(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteShift", () => {
    it("should delete shift for allowed ORG_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;

      const mockExisting = { shift_id: 1, organization_id: 2 };
      shiftModel.getShiftById.mockResolvedValue(mockExisting);
      shiftModel.deleteShift.mockResolvedValue(true);

      await shiftController.deleteShift(req, res, next);

      expect(shiftModel.deleteShift).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ message: "Shift deleted" });
    });

    it("should call next 404 if shift not found", async () => {
      req.params.id = 1;
      shiftModel.getShiftById.mockResolvedValue(null);

      await shiftController.deleteShift(req, res, next);

      expect(next).toHaveBeenCalledWith({ type: "BUSINESS_LOGIC", message: "Shift not found", statusCode: 404 });
    });

    it("should call next 403 if ORG_ADMIN tries to delete other org's shift", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      shiftModel.getShiftById.mockResolvedValue({ shift_id: 1, organization_id: 1 });

      await shiftController.deleteShift(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only delete shifts in your organization",
        statusCode: 403,
      });
    });

    it("should call next(err) if deleteShift throws", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      shiftModel.getShiftById.mockResolvedValue({ shift_id: 1, organization_id: 2 });
      const error = new Error("DB error");
      shiftModel.deleteShift.mockRejectedValue(error);

      await shiftController.deleteShift(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createShiftsBulk", () => {
    it("ORG_ADMIN cannot create shifts for another org", async () => {
      req.user = { role: "ORG_ADMIN", organization_id: 2 };
      req.body = [
        { organization_id: 2, start_time: "2026-01-01T10:00:00Z", end_time: "2026-01-01T12:00:00Z" },
        { organization_id: 3, start_time: "2026-01-01T12:00:00Z", end_time: "2026-01-01T14:00:00Z" }
      ];

      await shiftController.createShiftsBulk(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only create shifts for your organization (2)",
        statusCode: 403,
      });
    });

    it("should return 400 if start_time is in the past", async () => {
      req.user = { role: "GLOBAL_ADMIN" };
      req.body = [
        { organization_id: 1, start_time: "2000-01-01T10:00:00Z", end_time: "2000-01-01T12:00:00Z" }
      ];

      await shiftController.createShiftsBulk(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "BUSINESS_LOGIC",
          message: expect.stringContaining("Shift start_time cannot be in the past")
        })
      );
    });

    it("should create shifts and return 201", async () => {
      req.user = { role: "GLOBAL_ADMIN" };
      req.body = [
        {
          organization_id: 1,
          start_time: "2030-01-01T10:00:00Z",
          end_time: "2030-01-01T12:00:00Z"
        },
        {
          organization_id: 1,
          start_time: "2030-01-02T10:00:00Z",
          end_time: "2030-01-02T12:00:00Z"
        }
      ];

      shiftModel.createShiftsBulk.mockResolvedValue([
        { shift_id: 1 },
        { shift_id: 2 }
      ]);

      await shiftController.createShiftsBulk(req, res, next);

      expect(shiftModel.createShiftsBulk).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        inserted: 2,
        records: [
          { shift_id: 1 },
          { shift_id: 2 }
        ]
      });
    });

    it("should call next(err) when model throws", async () => {
      req.user = { role: "GLOBAL_ADMIN" };
      req.body = [
        {
          organization_id: 1,
          start_time: "2030-01-01T10:00:00Z",
          end_time: "2030-01-01T12:00:00Z"
        }
      ];

      const err = new Error("DB error");
      shiftModel.createShiftsBulk.mockRejectedValue(err);

      await shiftController.createShiftsBulk(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
