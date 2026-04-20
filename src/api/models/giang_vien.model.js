const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.js");

const GiangVien = sequelize.define("giang_vien", {
  id_giang_vien: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  ma_giang_vien: { type: DataTypes.STRING(50), unique: true },
  ho_ten: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  mat_khau: { type: DataTypes.STRING(255), allowNull: false },
  sdt: { type: DataTypes.STRING(20) },
  avatar_url: { type: DataTypes.STRING(500) },
  khoa: { type: DataTypes.STRING(255) },
  hoc_ham: { type: DataTypes.STRING(100) },
  hoc_vi: { type: DataTypes.STRING(100) },
  trang_thai: {
    type: DataTypes.ENUM("active", "inactive", "locked"),
    allowNull: false,
    defaultValue: "active",
  },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: "giang_vien", timestamps: false });

module.exports = GiangVien;
