jest.mock("../src/models/assignment.model");
jest.mock("../src/models/shift.model");
jest.mock("../src/models/user.model");
jest.mock("../src/generated/prisma");

const assignmentController = require("../src/controllers/assignment.controller");

const assignmentModel = require("../src/models/assignment.model");
const shiftModel = require("../src/models/shift.model");
const userModel = require("../src/models/user.model");

let req, res, next;

beforeEach(() => {
  req = {
    body: {},
    params: {},
    headers: {},
    user: {},
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  next = jest.fn();
  jest.clearAllMocks();
});

describe("Assignment Controller", () => {

  it("should create assignment if ORG_ADMIN in same organization", async () => {
    req.user = { role: "ORG_ADMIN", organization_id: 2 };
    req.body = { shift_id: 1, user_id: 5, role_on_shift: "WORKER" };

    shiftModel.getShiftById.mockResolvedValue({ shift_id: 1, organization_id: 2 });
    userModel.getUserById.mockResolvedValue({ user_id: 5, organization_id: 2 });
    assignmentModel.createAssignment.mockResolvedValue({ assignment_id: 10 });

    await assignmentController.createAssignment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ assignment_id: 10 });
  });

  it("should return 403 if ORG_ADMIN tries to assign to different organization", async () => {
    req.user = { role: "ORG_ADMIN", organization_id: 2 };
    req.body = { shift_id: 1, user_id: 5 };

    shiftModel.getShiftById.mockResolvedValue({ shift_id: 1, organization_id: 99 });
    userModel.getUserById.mockResolvedValue({ user_id: 5, organization_id: 99 });

    await assignmentController.createAssignment(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403,
    }));
  });

  it("should return assignment if employee owns it", async () => {
    req.user = { role: "EMPLOYEE", user_id: 5 };

    req.params.id = 10;

    assignmentModel.getAssignmentById.mockResolvedValue({
      assignment_id: 10,
      user_id: 5,
      shift: { organization_id: 2 }
    });

    await assignmentController.getAssignmentById(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      assignment_id: 10,
    }));
  });

  it("should block employee viewing assignment of another user", async () => {
    req.user = { role: "EMPLOYEE", user_id: 5 };

    req.params.id = 10;

    assignmentModel.getAssignmentById.mockResolvedValue({
      assignment_id: 10,
      user_id: 99,
      shift: { organization_id: 2 }
    });

    await assignmentController.getAssignmentById(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403
    }));
  });

  it("should allow ORG_ADMIN to read assignments for shift in their organization", async () => {
    req.user = { role: "ORG_ADMIN", organization_id: 2 };
    req.params.shift_id = 1;

    shiftModel.getShiftById.mockResolvedValue({ shift_id: 1, organization_id: 2 });
    assignmentModel.getAssignmentsByShift.mockResolvedValue([{ assignment_id: 10 }]);

    await assignmentController.getAssignmentsByShift(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ assignment_id: 10 }]);
  });

  it("should block ORG_ADMIN reading assignments of another organization", async () => {
    req.user = { role: "ORG_ADMIN", organization_id: 2 };
    req.params.shift_id = 1;

    shiftModel.getShiftById.mockResolvedValue({ shift_id: 1, organization_id: 99 });

    await assignmentController.getAssignmentsByShift(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403,
    }));
  });

  it("should allow employee to see only their assignments", async () => {
    req.user = { role: "EMPLOYEE", user_id: 5 };
    req.params.user_id = 5;

    userModel.getUserById.mockResolvedValue({ user_id: 5, organization_id: 2 });
    assignmentModel.getAssignmentsByUser.mockResolvedValue([{ assignment_id: 10 }]);

    await assignmentController.getAssignmentsByUser(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ assignment_id: 10 }]);
  });

  it("should block employee from viewing other user's assignments", async () => {
    req.user = { role: "EMPLOYEE", user_id: 5 };
    req.params.user_id = 99;

    userModel.getUserById.mockResolvedValue({ user_id: 99, organization_id: 2 });

    await assignmentController.getAssignmentsByUser(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403
    }));
  });

  it("should delete assignment when valid", async () => {
    req.user = { role: "ORG_ADMIN", organization_id: 2 };
    req.params.id = 10;

    assignmentModel.getAssignmentById.mockResolvedValue({
      assignment_id: 10,
      shift_id: 1
    });

    shiftModel.getShiftById.mockResolvedValue({
      shift_id: 1,
      organization_id: 2
    });

    assignmentModel.deleteAssignment.mockResolvedValue(true);

    await assignmentController.deleteAssignment(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ message: "Assignment deleted" });
  });

  it("should update assignment when permitted", async () => {
    req.user = { role: "ORG_ADMIN", organization_id: 2 };
    req.params.id = 10;
    req.body = { role_on_shift: "LEADER" };

    assignmentModel.getAssignmentById.mockResolvedValue({
      assignment_id: 10,
      shift: { organization_id: 2 }
    });

    assignmentModel.updateAssignment.mockResolvedValue({
      assignment_id: 10,
      role_on_shift: "LEADER"
    });

    await assignmentController.updateAssignment(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      role_on_shift: "LEADER"
    }));
  });

});
