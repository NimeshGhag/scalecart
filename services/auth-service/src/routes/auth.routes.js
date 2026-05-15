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
  refreshTokenController,
  getAddressController,
  addAddressController,
} = require("../controllers/auth.controler");
const {
  registerUserValidations,
  loginUserValidations,
  emailVerifyValidation,
  addAddressValidation,
} = require("../middlewares/validator.middleware");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerUserValidations, registerController);
router.post("/login", loginUserValidations, loginController);

router.post("/logout", logutController);

router.post("/resend-verification", emailVerifyValidation, resendVerifyController);

router.post("/forgot-password", emailVerifyValidation, forgotPasswordController);
router.post("/reset-password", resetPasswordController);

router.post("/refresh-token", refreshTokenController);

//GET API's

router.get("/me", authMiddleware, getCurrentUserController);

router.get("/verify-email", verifyController);

//API'S for user address
router.get("/me/address", authMiddleware, getAddressController);
router.post("/me/add-address", authMiddleware, addAddressValidation, addAddressController);

module.exports = router;
