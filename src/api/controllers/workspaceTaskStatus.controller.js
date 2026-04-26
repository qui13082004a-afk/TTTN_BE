const taskStatusService = require("../services/workspaceTaskStatus.service");

const updateTaskStatus = async (req, res) => {
  try {
    const { id_cong_viec } = req.params;

    const result = await taskStatusService.updateTaskStatus(
      id_cong_viec,
      {
        ...req.body,
        id_sinh_vien: req.user.id
      }
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
  updateTaskStatus
};