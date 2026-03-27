const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database.js");

const NhatKy = sequelize.define("nhat_ky_tien_do", {
  id_nhat_ky: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  id_cong_viec: { type: DataTypes.INTEGER },
  tien_do_moi: { type: DataTypes.INTEGER },
  ghi_chu: { type: DataTypes.TEXT },
  trang_thai: { type: DataTypes.STRING(50) },
}, { tableName: "nhat_ky_tien_do", timestamps: false });

module.exports = NhatKy;