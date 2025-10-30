const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const err = new Error("Validation failed");
  err.errors = errors.array().map((e) => ({
    path: e.param,
    msg: e.msg,
  }));
  return next(err);
};

const registerValidation = [
  body("first_name")
    .exists().withMessage("First name is required")
    .isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),
  body("last_name")
    .exists().withMessage("Last name is required")
    .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),
  body("email")
    .exists().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email format"),
  body("password")
    .exists().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/\d/).withMessage("Password must contain a number")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter"),
  body("role")
    .optional()
    .isIn(["GLOBAL_ADMIN", "ORG_ADMIN", "EMPLOYEE"])
    .withMessage("Invalid role provided"),
  validate,
];

const loginValidation = [
  body("email")
    .exists().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email format"),
  body("password").exists().withMessage("Password is required"),
  validate,
];

const createUserValidation = [
  body("first_name").notEmpty().withMessage("First name is required"),
  body("last_name").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("organization_id").notEmpty().withMessage("Organization ID is required"),
  body("role")
    .optional()
    .isIn(["ORG_ADMIN", "EMPLOYEE"])
    .withMessage("Role must be ORG_ADMIN or EMPLOYEE"),
  validate,
];

module.exports = {
  registerValidation,
  loginValidation,
  createUserValidation,
};
