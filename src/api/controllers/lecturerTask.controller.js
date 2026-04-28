const taskService = require("../services/workspaceTask.service");

const createTaskForGroup = async (req, res) => {
  try {
    const { id_nhom } = req.params;

    const result = await taskService.createLecturerTask(
      id_nhom,
      req.user,
      req.body
    );

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getTasksByGroup = async (req, res) => {
  try {
    const { id_nhom } = req.params;

    const result = await taskService.getLecturerTasksByGroup(
      id_nhom,
      req.user
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
  createTaskForGroup,
  getTasksByGroup
};
