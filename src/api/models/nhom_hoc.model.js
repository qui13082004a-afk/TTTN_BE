const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.js");

const NhomHoc = sequelize.define("nhom_hoc", {
  id_nhom: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  ma_nhom: { type: DataTypes.STRING(100) },
  id_lop: { type: DataTypes.INTEGER },
  id_nhom_truong: { type: DataTypes.INTEGER },
  ten_nhom: { type: DataTypes.STRING(100) },
  trang_thai: { type: DataTypes.STRING(100) },
  so_luong_toi_da: { type: DataTypes.INTEGER, defaultValue: 5 },
}, { tableName: "nhom_hoc", timestamps: false });

module.exports = NhomHoc;
