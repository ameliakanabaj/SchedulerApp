const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const createAvailabilityValidation = [
  body("user_id").isInt().withMessage("User ID is required"),
  body("start_time").isISO8601().withMessage("start_time must be ISO8601 datetime"),
  body("end_time").isISO8601().withMessage("end_time must be ISO8601 datetime"),
  body("end_time").custom((value, { req }) => {
    const start = new Date(req.body.start_time);
    const end = new Date(value);
    if (isNaN(start) || isNaN(end)) throw new Error("Invalid dates");
    if (end <= start) throw new Error("end_time must be after start_time");
    if (start <= new Date()) throw new Error("start_time must be in the future");
    return true;
  }),
  body("status").optional().isString(),
  validate,
];

const updateAvailabilityValidation = [
  body("start_time").optional().isISO8601().withMessage("start_time must be ISO8601 datetime"),
  body("end_time").optional().isISO8601().withMessage("end_time must be ISO8601 datetime"),
  body().custom((value, { req }) => {
    if (req.body.start_time || req.body.end_time) {
      const start = req.body.start_time ? new Date(req.body.start_time) : undefined;
      const end = req.body.end_time ? new Date(req.body.end_time) : undefined;
      if (start && end && end <= start) throw new Error("end_time must be after start_time");
      if (start && start <= new Date()) throw new Error("start_time must be in the future");
    }
    return true;
  }),
  body("status").optional().isString(),
  validate,
];

module.exports = { createAvailabilityValidation, updateAvailabilityValidation };
