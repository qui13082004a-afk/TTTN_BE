const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupJoin.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post(
  "/",
  authenticateToken,
  groupController.joinGroups
);

router.post(
  "/join-code",
  authenticateToken,
  groupController.joinByCode
);

module.exports = router;
