const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupShow.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", groupController.getGroups);

module.exports = router;