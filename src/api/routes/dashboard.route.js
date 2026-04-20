const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

router.get("/lecturer/summary", authenticateToken, authorizeLecturer, dashboardController.getLecturerSummary);
router.get("/lecturer/pending-actions", authenticateToken, authorizeLecturer, dashboardController.getPendingActions);
router.get("/lecturer/notifications", authenticateToken, authorizeLecturer, dashboardController.getNotifications);

module.exports = router;
