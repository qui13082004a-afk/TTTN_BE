const GiangVien = require("./giang_vien.model");
const SinhVien = require("./sinh_vien.model");
const LopHoc = require("./lop_hoc.model");
const NhomHoc = require("./nhom_hoc.model");
const CongViec = require("./cong_viec.model");
const NhatKy = require("./nhat_ky.model");
const TinNhan = require("./tin_nhan.model");
const SinhVienLopHoc = require("./sinh_vien_lop_hoc.model");
const ThanhVienNhom = require("./thanh_vien_nhom.model");
const YeuCauChuyenNhom = require("./yeu_cau_chuyen_nhom.model");
const { sequelize } = require("../../config/database");
// 1. Giảng viên - Lớp học (1-n)
GiangVien.hasMany(LopHoc, { foreignKey: "id_giang_vien" });
LopHoc.belongsTo(GiangVien, { foreignKey: "id_giang_vien" });
// 2. Lớp học - Nhóm học (1-n)
LopHoc.hasMany(NhomHoc, { foreignKey: "id_lop" });
NhomHoc.belongsTo(LopHoc, { foreignKey: "id_lop" });
// 3. Nhóm học - Công việc (1-n)
NhomHoc.hasMany(CongViec, { foreignKey: "id_nhom" });
CongViec.belongsTo(NhomHoc, { foreignKey: "id_nhom" });
// 4. Sinh viên - Công việc (1-n)
SinhVien.hasMany(CongViec, { foreignKey: "id_sinh_vien_phu_trach" });
CongViec.belongsTo(SinhVien, { foreignKey: "id_sinh_vien_phu_trach" });
// 5. Công việc - Nhật ký (1-n)
CongViec.hasMany(NhatKy, { foreignKey: "id_cong_viec" });
NhatKy.belongsTo(CongViec, { foreignKey: "id_cong_viec" });
// 6. Nhóm & Sinh viên - Tin nhắn
NhomHoc.hasMany(TinNhan, { foreignKey: "id_nhom" });
TinNhan.belongsTo(NhomHoc, { foreignKey: "id_nhom" });
SinhVien.hasMany(TinNhan, { foreignKey: "id_nguoi_gui" });
TinNhan.belongsTo(SinhVien, { foreignKey: "id_nguoi_gui" });
// 7. Sinh viên - Lớp học (n-n)
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
// 8. Sinh viÃªn - NhÃ³m há»c (n-n)
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
NhomHoc.belongsTo(SinhVien, { as: "nhom_truong", foreignKey: "id_nhom_truong" });
SinhVien.hasMany(NhomHoc, { as: "nhom_lam_truong", foreignKey: "id_nhom_truong" });

// 9. Sinh vien - Yeu cau chuyen nhom (1-n)
SinhVien.hasMany(YeuCauChuyenNhom, { foreignKey: "id_sinh_vien" });
YeuCauChuyenNhom.belongsTo(SinhVien, { foreignKey: "id_sinh_vien" });

// 10. Nhom cu / nhom moi - Yeu cau chuyen nhom (1-n)
NhomHoc.hasMany(YeuCauChuyenNhom, { as: "yeu_cau_roi_nhom", foreignKey: "id_nhom_cu" });
YeuCauChuyenNhom.belongsTo(NhomHoc, { as: "nhom_cu", foreignKey: "id_nhom_cu" });
NhomHoc.hasMany(YeuCauChuyenNhom, { as: "yeu_cau_vao_nhom", foreignKey: "id_nhom_moi" });
YeuCauChuyenNhom.belongsTo(NhomHoc, { as: "nhom_moi", foreignKey: "id_nhom_moi" });

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
  YeuCauChuyenNhom,
};
