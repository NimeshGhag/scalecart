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

  body("catagory")
    .notEmpty()
    .withMessage("Category is required.")
    .bail()
    .isIn(["Electronics", "Books", "Fashion"])
    .withMessage("Category must be either 'Electronics', 'Books', or 'Fashion'."),

  resposeWithValidationErrors,
];

const updateProductValidation = [
  body("title")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),

  body("description")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .bail()
    .isLength({ max: 500 })
    .withMessage("Description max length is 500 characters"),

  body("priceAmount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),

  body("priceCurrency")
    .optional()
    .isIn(["USD", "INR"])
    .withMessage("Currency must be USD or INR"),

  body("catagory")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty")
    .bail()
    .isIn(["Electronics", "Books", "Fashion"])
    .withMessage("Category must be either 'Electronics', 'Books', or 'Fashion'."),

  resposeWithValidationErrors,
];

module.exports = { createProductValidation, updateProductValidation };
