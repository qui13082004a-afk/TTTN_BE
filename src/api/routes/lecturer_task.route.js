const express = require("express");
const router = express.Router();

const lecturerTaskController = require("../controllers/lecturerTask.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

router.post(
  "/groups/:id_nhom/tasks",
  authenticateToken,
  authorizeLecturer,
  lecturerTaskController.createTaskForGroup
);

module.exports = router;
