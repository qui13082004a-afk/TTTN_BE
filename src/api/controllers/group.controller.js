const groupService = require("../services/group.service");

const joinGroup = async (req, res) => {
  try {
    const { id_sinh_vien, id_nhom } = req.body;

    const result = await groupService.joinGroup(id_sinh_vien, id_nhom);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const studentId = 158;
    const keyword = req.query.keyword || "";

    const data = await groupService.getMyGroups(studentId, keyword);

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

const getStudentsByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = await groupService.getStudentsByGroupId(groupId, req.user);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  joinGroup,
  getMyGroups,
  getStudentsByGroupId
};
