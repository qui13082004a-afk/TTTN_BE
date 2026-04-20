const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.js");

const YeuCauChuyenNhom = sequelize.define("yeu_cau_chuyen_nhom", {
  id_yeu_cau: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  id_sinh_vien: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_nhom_cu: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_nhom_moi: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ly_do: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  trang_thai: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "dang_cho_duyet",
  },
}, {
  tableName: "yeu_cau_chuyen_nhom",
  timestamps: false,
});

module.exports = YeuCauChuyenNhom;
