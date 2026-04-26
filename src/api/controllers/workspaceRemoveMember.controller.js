const removeService = require("../services/workspaceRemoveMember.service");

const removeMember = async (req, res) => {
  try {
    const { id_nhom, id_thanh_vien } = req.params;
    const id_sinh_vien = req.user.id;

    const result = await removeService.removeMember(
      id_nhom,
      id_thanh_vien,
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
  removeMember
};