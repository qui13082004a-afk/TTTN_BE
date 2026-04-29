const workspaceService = require("../services/workspace.service");

const getWorkspaceInfo = async (req, res) => {
  try {
    const { id_nhom } = req.params;
    const id_sinh_vien = req.user.id;

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

const getMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;

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
    const userId = req.user.id;

    const result = await workspaceService.getMessages(userId);

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
    const userId = req.user.id;
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
  getMessageCount,
  getMessages,
  revokeMessage
};