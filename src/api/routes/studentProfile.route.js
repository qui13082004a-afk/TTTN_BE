const express = require("express");
const router = express.Router();

const controller = require("../controllers/studentProfile.controller");
const uploadAvatar = require("../middlewares/uploadAvatar.middleware");

router.get("/:id", controller.getProfile);
router.put("/", controller.updateProfile);

router.post(
  "/upload-avatar",
  uploadAvatar.single("avatar"),
  controller.uploadStudentAvatar
);

router.put("/change-password", controller.changePassword);

module.exports = router;