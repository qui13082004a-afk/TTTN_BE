const dashboardService = require("../services/dashboard.service");

exports.getLecturerSummary = async (req, res) => {
  try {
    const result = await dashboardService.getLecturerSummary(req.user, req.query.hoc_ky);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPendingActions = async (req, res) => {
  try {
    const result = await dashboardService.getPendingActions(req.user, req.query.hoc_ky);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const result = await dashboardService.getNotifications(req.user, {
      hoc_ky: req.query.hoc_ky,
      limit: req.query.limit,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
