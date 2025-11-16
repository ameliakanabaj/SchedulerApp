const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const createOrganizationValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Organization name is required")
    .isLength({ min: 2 }).withMessage("Organization name must be at least 2 characters"),
  validate,
];

const updateOrganizationValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage("Organization name must be at least 2 characters"),
  validate,
];

module.exports = { createOrganizationValidation, updateOrganizationValidation };
