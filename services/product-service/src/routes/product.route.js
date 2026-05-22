const express = require("express");
const multer = require("multer");
const createAuthMiddleware = require("../middlewares/auth.middleware");
const {
  createProductValidation,
} = require("../middlewares/validator.middleware");
const {
  createProductController,
  getProductsController,
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

router.get("/",getProductsController);

module.exports = router;
