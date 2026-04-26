const profileService = require("../services/studentProfile.service");

const getProfile = async (req, res) => {
  try {
    const id_sinh_vien = req.user.id;

    const result = await profileService.getProfile(id_sinh_vien);

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
    const id_sinh_vien = req.user.id;
    const { sdt, avatar } = req.body;

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
    const id_sinh_vien = req.user.id;

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
    const id_sinh_vien = req.user.id;
    const { mat_khau_cu, mat_khau_moi } = req.body;

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