const JWT = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({
      message: "Unauthorized: No token provided",
    });
  }
  try {
    const decoded = await JWT.verify(accessToken, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = authMiddleware;
