const express = require("express");
const router = express.Router();
const groupChangeRequestController = require("../controllers/groupChangeRequest.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// [Sinh vien] Gui mot yeu cau chuyen nhom moi tu nhom hien tai sang nhom khac trong cung lop
router.post("/", authenticateToken, groupChangeRequestController.createRequest);

// [Giang vien] Dong y yeu cau chuyen nhom dang cho duyet, co transaction doi nhom va check live si so nhom dich
router.patch("/:requestId/approve", authenticateToken, groupChangeRequestController.approveRequest);

// [Giang vien] Tu choi yeu cau chuyen nhom dang cho duyet, giu nguyen nhom cu cua sinh vien
router.patch("/:requestId/reject", authenticateToken, groupChangeRequestController.rejectRequest);

// Sinh viên xem request hiện tại
router.get(
  "/me",
  authenticateToken,
  groupChangeRequestController.getMyRequest
);

// Sinh viên hủy request
router.delete(
  "/:requestId",
  authenticateToken,
  groupChangeRequestController.cancelRequest
);

module.exports = router;