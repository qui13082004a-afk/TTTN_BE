const { LopHoc } = require("../models");
const { Op } = require("sequelize");

class LopHocRepository {
  async create(data) {
    return await LopHoc.create(data);
  }

  async findById(id) {
    return await LopHoc.findByPk(id);
  }

  async findByLecturerId(id_giang_vien) {
    return await LopHoc.findAll({ where: { id_giang_vien } });
  }

  async findAll() {
    return await LopHoc.findAll();
  }

  async findByClassName(ten_lop) {
    return await LopHoc.findAll({
      where: {
        ten_lop: {
          [Op.like]: `%${ten_lop}%`
        }
      }
    });
  }

  async update(id, data) {
    const lopHoc = await LopHoc.findByPk(id);
    if (!lopHoc) return null;
    return await lopHoc.update(data);
  }

  async delete(id) {
    return await LopHoc.destroy({ where: { id_lop: id } });
  }
}

module.exports = new LopHocRepository();