const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database.js");

const GiangVien = sequelize.define("giang_vien", {
  id_giang_vien: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primary_key: true,
    allowNull: false,
  },
  ho_ten: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  mat_khau: { type: DataTypes.STRING(255), allowNull: false },
}, { tableName: "giang_vien", timestamps: false });

module.exports = GiangVien;