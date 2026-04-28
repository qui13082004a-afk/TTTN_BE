const bcrypt = require("bcrypt");
const SinhVien = require("../models/sinh_vien.model");

const getProfile = async (id) => {
  //const student = await SinhVien.findByPk(id);

  const student = await SinhVien.findOne({
  where: {
    id_sinh_vien: id
  }
});

  if (!student) {
    throw new Error("Không tìm thấy sinh viên");
  }

  return {
    success: true,
    data: {
      id: student.id_sinh_vien,
      ho_ten: student.ho_ten,
      ma_sinh_vien: student.mssv,
      mssv: student.mssv,
      ma_lop: student.ma_lop,
      email: student.email,
      sdt: student.sdt,
      avatar: student.avatar
    }
  };
};

const updateProfile = async (data) => {
  const { id_sinh_vien, sdt, avatar } = data;

  const student = await SinhVien.findByPk(id_sinh_vien);

  if (!student) {
    throw new Error("Không tìm thấy sinh viên");
  }

  const phoneRegex = /^[0-9]{10}$/;

  if (sdt && !phoneRegex.test(sdt)) {
    throw new Error("Số điện thoại phải gồm đúng 10 chữ số");
  }

  await student.update({
    sdt,
    avatar
  });

  return {
    success: true,
    message: "Cập nhật thông tin thành công!"
  };
};

const uploadAvatar = async (id_sinh_vien, fileName) => {
  const student = await SinhVien.findByPk(id_sinh_vien);

  if (!student) {
    throw new Error("Không tìm thấy sinh viên");
  }

  await student.update({
    avatar: fileName
  });

  return {
    success: true,
    message: "Cập nhật ảnh đại diện thành công",
    avatar_url: `/uploads/avatars/${fileName}`
  };
};

const changePassword = async (id_sinh_vien, mat_khau_cu, mat_khau_moi) => {
  const student = await SinhVien.findByPk(id_sinh_vien);

  if (!student) {
    throw new Error("Không tìm thấy sinh viên");
  }

  const isMatch = await bcrypt.compare(mat_khau_cu, student.mat_khau);

  if (!isMatch) {
    throw new Error("Mật khẩu cũ không chính xác");
  }

  const hashedPassword = await bcrypt.hash(mat_khau_moi, 10);

  await student.update({
    mat_khau: hashedPassword
  });

  return {
    success: true,
    message: "Đổi mật khẩu thành công"
  };
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword
};
