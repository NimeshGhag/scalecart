const express = require("express");

const {
  registerController,
  loginController,
  getCurrentUserController,
  logutController,
  verifyController,
  resendVerifyController,
  forgotPasswordController,
  resetPasswordController,
} = require("../controllers/auth.controler");
const {
  registerUserValidations,
  loginUserValidations,
  emailVerifyValidation,
} = require("../middlewares/validator.middleware");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerUserValidations, registerController);
router.post("/login", loginUserValidations, loginController);

router.post("/logout", logutController);

router.post("/resend-verification", emailVerifyValidation, resendVerifyController);

router.post("/forgot-password", emailVerifyValidation, forgotPasswordController);
router.post ("/reset-password", resetPasswordController);

//GET API'secure

router.get("/me", authMiddleware, getCurrentUserController);

router.get("/verify-email", verifyController);

module.exports = router;
