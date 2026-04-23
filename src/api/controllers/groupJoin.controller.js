const groupService = require("../services/groupJoin.service");

const joinGroups = async (req, res) => {
  try {
    const { id_sinh_vien, id_nhom } = req.body;

    const result = await groupService.joinGroups(id_sinh_vien, id_nhom);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const joinByCode = async (req, res) => {
  try {
    const { id_sinh_vien, ma_nhom } = req.body;

    const result = await groupService.joinByCode(id_sinh_vien, ma_nhom);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  joinGroups,
  joinByCode
};