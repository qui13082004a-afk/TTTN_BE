const express = require("express");
const router = express.Router();

const controller = require("../controllers/studentCourse.controller");

router.get("/:id_sinh_vien", controller.getMyCourses);

module.exports = router;