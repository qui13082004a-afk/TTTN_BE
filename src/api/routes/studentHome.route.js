const express = require("express");
const router = express.Router();

const studentHomeController = require("../controllers/studentHome.controller");
const groupController = require("../controllers/groupJoin.controller");

router.get("/:id_sinh_vien", studentHomeController.getStudentHome);
router.post("/join-code", groupController.joinByCode);
router.post("/create-group", studentHomeController.createGroup);

module.exports = router;