const groupService = require("../services/groupShow.service");

const getGroups = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const keyword = req.query.keyword || "";
    const id_lop = req.query.id_lop || null;

    const data = await groupService.getGroups(studentId, keyword, id_lop);

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