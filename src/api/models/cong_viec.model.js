const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database.js");

const CongViec = sequelize.define("cong_viec", {
  id_cong_viec: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  id_nhom: { type: DataTypes.INTEGER },
  id_sinh_vien: { type: DataTypes.INTEGER },
  ten_cong_viec: { type: DataTypes.STRING(255), allowNull: false },
  han_chot: { type: DataTypes.DATE },
  trang_thai: { type: DataTypes.STRING(50) },
}, { tableName: "cong_viec", timestamps: false });

module.exports = CongViec;