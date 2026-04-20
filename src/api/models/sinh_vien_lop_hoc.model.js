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
  trang_thai: {
    type: DataTypes.ENUM("dang_hoc", "ngung_hoc"),
    allowNull: false,
    defaultValue: "dang_hoc",
  },
  ngay_them: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  ghi_chu: { type: DataTypes.TEXT },
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
