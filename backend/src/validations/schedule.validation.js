const { body, param, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const createScheduleValidation = [
  body("organization_id")
    .notEmpty().withMessage("organization_id is required")
    .isInt({ gt: 0 }).withMessage("organization_id must be a positive integer"),

  body("date_from")
    .notEmpty().withMessage("date_from is required")
    .isISO8601().withMessage("date_from must be a valid date"),

  body("date_to")
    .notEmpty().withMessage("date_to is required")
    .isISO8601().withMessage("date_to must be a valid date"),

  body("deadline_generate_date")
    .notEmpty().withMessage("Deadline is required")
    .isISO8601().withMessage("Invalid date"),


  validate,
];

const updateScheduleValidation = [
  param("scheduleId")
    .isInt().withMessage("scheduleId must be an integer"),

  body("status")
    .optional()
    .isIn(["PENDING", "GENERATED", "FAILED", "APPROVED", "NOT_APPROVED"])
    .withMessage("Invalid schedule status"),

  validate,
];

const getOrganizationSchedulesValidation = [
  param("organizationId")
    .isInt().withMessage("organizationId must be an integer"),
  validate,
];

const getUserSchedulesValidation = [
  param("userId")
    .isInt().withMessage("userId must be an integer"),
  validate,
];

const deleteScheduleValidation = [
  param("scheduleId")
    .isInt().withMessage("scheduleId must be an integer"),
  validate,
];

module.exports = {
  createScheduleValidation,
  updateScheduleValidation,
  getOrganizationSchedulesValidation,
  getUserSchedulesValidation,
  deleteScheduleValidation
};
