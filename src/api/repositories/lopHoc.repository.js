const { Op, Sequelize } = require("sequelize");
const { LopHoc } = require("../models");

class LopHocRepository {
  async create(data) {
    return await LopHoc.create(data);
  }

  async findById(id) {
    return await LopHoc.findOne({ where: { id_lop: id } });
  }

  async findByLecturerId(id_giang_vien) {
    return await LopHoc.findAll({
      where: {
        id_giang_vien,
        is_deleted: false,
      },
      order: [["updated_at", "DESC"], ["id_lop", "DESC"]],
    });
  }

  async findAll() {
    return await LopHoc.findAll({
      where: { is_deleted: false },
      order: [["updated_at", "DESC"], ["id_lop", "DESC"]],
    });
  }

  async findByKeyword(keyword) {
    return await LopHoc.findAll({
      where: {
        is_deleted: false,
        [Op.or]: [
          {
            ten_lop: {
              [Op.like]: `%${keyword}%`,
            },
          },
          Sequelize.where(
            Sequelize.cast(Sequelize.col("id_mon_hoc"), "char"),
            {
              [Op.like]: `%${keyword}%`,
            }
          ),
        ],
      },
      order: [["updated_at", "DESC"], ["id_lop", "DESC"]],
    });
  }

  async update(id, data) {
    const lopHoc = await LopHoc.findByPk(id);
    if (!lopHoc) {
      return null;
    }

    return await lopHoc.update(data);
  }

  async delete(id) {
    return await LopHoc.destroy({ where: { id_lop: id } });
  }
}

module.exports = new LopHocRepository();
