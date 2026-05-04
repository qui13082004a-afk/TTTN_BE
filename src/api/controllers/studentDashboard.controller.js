const dashboardService = require("../services/studentDashboard.service");

const getDashboard = async (req, res) => {
  try {
    const id_sinh_vien = req.user.id;
    const lastSeenMessageId = req.query.lastSeenMessageId || 0;

    const result = await dashboardService.getDashboard(
      id_sinh_vien,
      lastSeenMessageId
    );

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