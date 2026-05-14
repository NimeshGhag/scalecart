const express = require("express");

const {
  registerController,
  loginController,
  getCurrentUserController,
  logutController,
  verifyController,
  resendVerifyController,
} = require("../controllers/auth.controler");
const {
  registerUserValidations,
  loginUserValidations,
  resendVerifyValidation,
} = require("../middlewares/validator.middleware");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerUserValidations, registerController);
router.post("/login", loginUserValidations, loginController);

router.post("/logout", logutController);

router.post("/resend-verification", resendVerifyValidation, resendVerifyController);

//GET API'secure

router.get("/me", authMiddleware, getCurrentUserController);

router.get("/verify-email", verifyController);

module.exports = router;
