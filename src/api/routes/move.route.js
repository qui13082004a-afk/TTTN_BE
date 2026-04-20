const express = require("express");
const router = express.Router();
const adminController = require("../controllers/move_and_kick.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

// Chuyển sinh viên từ nhóm hiện tại sang nhóm khác
router.post("/move-student", authenticateToken, authorizeLecturer, adminController.moveStudent);

module.exports = router;
