const jwt = require("jsonwebtoken");
const userService = require("../services/user.service");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token không du?c cung c?p" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Token không h?p l?" });
    }

    const user = await userService.getProfileById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Token không h?p l? - user không t?n t?i" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(403).json({ message: "Token không h?p l?" });
  }
};

const authorizeLecturer = (req, res, next) => {
  if (!req.user || !["giangvien", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Ch? gi?ng viên ho?c admin m?i có quy?n th?c hi?n hành d?ng này" });
  }

  next();
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Ch? admin m?i có quy?n th?c hi?n hành d?ng này" });
  }

  next();
};

module.exports = { authenticateToken, authorizeLecturer, authorizeAdmin };
