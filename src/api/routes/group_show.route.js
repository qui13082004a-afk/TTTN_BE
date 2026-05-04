const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupShow.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get(
  "/",
  authenticateToken,
  groupController.getGroups
);

module.exports = router;