const groupService = require("../services/groupShow.service");

const getGroups = async (req, res) => {
  try {
    const studentId = req.user?.id || req.query.id_sinh_vien;
    const keyword = req.query.keyword || "";

    const data = await groupService.getGroups(studentId, keyword);

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getGroups
};