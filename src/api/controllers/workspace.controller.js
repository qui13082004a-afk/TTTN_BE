const workspaceService = require("../services/workspace.service");

const getWorkspaceInfo = async (req, res) => {
  try {
    const { id_nhom } = req.params;
    const id_sinh_vien = req.user.id_sinh_vien;

    const result = await workspaceService.getWorkspaceInfo(
      id_nhom,
      id_sinh_vien
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id_nhom } = req.params;

    const result = await workspaceService.sendMessage({
      id_nhom,
      id_nguoi_gui: req.user.id_sinh_vien,
      noi_dung: req.body.noi_dung
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMessageCount = async (req, res) => {
  try {
    const userId = req.user.id_sinh_vien;
    const result = await workspaceService.getMessageCount(userId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id_nhom } = req.params;

    if (!id_nhom) {
      throw new Error("Thiếu id_nhom");
    }

    const result = await workspaceService.getMessages(
      id_nhom,
      req.user.id_sinh_vien
    );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const revokeMessage = async (req, res) => {
  try {
    const userId = req.user.id_sinh_vien;
    const notificationId = req.params.id_tin_nhan;

    const result = await workspaceService.revokeMessage(
      userId,
      notificationId
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getWorkspaceInfo,
  sendMessage,
  getMessageCount,
  getMessages,
  revokeMessage
};