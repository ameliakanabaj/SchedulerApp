jest.mock("../src/models/availability.model");

const loadAvailability = require("../src/middlewares/loadAvailability.middleware");
const availabilityModel = require("../src/models/availability.model");

describe("loadAvailability middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, existing: undefined };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should set req.existing and call next when availability exists", async () => {
    req.params.id = 1;
    const avail = { availability_id: 1, user_id: 2 };
    availabilityModel.getAvailabilityById.mockResolvedValue(avail);

    await loadAvailability(req, res, next);

    expect(req.existing).toEqual(avail);
    expect(next).toHaveBeenCalled();
  });

  it("should call next with 404 error when availability not found", async () => {
    req.params.id = 2;
    availabilityModel.getAvailabilityById.mockResolvedValue(null);

    await loadAvailability(req, res, next);

    expect(next).toHaveBeenCalledWith({
      type: "BUSINESS_LOGIC",
      message: "Availability not found",
      statusCode: 404,
    });
  });

  it("should call next with thrown error when model throws", async () => {
    req.params.id = 3;
    const error = new Error("DB error");
    availabilityModel.getAvailabilityById.mockRejectedValue(error);

    await loadAvailability(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
