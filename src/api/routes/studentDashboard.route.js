const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/studentDashboard.controller");

router.get("/:id_sinh_vien", dashboardController.getDashboard);

module.exports = router;