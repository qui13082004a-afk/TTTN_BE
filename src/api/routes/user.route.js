const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/profile", userController.getProfile);
router.get("/profile/id", userController.getProfileById);
router.get("/student/:id", userController.getStudentById);
router.get("/lecturer/:id", userController.getLecturerById);

// API lấy thông tin tài khoản hiện tại (cần authentication)
router.get("/me", authenticateToken, userController.getCurrentUser);

module.exports = router;