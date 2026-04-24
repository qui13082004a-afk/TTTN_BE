const express = require("express");
const router = express.Router();

const workspaceController = require("../controllers/workspace.controller");
const memberController = require("../controllers/workspaceMember.controller");
const removeController = require("../controllers/workspaceRemoveMember.controller");
const taskController = require("../controllers/workspaceTask.controller");

router.get("/:id_nhom", workspaceController.getWorkspaceInfo);

router.get("/:id_nhom/members", memberController.getGroupMembers);

router.delete("/:id_nhom/members/:id_thanh_vien", removeController.removeMember);

router.post("/:id_nhom/tasks", taskController.createTask);

module.exports = router;