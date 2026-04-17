const { sequelize } = require("../../config/database");
const { DataTypes } = require("sequelize");

const ThanhVienNhom = sequelize.define("thanh_vien_nhom", {
  id_nhom: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  id_sinh_vien: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  vai_tro_noi_bo: {
    type: DataTypes.STRING
  },
  ngay_gia_nhap: {
    type: DataTypes.DATE
  }
}, {
  tableName: "thanh_vien_nhom",
  timestamps: false
});

module.exports = ThanhVienNhom;