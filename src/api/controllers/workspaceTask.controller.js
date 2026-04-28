const taskService = require("../services/workspaceTask.service");

const createTask = async (req, res) => {
  try {
    const { id_nhom } = req.params;

    const result = await taskService.createTask(
      id_nhom,
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

const getGroupProgress = async (req, res) => {
  try {
    const { id_nhom } = req.params;

    const result = await taskService.getGroupProgress(id_nhom);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTask,
  getGroupProgress
};
