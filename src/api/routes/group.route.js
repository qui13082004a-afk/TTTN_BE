const express = require("express");
const router = express.Router();

const groupController = require("../controllers/group.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

router.post("/join", groupController.joinGroup);
router.get("/my-groups", groupController.getMyGroups);
router.get("/:groupId/students", authenticateToken, authorizeLecturer, groupController.getStudentsByGroupId);

module.exports = router;
