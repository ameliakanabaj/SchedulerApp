const {
  createAvailabilityValidation,
  createAvailabilitiesBulkValidation,
  updateAvailabilityValidation,
} = require("../src/validations/availability.validation");
const { validateDateRange } = require("../src/validations/availability.validation");

const runValidation = async (middlewares, req) => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  for (const m of middlewares) {
    await m(req, res, next);
    if (res.status.mock.calls.length) break;
  }

  return { req, res, next };
};

const now = new Date("2025-01-01T08:00:00Z");
jest.useFakeTimers().setSystemTime(now);


describe("validateDateRange()", () => {
  test("returns error for invalid dates", () => {
    expect(validateDateRange("xx", "yy")).toBe("Invalid dates");
  });

  test("returns error if end <= start", () => {
    expect(validateDateRange(
      "2025-01-02T10:00:00Z",
      "2025-01-02T09:00:00Z"
    )).toBe("end_time must be after start_time");
  });

  test("returns error if dates are in the past", () => {
    expect(validateDateRange(
      "2025-01-01T07:00:00Z",
      "2025-01-01T07:30:00Z"
    )).toBe("start_time and end_time must be in the future");
  });

  test("returns error if start and end on different days", () => {
    expect(validateDateRange(
      "2025-01-01T10:00:00Z",
      "2025-01-02T10:00:00Z"
    )).toBe("start_time and end_time must be on the same day");
  });

  test("returns null for valid range", () => {
    expect(validateDateRange(
      "2025-01-03T10:00:00Z",
      "2025-01-03T12:00:00Z"
    )).toBe(null);
  });
});


describe("createAvailabilityValidation", () => {
  const middleware = createAvailabilityValidation;

  test("EMPLOYEE cannot set user_id", async () => {
    const req = {
      body: {
        user_id: 5,
        start_time: "2025-01-03T10:00:00Z",
        end_time: "2025-01-03T12:00:00Z",
      },
      user: { role: "EMPLOYEE" },
    };

    const { res } = await runValidation(middleware, req);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("requires valid ISO dates", async () => {
    const req = {
      body: { start_time: "xxx", end_time: "2025-01-03T12:00:00Z" },
      user: { role: "ADMIN" },
    };

    const { res } = await runValidation(middleware, req);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects dates crossing days", async () => {
    const req = {
      body: {
        start_time: "2025-01-03T10:00:00Z",
        end_time: "2025-01-04T10:00:00Z",
      },
      user: { role: "ADMIN" },
    };

    const { res } = await runValidation(middleware, req);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("accepts valid input", async () => {
    const req = {
      body: {
        start_time: "2025-01-03T10:00:00Z",
        end_time: "2025-01-03T12:00:00Z",
      },
      user: { role: "ADMIN" },
    };

    const { res, next } = await runValidation(middleware, req);
    expect(next).toHaveBeenCalled();
  });
});


describe("createAvailabilitiesBulkValidation", () => {
  const middleware = createAvailabilitiesBulkValidation;

  test("requires array", async () => {
    const req = {
      body: {},
      user: { role: "ADMIN" },
    };

    const { res } = await runValidation(middleware, req);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects invalid items inside array", async () => {
    const req = {
      body: [
        {
          start_time: "invalid",
          end_time: "2025-01-03T12:00:00Z",
        },
      ],
      user: { role: "ADMIN" },
    };

    const { res } = await runValidation(middleware, req);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("EMPLOYEE cannot specify user_id", async () => {
    const req = {
      body: [
        {
          user_id: 2,
          start_time: "2025-01-03T10:00:00Z",
          end_time: "2025-01-03T12:00:00Z",
        },
      ],
      user: { role: "EMPLOYEE" },
    };

    const { res } = await runValidation(middleware, req);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("accepts valid rows", async () => {
    const req = {
      body: [
        {
          start_time: "2025-01-03T10:00:00Z",
          end_time: "2025-01-03T12:00:00Z",
        },
        {
          start_time: "2025-01-04T09:00:00Z",
          end_time: "2025-01-04T11:00:00Z",
        },
      ],
      user: { role: "ADMIN" },
    };

    const { next } = await runValidation(middleware, req);
    expect(next).toHaveBeenCalled();
  });
});


describe("updateAvailabilityValidation", () => {
  const middleware = updateAvailabilityValidation;

  test("rejects if new start/end invalid ISO", async () => {
    const req = {
      body: { start_time: "xxxx" },
      existing: {
        start_time: "2025-01-03T10:00:00Z",
        end_time: "2025-01-03T12:00:00Z",
      },
    };

    const { res } = await runValidation(middleware, req);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects if updated dates cross days", async () => {
    const req = {
      body: {
        end_time: "2025-01-04T10:00:00Z",
      },
      existing: {
        start_time: "2025-01-03T10:00:00Z",
        end_time: "2025-01-03T12:00:00Z",
      },
    };

    const { res } = await runValidation(middleware, req);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("allows partial update as long as range is valid", async () => {
    const req = {
      body: {
        end_time: "2025-01-03T13:00:00Z",
      },
      existing: {
        start_time: "2025-01-03T10:00:00Z",
        end_time: "2025-01-03T12:00:00Z",
      },
    };

    const { next } = await runValidation(middleware, req);

    expect(next).toHaveBeenCalled();
  });
});
