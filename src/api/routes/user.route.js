const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Lay thong tin sinh vien theo ID
router.get("/student/:id", userController.getStudentById);

// Lay thong tin giang vien theo ID
router.get("/lecturer/:id", userController.getLecturerById);

// Lay thong tin tai khoan dang dang nhap
router.get("/me", authenticateToken, userController.getCurrentUser);

// Doi mat khau cho tai khoan dang dang nhap
router.patch("/change-password", authenticateToken, userController.changePassword);

module.exports = router;
