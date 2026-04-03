const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.js");

const TinNhan = sequelize.define("tin_nhan", {
  id_tin_nhan: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  id_nhom: { type: DataTypes.INTEGER },
  id_sinh_vien: { type: DataTypes.INTEGER },
  noi_dung: { type: DataTypes.TEXT },
  da_thu_hoi: { type: DataTypes.BOOLEAN, defaultValue: false },
  thoi_gian_gui: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: "tin_nhan", timestamps: false });

module.exports = TinNhan;