const express = require("express");
const router = express.Router();

const groupController = require("../controllers/group.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/join", groupController.joinGroup);
router.get("/my-groups", groupController.getMyGroups);

module.exports = router;