const express = require("express");

const {
  registerController,
  loginController,
} = require("../controllers/auth.controler");
const {
  registerUserValidations,
  loginUserValidations,
} = require("../middlewares/validator.middleware");

const router = express.Router();

router.post("/register", registerUserValidations, registerController);
router.post("/login", loginUserValidations, loginController);

module.exports = router;
