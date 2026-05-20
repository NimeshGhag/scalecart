const jwt = require("jsonwebtoken");

const createAuthMiddleware = (role = ["user"]) => {
  return (authMiddleware = async (req, res, next) => {
    const { accessToken } =
      req.cookies || req.headers?.authorization?.split(" ") || {};

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized No token provided" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

      if(!role.includes(decoded.role)){
        return res.status(403).json({
            message:"Forbiden Insufficient permissions"
        })
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized Invalid token" });
    }
  });
};
module.exports = createAuthMiddleware;