const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupJoin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", groupController.joinGroups);

module.exports = router;