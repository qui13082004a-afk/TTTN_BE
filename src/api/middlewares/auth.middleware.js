const jwt = require("jsonwebtoken");
const userService = require("../services/user.service");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token khong duoc cung cap" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Token khong hop le" });
    }

    const user = await userService.getProfileById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Token khong hop le - user khong ton tai" });
    }

    if (decoded.iat && user.updated_at) {
      const issuedAtMs = Number(decoded.iat) * 1000;
      const updatedAtMs = new Date(user.updated_at).getTime();

      if (!Number.isNaN(updatedAtMs) && updatedAtMs > issuedAtMs) {
        return res.status(401).json({ message: "Phien dang nhap da het hieu luc, vui long dang nhap lai" });
      }
    }
    //Chỉnh sửa do test api bên sinh viên không chạy được
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      ...user
    };

    next();

  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(403).json({ message: "Token khong hop le" });
  }
};

const authorizeLecturer = (req, res, next) => {
  if (!req.user || !["giangvien", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Chi giang vien hoac admin moi co quyen thuc hien hanh dong nay" });
  }

  next();
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Chi admin moi co quyen thuc hien hanh dong nay" });
  }

  next();
};

module.exports = { authenticateToken, authorizeLecturer, authorizeAdmin };
