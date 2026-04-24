const profileService = require("../services/studentProfile.service");

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await profileService.getProfile(id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id_sinh_vien, sdt, avatar } = req.body;

    const result = await profileService.updateProfile({
      id_sinh_vien,
      sdt,
      avatar
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const uploadStudentAvatar = async (req, res) => {
  try {
    const { id_sinh_vien } = req.body;

    if (!req.file) {
      throw new Error("Vui lòng chọn ảnh");
    }

    const result = await profileService.uploadAvatar(
      id_sinh_vien,
      req.file.filename
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id_sinh_vien, mat_khau_cu, mat_khau_moi } = req.body;

    const result = await profileService.changePassword(
      id_sinh_vien,
      mat_khau_cu,
      mat_khau_moi
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
  getProfile,
  updateProfile,
  uploadStudentAvatar,
  changePassword
};