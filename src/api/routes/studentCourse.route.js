const express = require("express");
const router = express.Router();

const controller = require("../controllers/studentCourse.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get(
  "/",
  authenticateToken,
  controller.getMyCourses
);

module.exports = router;