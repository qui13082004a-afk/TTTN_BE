const dashboardService = require("../services/studentDashboard.service");

const getDashboard = async (req, res) => {
  try {
    const { id_sinh_vien } = req.params;

    const result = await dashboardService.getDashboard(id_sinh_vien);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboard
};