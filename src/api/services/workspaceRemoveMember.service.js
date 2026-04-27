const NhomHoc = require("../models/nhom_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");

const removeMember = async (id_nhom, id_thanh_vien, id_sinh_vien) => {
  const group = await NhomHoc.findByPk(id_nhom);

  if (!group) {
    throw new Error("Không tìm thấy nhóm");
  }

  if (Number(group.id_nhom_truong) !== Number(id_sinh_vien)) {
    throw new Error("Chỉ trưởng nhóm mới được xóa thành viên");
  }

  if (Number(id_thanh_vien) === Number(id_sinh_vien)) {
    throw new Error("Không thể tự xóa chính mình");
  }

  const member = await ThanhVienNhom.findOne({
    where: {
      id_nhom,
      id_sinh_vien: id_thanh_vien
    }
  });

  if (!member) {
    throw new Error("Thành viên không thuộc nhóm");
  }

  await member.destroy();

  return {
    success: true,
    message: "Xóa thành viên khỏi nhóm thành công"
  };
};

module.exports = {
  removeMember
};