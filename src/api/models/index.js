const GiangVien = require("./giang_vien.model");
const SinhVien = require("./sinh_vien.model");
const LopHoc = require("./lop_hoc.model");
const NhomHoc = require("./nhom_hoc.model");
const CongViec = require("./cong_viec.model");
const NhatKy = require("./nhat_ky.model");
const TinNhan = require("./tin_nhan.model");
const SinhVienLopHoc = require("./sinh_vien_lop_hoc.model");
const ThanhVienNhom = require("./thanh_vien_nhom.model");

const { sequelize } = require("../../config/database");

// 1. Giảng viên - Lớp học (1-n)
GiangVien.hasMany(LopHoc, { foreignKey: "id_giang_vien" });
LopHoc.belongsTo(GiangVien, { foreignKey: "id_giang_vien" });
// 2. Lớp học - Nhóm học (1-n)
LopHoc.hasMany(NhomHoc, { foreignKey: "id_lop" , as:"nhom_hoc" });
NhomHoc.belongsTo(LopHoc, { foreignKey: "id_lop" , as:"lop_hoc"});
// 3. Nhóm học - Công việc (1-n)
NhomHoc.hasMany(CongViec, { foreignKey: "id_nhom" });
CongViec.belongsTo(NhomHoc, { foreignKey: "id_nhom" });
// 4. Sinh viên - Công việc (1-n)
SinhVien.hasMany(CongViec, { foreignKey: "id_sinh_vien" }); // Database la id_sinh_vien_phu_trach
CongViec.belongsTo(SinhVien, { foreignKey: "id_sinh_vien" }); // Database la id_sinh_vien_phu_trach
// 5. Công việc - Nhật ký (1-n)
CongViec.hasMany(NhatKy, { foreignKey: "id_cong_viec" });
NhatKy.belongsTo(CongViec, { foreignKey: "id_cong_viec" });
// 6. Nhóm & Sinh viên - Tin nhắn
NhomHoc.hasMany(TinNhan, { foreignKey: "id_nhom" });
TinNhan.belongsTo(NhomHoc, { foreignKey: "id_nhom" });
// 7
SinhVien.hasMany(TinNhan, { foreignKey: "id_sinh_vien" }); // Database la id_nguoi_gui
TinNhan.belongsTo(SinhVien, { foreignKey: "id_sinh_vien" }); // Database la id_nguoi_gui
// 8. Sinh viên - Lớp học (n-n)
SinhVien.belongsToMany(LopHoc, {
  through: SinhVienLopHoc,
  foreignKey: "id_sinh_vien",
  otherKey: "id_lop",
});
LopHoc.belongsToMany(SinhVien, {
  through: SinhVienLopHoc,
  foreignKey: "id_lop",
  otherKey: "id_sinh_vien",
});
// 9
SinhVien.belongsToMany(NhomHoc, {
  through: ThanhVienNhom,
  foreignKey: "id_sinh_vien",
  otherKey: "id_nhom",
});
NhomHoc.belongsToMany(SinhVien, {
  through: ThanhVienNhom,
  foreignKey: "id_nhom",
  otherKey: "id_sinh_vien",
});
// 10. Trưởng nhóm
NhomHoc.belongsTo(SinhVien, {
  foreignKey: "id_nhom_truong",
  as: "truongNhom",
});
// 11. Nhóm học - Thành viên nhóm (1-n)
NhomHoc.hasMany(ThanhVienNhom, { foreignKey: "id_nhom" });
ThanhVienNhom.belongsTo(NhomHoc, { foreignKey: "id_nhom" });
// 12. Sinh viên - Thành viên nhóm (1-n)
SinhVien.hasMany(ThanhVienNhom, { foreignKey: "id_sinh_vien" });
ThanhVienNhom.belongsTo(SinhVien, { foreignKey: "id_sinh_vien" });

module.exports = {
  sequelize,
  GiangVien,
  SinhVien,
  LopHoc,
  NhomHoc,
  CongViec,
  NhatKy,
  TinNhan,
  SinhVienLopHoc,
  ThanhVienNhom,
};
