const express = require("express");
const multer = require("multer");
const createAuthMiddleware = require("../middlewares/auth.middleware");
const {
  createProductValidation,
  updateProductValidation
} = require("../middlewares/validator.middleware");
const {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
} = require("../controllers/product.controller");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/create-product",
  createAuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  createProductValidation,
  createProductController,
);

router.get("/", getProductsController);
router.get("/:id", getProductByIdController);

router.patch(
  "/update-product/:id",
  createAuthMiddleware(["admin", "seller"]),
  updateProductValidation,
  updateProductController,
);

module.exports = router;
