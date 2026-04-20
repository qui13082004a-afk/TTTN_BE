const express = require("express");
const router = express.Router();
const moveController = require("../controllers/move_and_kick.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

// Xóa sinh viên ra khỏi nhóm hiện tại
router.delete("/kick-student", authenticateToken, authorizeLecturer, moveController.kickStudent);

module.exports = router;
