const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller");

router.post("/join", groupController.joinGroup);

module.exports = router;