const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const registerController = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const isUser = await userModel.findOne({ email });

    if (isUser) {
      return res.status(400).json({
        message: "User already exits",
      });
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashPassword,
      role: role || "user",
    });

    return res.status(201).json({
      message: "User register successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = JWT.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerController,
  loginController,
};
