const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const createShiftValidation = [
  body("organization_id").isInt().withMessage("organization_id must be an integer"),
  body("date").isISO8601().withMessage("Invalid date format (YYYY-MM-DD)"),
  body("start_time").matches(/^\d{2}:\d{2}$/).withMessage("Invalid start time format (HH:mm)"),
  body("end_time").matches(/^\d{2}:\d{2}$/).withMessage("Invalid end time format (HH:mm)"),
  validate,
];

const updateShiftValidation = [
  body("date").optional().isISO8601().withMessage("Invalid date format"),
  body("start_time").optional().matches(/^\d{2}:\d{2}$/).withMessage("Invalid start time format"),
  body("end_time").optional().matches(/^\d{2}:\d{2}$/).withMessage("Invalid end time format"),
  body("place").optional().isString(),
  validate,
];

module.exports = { createShiftValidation, updateShiftValidation };
