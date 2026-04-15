const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/student/:id", userController.getStudentById);
router.get("/lecturer/:id", userController.getLecturerById);

router.get("/me", authenticateToken, userController.getCurrentUser);

module.exports = router;