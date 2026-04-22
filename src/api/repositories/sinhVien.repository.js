const { Op } = require("sequelize");
const { SinhVien } = require("../models");

class SinhVienRepository {
  async findByEmail(email) {
    return await SinhVien.findOne({
      where: { email }
    });
  }

  async findByMssv(mssv) {
    return await SinhVien.findOne({ where: { mssv } });
  }

  async findExistingAccount({ email, mssv }) {
    const conditions = [];

    if (email) {
      conditions.push({ email });
    }

    if (mssv) {
      conditions.push({ mssv });
    }

    if (conditions.length === 0) {
      return null;
    }

    return await SinhVien.findOne({
      where: {
        [Op.or]: conditions,
      },
    });
  }

  async create(data) {
    return await SinhVien.create(data);
  }
}

module.exports = new SinhVienRepository();
