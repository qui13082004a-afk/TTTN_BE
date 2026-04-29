const express = require("express");
const router = express.Router();

const workspaceController = require("../controllers/workspace.controller");
const memberController = require("../controllers/workspaceMember.controller");
const removeController = require("../controllers/workspaceRemoveMember.controller");
const taskController = require("../controllers/workspaceTask.controller");
const taskListController = require("../controllers/workspaceTaskList.controller");
const taskStatusController = require("../controllers/workspaceTaskStatus.controller");
const taskDetailController = require("../controllers/workspaceTaskDetail.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/messages/count", authenticateToken, workspaceController.getMessageCount);
router.get("/messages", authenticateToken, workspaceController.getMessages);
router.put("/messages/:id_tin_nhan/revoke", authenticateToken, workspaceController.revokeMessage);

router.get("/:id_nhom", authenticateToken, workspaceController.getWorkspaceInfo);
router.get("/:id_nhom/members", authenticateToken, memberController.getGroupMembers);
router.delete("/:id_nhom/members/:id_thanh_vien", authenticateToken, removeController.removeMember);
router.post("/:id_nhom/tasks", authenticateToken, taskController.createTask);
router.get("/:id_nhom/tasks", authenticateToken, taskListController.getTasksByGroup);

router.put("/tasks/:id_cong_viec/status", authenticateToken, taskStatusController.updateTaskStatus);
router.get("/tasks/:id_cong_viec", authenticateToken, taskDetailController.getTaskDetail);
router.get("/:id_nhom/progress", authenticateToken, taskController.getGroupProgress);

module.exports = router;