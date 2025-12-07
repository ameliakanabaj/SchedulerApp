const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const validateDateRange = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const now = new Date();

  if (isNaN(s) || isNaN(e)) return "Invalid dates";
  if (e <= s) return "end_time must be after start_time";

  if (s <= now || e <= now) return "start_time and end_time must be in the future";

  if (s.toISOString().split("T")[0] !== e.toISOString().split("T")[0]) {
    return "start_time and end_time must be on the same day";
  }

  return null;
};

const createAvailabilityValidation = [
  body("user_id").custom((value, { req }) => {
    if (req.user.role === "EMPLOYEE" && value !== undefined) {
      throw new Error("Employees cannot specify user_id");
    }
    return true;
  }),

  body("start_time")
    .exists().withMessage("start_time is required")
    .isISO8601().withMessage("start_time must be valid ISO date"),

  body("end_time")
    .exists().withMessage("end_time is required")
    .isISO8601().withMessage("end_time must be valid ISO date"),

  body().custom((value) => {
    const error = validateDateRange(value.start_time, value.end_time);
    if (error) throw new Error(error);
    return true;
  }),

  validate,
];

const createAvailabilitiesBulkValidation = [
  body()
    .isArray({ min: 1 })
    .withMessage("Body must be an array with at least 1 item"),

  body("*.user_id").custom((value, { req }) => {
    if (req.user.role === "EMPLOYEE" && value !== undefined) {
      throw new Error("Employees cannot specify user_id in bulk items");
    }
    return true;
  }),

  body("*.start_time")
    .exists().withMessage("start_time is required")
    .isISO8601().withMessage("start_time must be valid"),

  body("*.end_time")
    .exists().withMessage("end_time is required")
    .isISO8601().withMessage("end_time must be valid"),

  body().custom((rows) => {
    for (const r of rows) {
      const error = validateDateRange(r.start_time, r.end_time);
      if (error) throw new Error(error);
    }
    return true;
  }),

  validate,
];

const updateAvailabilityValidation = [
  body("start_time").optional().isISO8601().withMessage("start_time must be ISO date"),
  body("end_time").optional().isISO8601().withMessage("end_time must be ISO date"),

  body().custom((value, { req }) => {
    const start = value.start_time ?? req.existing.start_time;
    const end = value.end_time ?? req.existing.end_time;

    const error = validateDateRange(start, end);
    if (error) throw new Error(error);

    return true;
  }),

  validate,
];

module.exports = { createAvailabilityValidation, createAvailabilitiesBulkValidation, updateAvailabilityValidation, validateDateRange, };
