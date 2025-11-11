const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const createAssignmentValidation = [
  body("shift_id").isInt().withMessage("shift_id must be an integer"),
  body("user_id").isInt().withMessage("user_id must be an integer"),
  body("role_on_shift").optional().isString().withMessage("role_on_shift must be a string"),
  validate,
];

const updateAssignmentValidation = [
  body("role_on_shift").optional().isString().withMessage("role_on_shift must be a string"),
  validate,
];

module.exports = { createAssignmentValidation, updateAssignmentValidation };
