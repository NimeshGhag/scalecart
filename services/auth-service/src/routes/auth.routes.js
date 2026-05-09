const express = require("express");

const { registerController } = require("../controllers/auth.controler");
const {
  registerUserValidations,
} = require("../middlewares/validator.middleware");

const router = express.Router();

router.post("/register", registerUserValidations, registerController);

module.exports = router;
