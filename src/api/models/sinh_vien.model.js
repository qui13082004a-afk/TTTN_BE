const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.js");// ver1.1

const SinhVien = sequelize.define("sinh_vien", {
  id_sinh_vien: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  mssv: { type: DataTypes.STRING(50), unique: true },
  ma_lop: { type: DataTypes.STRING(50) },
  ho_ten: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  mat_khau: { type: DataTypes.STRING(255), allowNull: false },
  sdt: { type: DataTypes.STRING(20) },
  avatar: { type: DataTypes.STRING(500) },
  khoa: { type: DataTypes.STRING(255) },
  ngay_sinh: { type: DataTypes.DATEONLY },
  gioi_tinh: { type: DataTypes.ENUM("nam", "nu", "khac") },
  trang_thai: {
    type: DataTypes.ENUM("active", "inactive", "locked"),
    allowNull: false,
    defaultValue: "active",
  },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: "sinh_vien", timestamps: false });

module.exports = SinhVien;
