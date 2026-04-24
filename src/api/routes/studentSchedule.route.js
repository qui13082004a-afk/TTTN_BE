const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentSchedule.controller");

router.get("/:id_sinh_vien", controller.getSchedule);
router.get("/late-tasks/:id_sinh_vien", controller.countLateTasks);

module.exports = router;