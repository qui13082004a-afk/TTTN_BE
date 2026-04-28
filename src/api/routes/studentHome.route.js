const express = require("express");
const router = express.Router();

const studentHomeController = require("../controllers/studentHome.controller");
const groupController = require("../controllers/groupJoin.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get(
  "/",
  authenticateToken,
  studentHomeController.getStudentHome
);

router.post(
  "/join-code",
  authenticateToken,
  groupController.joinByCode
);

// router.post(
//   "/create-group",
//   authenticateToken,
//   studentHomeController.createGroup
// );

module.exports = router;
