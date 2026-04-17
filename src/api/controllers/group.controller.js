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

module.exports = {
  joinGroup
};