const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticateToken, authorizeAdmin } = require("../middlewares/auth.middleware");

router.post("/register-lecturer", authenticateToken, authorizeAdmin, authController.registerLecturer);
router.post("/login", authController.login);

module.exports = router;
