const { SinhVien } = require("../models");

class SinhVienRepository {
  async findByEmail(email) {
    return await SinhVien.findOne({
      where: { email }
    });
  }

  async create(data) {
    return await SinhVien.create(data);
  }
}

module.exports = new SinhVienRepository();