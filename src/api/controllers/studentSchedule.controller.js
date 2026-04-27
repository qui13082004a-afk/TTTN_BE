const scheduleService = require("../services/studentSchedule.service");

const getSchedule = async (req, res) => {
  try {
    const id_sinh_vien = req.user.id;
    const { date } = req.query;

    const result = await scheduleService.getSchedule(id_sinh_vien, date);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const countLateTasks = async (req, res) => {
  try {
    const id_sinh_vien = req.user.id;

    const result = await scheduleService.countLateTasks(id_sinh_vien);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getSchedule,
  countLateTasks
};