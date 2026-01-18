const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const createShiftValidation = [
  body("organization_id").isInt().withMessage("organization_id must be an integer"),
  body("start_time").isISO8601().withMessage("start_time must be ISO8601 datetime"),
  body("end_time").isISO8601().withMessage("end_time must be ISO8601 datetime"),
  body("end_time").custom((value, { req }) => {
    if (new Date(value) <= new Date(req.body.start_time)) {
      throw new Error("end_time must be after start_time");
    }
    return true;
  }),
  body("place").optional().isString(),
  validate,
];

const createShiftsBulkValidation = [
  body().isArray({ min: 1 }).withMessage("Request body must be a non-empty array"),

  body("*.organization_id")
    .isInt().withMessage("organization_id must be an integer"),

  body("*.start_time")
    .isISO8601().withMessage("start_time must be ISO8601 datetime"),

  body("*.end_time")
    .isISO8601().withMessage("end_time must be ISO8601 datetime"),

  body("*.end_time").custom((value, { req, path }) => {
    const idx = Number(path.match(/\[(\d+)\]/)[1]);
    const start = req.body[idx].start_time;

    if (new Date(value) <= new Date(start)) {
      throw new Error("end_time must be after start_time");
    }

    return true;
  }),

  body("*.place")
    .optional()
    .isString(),

  validate,
];

const updateShiftValidation = [
  body("start_time").optional().isISO8601().withMessage("start_time must be ISO8601 datetime"),
  body("end_time").optional().isISO8601().withMessage("end_time must be ISO8601 datetime"),
  body("end_time").optional().custom((value, { req }) => {
    const start = req.body.start_time ? new Date(req.body.start_time) : null;
    if (start && new Date(value) <= start) {
      throw new Error("end_time must be after start_time");
    }
    return true;
  }),
  body("place").optional().isString(),
  validate,
];

module.exports = { createShiftValidation, createShiftsBulkValidation, updateShiftValidation };
