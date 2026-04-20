const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.js");

const LopHoc = sequelize.define("lop_hoc", {
  id_lop: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  ma_lop: { type: DataTypes.STRING(50), unique: true },
  id_giang_vien: { type: DataTypes.INTEGER },
  id_mon_hoc: { type: DataTypes.INTEGER },
  hoc_ky: { type: DataTypes.TEXT },
  ten_lop: { type: DataTypes.STRING(100), allowNull: false },
  si_so_toi_da: { type: DataTypes.INTEGER },
  so_nhom_toi_da: { type: DataTypes.INTEGER, defaultValue: 1 },
  han_chot_dang_ky: { type: DataTypes.DATE },
  trang_thai: {
    type: DataTypes.ENUM("dang_mo", "het_han", "da_chot", "da_an"),
    allowNull: false,
    defaultValue: "dang_mo",
  },
  mo_ta: { type: DataTypes.TEXT },
  is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: "lop_hoc", timestamps: false });

module.exports = LopHoc;
