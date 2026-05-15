const JWT = require("jsonwebtoken");
const refreshTokenModel = require("../models/refreshToken.model");

const sendTokenResponse = async (res, user, message = "Logged in successfully") => {
  const token = JWT.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  const refreshToken = JWT.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );

  await refreshTokenModel.findOneAndUpdate(
    { user: user._id },
    { token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 3600000) },
    { upsert: true, returnDocument: "after" },
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: true,
    maxAge: 7 * 24 * 3600000,
  });

  res.status(200).json({
    message,
    user: {
       id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
    },
  });
};

module.exports = {
  sendTokenResponse,
};
