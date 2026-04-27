const express = require("express");
const router = express.Router();

const controller = require("../controllers/studentSchedule.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get(
  "/",
  authenticateToken,
  controller.getSchedule
);

router.get(
  "/late-tasks",
  authenticateToken,
  controller.countLateTasks
);

module.exports = router;