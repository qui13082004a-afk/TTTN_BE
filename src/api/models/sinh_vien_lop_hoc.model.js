const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.js");

const SinhVienLopHoc = sequelize.define("sinh_vien_lop_hoc", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  id_sinh_vien: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_lop: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "sinh_vien_lop_hoc",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["id_sinh_vien", "id_lop"],
    },
  ],
});

module.exports = SinhVienLopHoc;
