const jwt = require("jsonwebtoken");
const userService = require("../services/user.service");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token không được cung cấp" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // Lấy thông tin user từ database
    const user = await userService.getProfileById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Token không hợp lệ - user không tồn tại" });
    }

    // Gán thông tin user vào request
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

module.exports = { authenticateToken };