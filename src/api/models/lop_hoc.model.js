const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database.js");

const LopHoc = sequelize.define("lop_hoc", {
  id_lop: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  id_giang_vien: { type: DataTypes.INTEGER },
  ten_lop: { type: DataTypes.STRING(100), allowNull: false },
  han_chot_dang_ky_nhom: { type: DataTypes.DATE },
}, { tableName: "lop_hoc", timestamps: false });

module.exports = LopHoc;