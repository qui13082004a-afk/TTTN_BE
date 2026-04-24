const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupJoin.controller");

router.post("/", groupController.joinGroups);
router.post("/join-code", groupController.joinByCode);

module.exports = router;