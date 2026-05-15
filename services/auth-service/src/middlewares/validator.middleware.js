const { body, validationResult } = require("express-validator");

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerUserValidations = [
  body("name")
    .isString()
    .withMessage("name must be a string")
    .isLength({ min: 3 })
    .withMessage("name must be at least 3 characters long"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["user", "seller"])
    .withMessage("Role must be either 'user' or 'seller'"),
  respondWithValidationErrors,
];

const loginUserValidations = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  respondWithValidationErrors,
];

const emailVerifyValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),

  respondWithValidationErrors,
];

const addAddressValidation = [
  body("street").notEmpty().withMessage("Street is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("zip")
    .notEmpty()
    .withMessage("zip is required")
    .bail()
    .isPostalCode("any")
    .withMessage("Invalid zip format"),
  body("country").notEmpty().withMessage("Country is required"),
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean value"),
  respondWithValidationErrors,
];

module.exports = {
  registerUserValidations,
  loginUserValidations,
  emailVerifyValidation,
  addAddressValidation,
};
