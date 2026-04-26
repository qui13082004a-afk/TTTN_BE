const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/studentDashboard.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get(
  "/",
  authenticateToken,
  dashboardController.getDashboard
);

module.exports = router;