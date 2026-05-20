const { body, validationResult } = require("express-validator");

const resposeWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createProductValidation = [
  body("title")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Title is required and must be a non-empty string."),

  body("description")
    .isString()
    .notEmpty()
    .trim()
    .withMessage("Description is required and must be a non-empty string.")
    .bail()
    .isLength({ max: 500 })
    .withMessage("description max length is 500 characters"),

  body("priceAmount")
    .notEmpty()
    .withMessage("Price is required.")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number."),

  body("priceCurrency")
    .optional()
    .isIn(["USD", "INR"])
    .withMessage("Currency must be either 'USD' or 'INR'."),

  resposeWithValidationErrors,
];

module.exports = { createProductValidation };
