const express = require("express");

const {
  registerController,
  loginController,
  getCurrentUserController,
} = require("../controllers/auth.controler");
const {
  registerUserValidations,
  loginUserValidations,
} = require("../middlewares/validator.middleware");

const authMiddleware  = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerUserValidations, registerController);
router.post("/login", loginUserValidations, loginController);

//GET API'secure

router.get("/me", authMiddleware, getCurrentUserController);

module.exports = router;
