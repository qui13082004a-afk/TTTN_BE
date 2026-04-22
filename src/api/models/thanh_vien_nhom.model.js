const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.js");

const ThanhVienNhom = sequelize.define("thanh_vien_nhom", {
  id_nhom: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  id_sinh_vien: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  vai_tro_noi_bo: { type: DataTypes.STRING(100) },
  ngay_gia_nhap: { type: DataTypes.DATE },
}, {
  tableName: "thanh_vien_nhom",
  timestamps: false,
});

module.exports = ThanhVienNhom;