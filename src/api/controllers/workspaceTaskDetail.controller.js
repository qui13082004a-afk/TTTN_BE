const taskDetailService = require("../services/workspaceTaskDetail.service");

const getTaskDetail = async (req, res) => {
  try {
    const { id_cong_viec } = req.params;

    const result = await taskDetailService.getTaskDetail(id_cong_viec);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getTaskDetail
};