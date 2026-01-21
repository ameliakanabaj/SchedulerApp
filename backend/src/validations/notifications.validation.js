const { param, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const markAsReadValidation = [
  param("id")
    .isInt()
    .withMessage("Notification ID must be an integer"),
  validate,
];

module.exports = {
  markAsReadValidation,
};
