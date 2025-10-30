const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const createAvailabilityValidation = [
  body("user_id").isInt().withMessage("User ID is required"),
  body("date").isISO8601().withMessage("Valid date required"),
  body("start_time").notEmpty().withMessage("Start time required"),
  body("end_time").notEmpty().withMessage("End time required"),
  body("status").optional().isString(),
  validate,
];

const updateAvailabilityValidation = [
  body("date").optional().isISO8601(),
  body("start_time").optional().notEmpty(),
  body("end_time").optional().notEmpty(),
  body("status").optional().isString(),
  validate,
];

module.exports = { createAvailabilityValidation, updateAvailabilityValidation };
