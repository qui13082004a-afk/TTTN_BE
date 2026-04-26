const express = require("express");
const router = express.Router();

const controller = require("../controllers/studentProfile.controller");
const uploadAvatar = require("../middlewares/uploadAvatar.middleware");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get(
  "/me",
  authenticateToken,
  controller.getProfile
);

router.put(
  "/",
  authenticateToken,
  controller.updateProfile
);

router.post(
  "/upload-avatar",
  authenticateToken,
  uploadAvatar.single("avatar"),
  controller.uploadStudentAvatar
);

router.put(
  "/change-password",
  authenticateToken,
  controller.changePassword
);

module.exports = router;