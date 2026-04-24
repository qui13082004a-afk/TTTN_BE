const courseService = require("../services/studentCourse.service");

const getMyCourses = async (req, res) => {
  try {
    const { id_sinh_vien } = req.params;

    const result = await courseService.getMyCourses(id_sinh_vien);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getMyCourses
};