const { createShiftValidation, createShiftsBulkValidation, updateShiftValidation } = require("../src/validations/shift.validation");
const { validationResult } = require("express-validator");

async function runValidation(validators, body) {
  const req = { body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn((data) => data),
  };
  const next = jest.fn();

  for (const v of validators) {
    await v(req, res, next);
  }

  const errors = validationResult(req);
  return {
    valid: errors.isEmpty(),
    errors: errors.array(),
  };
}

describe("Shift Validators", () => {
  describe("createShiftValidation", () => {
    it("passes with valid input", async () => {
      const result = await runValidation(createShiftValidation, {
        organization_id: 1,
        start_time: "2025-01-01T08:00:00Z",
        end_time: "2025-01-01T16:00:00Z",
        place: "Office",
      });
      expect(result.valid).toBe(true);
    });

    it("fails if end_time <= start_time", async () => {
      const result = await runValidation(createShiftValidation, {
        organization_id: 1,
        start_time: "2025-01-01T08:00:00Z",
        end_time: "2025-01-01T07:00:00Z",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].msg).toMatch(/end_time must be after start_time/);
    });

    it("fails if organization_id is not integer", async () => {
      const result = await runValidation(createShiftValidation, {
        organization_id: "abc",
        start_time: "2025-01-01T08:00:00Z",
        end_time: "2025-01-01T16:00:00Z",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].msg).toMatch(/organization_id must be an integer/);
    });
  });

  describe("createShiftsBulkValidation", () => {
    it("fails if any item has end_time <= start_time", async () => {
      const result = await runValidation(createShiftsBulkValidation, [
        { organization_id: 1, start_time: "2025-01-01T08:00:00Z", end_time: "2025-01-01T07:00:00Z" }
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors[0].msg).toMatch(/end_time must be after start_time/);
    });

    it("fails if any item has non-integer organization_id", async () => {
      const result = await runValidation(createShiftsBulkValidation, [
        { organization_id: "abc", start_time: "2025-01-01T08:00:00Z", end_time: "2025-01-01T16:00:00Z" }
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors[0].msg).toMatch(/organization_id must be an integer/);
    });
  });

  describe("updateShiftValidation", () => {
    it("fails if end_time <= start_time", async () => {
      const result = await runValidation(updateShiftValidation, {
        start_time: "2025-01-01T08:00:00Z",
        end_time: "2025-01-01T07:00:00Z",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].msg).toMatch(/end_time must be after start_time/);
    });
  });
});
