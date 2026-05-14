const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const redis = require("../db/redis");
const { sendEmail } = require("../utils/email.service");

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

    const verificationToken = JWT.sign(
      { id: user._id },
      process.env.EMAIL_TOKEN_SECRET,
      {
        expiresIn: "10m",
      },
    );

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

    try {
      await sendEmail(
        user.email,
        "Email Verification",
        `Please verify your email by clicking the following link: ${verificationLink}`,
        `<p>Please verify your email by clicking the following link: <a href="${verificationLink}">Verify Email</a></p>`,
      );
    } catch (error) {
      console.error("Error sending email:", error);

      return res.status(500).json({
        message: "User registered but failed to send verification email",
      });
    }

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

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
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

const getCurrentUserController = async (req, res) => {
  return res.status(200).json({
    message: "Current user fetched successfully",

    user: req.user,
  });
};

const logutController = async (req, res) => {
  try {
    const { accessToken } = req.cookies;

    if (accessToken) {
      await redis.set(`blacklist${accessToken}`, true, "EX", 24 * 60 * 60);
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
    });

    return res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyController = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({
      message: "verification token is required",
    });
  }

  try {
    const decoded = await JWT.verify(token, process.env.EMAIL_TOKEN_SECRET);

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        message: "Email already verified",
      });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid or expired token",
    });
  }
};

const resendVerifyController = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        message: "Email is already verified, You can login ",
      });
    }

    const timeStamp = user.lastVerificationEmailSentAt;
    if (timeStamp) {
      const currentTime = new Date();
      const timeDiff = (currentTime - timeStamp) / 1000;

      if (timeDiff < 60) {
        return res.status(429).json({
          message:
            "Please wait 60 seconds before requesting another verification email",
        });
      }
    }

    const verificationToken = JWT.sign(
      { id: user._id },
      process.env.EMAIL_TOKEN_SECRET,
      {
        expiresIn: "10m",
      },
    );

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
    try {
      await sendEmail(
        user.email,
        "Email Verification",
        `Please verify your email by clicking the following link: ${verificationLink}`,
        `<p>Please verify your email by clicking the following link: <a href="${verificationLink}">Verify Email</a></p>`,
      );

      user.lastVerificationEmailSentAt = new Date();
      await user.save();

      return res.status(200).json({
        message: "Verification email resent successfully",
      });
    } catch (error) {
      console.error("Error sending email:", error);

      return res.status(200).json({
        message: "Failed to send verification email",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerController,
  loginController,
  getCurrentUserController,
  logutController,
  verifyController,
  resendVerifyController,
};
