const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");

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
      role,
    });

    return res.status(201).json({
      message: "User register successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerController,
};
