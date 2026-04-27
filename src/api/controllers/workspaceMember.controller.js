const memberService = require("../services/workspaceMember.service");

const getGroupMembers = async (req, res) => {
  try {
    const { id_nhom } = req.params;
    const id_sinh_vien = req.user.id;

    const result = await memberService.getGroupMembers(
      id_nhom,
      id_sinh_vien
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
  getGroupMembers
};