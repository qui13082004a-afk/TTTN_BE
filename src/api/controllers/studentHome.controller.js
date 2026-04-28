const studentHomeService = require("../services/studentHome.service");

const getStudentHome = async (req, res) => {
  try {
    const id_sinh_vien = req.user.id;

    const result = await studentHomeService.getStudentHome(id_sinh_vien);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// const createGroup = async (req, res) => {
//   try {
//     const id_sinh_vien = req.user.id;
//     const { id_lop, ten_nhom } = req.body;

//     const result = await studentHomeService.createGroup(
//       id_sinh_vien,
//       id_lop,
//       ten_nhom
//     );

//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

module.exports = {
  getStudentHome
  //createGroup
};