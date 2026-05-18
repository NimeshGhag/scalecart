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
  deleteAddressController,
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

router.get("/verify-email", verifyController);
router.post("/resend-verification", emailVerifyValidation, resendVerifyController);

router.post("/forgot-password", emailVerifyValidation, forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/refresh-token", refreshTokenController);

router.get("/me", authMiddleware, getCurrentUserController);
router.get("/me/address", authMiddleware, getAddressController);
router.post("/me/add-address", authMiddleware, addAddressValidation, addAddressController);
router.delete("/me/delete-address/:addressId", authMiddleware, deleteAddressController);

module.exports = router;
