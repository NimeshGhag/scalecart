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
  .isEmail()
  .withMessage("Invalid email address"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  
  body("role")
    .optional()
    .isIn(["user", "seller"])
    .withMessage("Role must be either 'user' or 'seller'"),
  respondWithValidationErrors,
];

module.exports = {
  registerUserValidations,
};
