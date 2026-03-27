const GiangVien = require("./giang_vien.model");
const SinhVien = require("./sinh_vien.model");
const LopHoc = require("./lop_hoc.model");
const NhomHoc = require("./nhom_hoc.model");
const CongViec = require("./cong_viec.model");
const NhatKy = require("./nhat_ky.model");
const TinNhan = require("./tin_nhan.model");

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
SinhVien.hasMany(CongViec, { foreignKey: "id_sinh_vien" });
CongViec.belongsTo(SinhVien, { foreignKey: "id_sinh_vien" });

// 5. Công việc - Nhật ký (1-n)
CongViec.hasMany(NhatKy, { foreignKey: "id_cong_viec" });
NhatKy.belongsTo(CongViec, { foreignKey: "id_cong_viec" });

// 6. Nhóm & Sinh viên - Tin nhắn
NhomHoc.hasMany(TinNhan, { foreignKey: "id_nhom" });
TinNhan.belongsTo(NhomHoc, { foreignKey: "id_nhom" });
SinhVien.hasMany(TinNhan, { foreignKey: "id_sinh_vien" });
TinNhan.belongsTo(SinhVien, { foreignKey: "id_sinh_vien" });

module.exports = {
  GiangVien, SinhVien, LopHoc, NhomHoc, CongViec, NhatKy, TinNhan
};