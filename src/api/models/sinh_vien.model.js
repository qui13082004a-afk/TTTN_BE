const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.js");// ver1.1

const SinhVien = sequelize.define("sinh_vien", {
  id_sinh_vien: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  ho_ten: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  mat_khau: { type: DataTypes.STRING(255), allowNull: false },
}, { tableName: "sinh_vien", timestamps: false });

module.exports = SinhVien;