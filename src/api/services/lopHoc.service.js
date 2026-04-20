const lopHocRepo = require("../repositories/lopHoc.repository");
const sinhVienRepo = require("../repositories/sinhVien.repository");
const { GiangVien, LopHoc, SinhVien, SinhVienLopHoc } = require("../models");
const { Op } = require("sequelize");
const XLSX = require("xlsx");

class LopHocService {
  async createClass(data) {
    const {
      id_giang_vien,
      ten_lop,
      ma_lop,
      id_mon_hoc,
      hoc_ky,
      si_so_toi_da,
      so_nhom_toi_da,
      mo_ta,
      han_chot_dang_ky,
      han_chot_dang_ky_nhom,
      actor,
    } = data;

    const lecturerId = actor?.role === "admin"
      ? Number(id_giang_vien || actor.id_giang_vien)
      : Number(actor?.id_giang_vien);

    if (!lecturerId) {
      throw new Error("ID giang vien khong duoc de trong");
    }

    if (!ten_lop) {
      throw new Error("Ten lop khong duoc de trong");
    }

    const lecturer = await GiangVien.findByPk(lecturerId);
    if (!lecturer) {
      throw new Error(`Giang vien co ID ${lecturerId} khong ton tai`);
    }

    return await lopHocRepo.create({
      id_giang_vien: lecturerId,
      ma_lop: ma_lop?.trim() || null,
      id_mon_hoc: id_mon_hoc || null,
      hoc_ky: hoc_ky?.trim() || null,
      ten_lop: ten_lop.trim(),
      si_so_toi_da: si_so_toi_da || null,
      so_nhom_toi_da: so_nhom_toi_da || 1,
      mo_ta: mo_ta?.trim() || null,
      han_chot_dang_ky: han_chot_dang_ky || han_chot_dang_ky_nhom || null,
    });
  }

  async getClassById(id) {
    const lopHoc = await lopHocRepo.findById(id);
    if (!lopHoc) {
      throw new Error("Lop hoc khong ton tai");
    }

    return lopHoc;
  }

  async getStudentsByClassId(id_lop, actor) {
    if (!id_lop) {
      throw new Error("ID lop khong duoc de trong");
    }

    const lopHoc = await LopHoc.findByPk(id_lop, {
      include: [
        {
          model: SinhVien,
          attributes: ["id_sinh_vien", "mssv", "ho_ten", "email", "trang_thai"],
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!lopHoc) {
      throw new Error("Lop hoc khong ton tai");
    }

    if (
      actor?.role !== "admin" &&
      actor?.id_giang_vien &&
      Number(lopHoc.id_giang_vien) !== Number(actor.id_giang_vien)
    ) {
      throw new Error("Ban khong co quyen xem danh sach sinh vien cua lop hoc nay");
    }

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
        id_giang_vien: lopHoc.id_giang_vien,
        han_chot_dang_ky: lopHoc.han_chot_dang_ky,
      },
      students: (lopHoc.sinh_viens || []).sort((a, b) =>
        String(a.ho_ten || "").localeCompare(String(b.ho_ten || ""), "vi")
      ),
    };
  }

  async getClassesByLecturer(id_giang_vien) {
    return await lopHocRepo.findByLecturerId(id_giang_vien);
  }

  async getAllClasses() {
    return await lopHocRepo.findAll();
  }

  async updateClass(id, data) {
    const payload = {
      ...data,
      han_chot_dang_ky: data.han_chot_dang_ky || data.han_chot_dang_ky_nhom || null,
    };

    delete payload.han_chot_dang_ky_nhom;

    const updated = await lopHocRepo.update(id, payload);
    if (!updated) {
      throw new Error("Cap nhat lop hoc that bai");
    }

    return updated;
  }

  async deleteClass(id) {
    const deleted = await lopHocRepo.delete(id);
    if (!deleted) {
      throw new Error("Xoa lop hoc that bai");
    }

    return deleted;
  }

  async searchByClassName(ten_lop) {
    if (!ten_lop || ten_lop.trim() === "") {
      throw new Error("Ten lop khong duoc de trong");
    }

    return await lopHocRepo.findByClassName(ten_lop.trim());
  }

  async searchByLecturerName(ten_giang_vien) {
    if (!ten_giang_vien || ten_giang_vien.trim() === "") {
      throw new Error("Ten giang vien khong duoc de trong");
    }

    const lecturers = await GiangVien.findAll({
      where: {
        ho_ten: {
          [Op.like]: `%${ten_giang_vien.trim()}%`,
        },
      },
    });

    if (lecturers.length === 0) {
      return [];
    }

    const lecturerIds = lecturers.map((lecturer) => lecturer.id_giang_vien);
    const classes = await lopHocRepo.findAll();
    return classes.filter((lopHoc) => lecturerIds.includes(lopHoc.id_giang_vien));
  }

  async addStudentToClassByEmail({ id_lop, email, actor }) {
    if (!id_lop) {
      throw new Error("ID lop khong duoc de trong");
    }

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error("Email sinh vien khong duoc de trong");
    }

    const lopHoc = await LopHoc.findByPk(id_lop);
    if (!lopHoc) {
      throw new Error("Lop hoc khong ton tai");
    }

    if (
      actor?.role !== "admin" &&
      actor?.id_giang_vien &&
      Number(lopHoc.id_giang_vien) !== Number(actor.id_giang_vien)
    ) {
      throw new Error("Ban khong co quyen them sinh vien vao lop hoc nay");
    }

    const student = await sinhVienRepo.findByEmail(normalizedEmail);
    if (!student) {
      throw new Error("Email co trong danh sach nhung sinh vien chua co tai khoan. Vui long tao tai khoan cho sinh vien truoc.");
    }

    const [enrollment, created] = await SinhVienLopHoc.findOrCreate({
      where: {
        id_sinh_vien: student.id_sinh_vien,
        id_lop: lopHoc.id_lop,
      },
      defaults: {
        id_sinh_vien: student.id_sinh_vien,
        id_lop: lopHoc.id_lop,
      },
    });

    return {
      enrollment,
      created,
      student: {
        id_sinh_vien: student.id_sinh_vien,
        mssv: student.mssv,
        ho_ten: student.ho_ten,
        email: student.email,
      },
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
      },
    };
  }

  async importStudentsToClassFromFile({ id_lop, filePath, actor }) {
    if (!id_lop) {
      throw new Error("ID lop khong duoc de trong");
    }

    const lopHoc = await LopHoc.findByPk(id_lop);
    if (!lopHoc) {
      throw new Error("Lop hoc khong ton tai");
    }

    if (
      actor?.role !== "admin" &&
      actor?.id_giang_vien &&
      Number(lopHoc.id_giang_vien) !== Number(actor.id_giang_vien)
    ) {
      throw new Error("Ban khong co quyen them sinh vien vao lop hoc nay");
    }

    const workbook = XLSX.readFile(filePath, { raw: false });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
    });

    if (data.length === 0) {
      throw new Error("File danh sach sinh vien dang rong");
    }

    let inserted = 0;
    const warnings = [];

    for (const [index, row] of data.entries()) {
      const lineNumber = index + 2;
      const email = this.extractEmailFromRow(row);

      if (!email) {
        warnings.push(`Dong ${lineNumber} chua co email`);
        continue;
      }

      const student = await sinhVienRepo.findByEmail(email);
      if (!student) {
        warnings.push(`Dong ${lineNumber} co email ${email} nhung sinh vien chua co tai khoan trong he thong. Vui long giang vien tao tai khoan cho sinh vien truoc.`);
        continue;
      }

      const [, created] = await SinhVienLopHoc.findOrCreate({
        where: {
          id_sinh_vien: student.id_sinh_vien,
          id_lop: lopHoc.id_lop,
        },
        defaults: {
          id_sinh_vien: student.id_sinh_vien,
          id_lop: lopHoc.id_lop,
        },
      });

      if (!created) {
        warnings.push(`Dong ${lineNumber} voi email ${email} da co trong lop`);
        continue;
      }

      inserted++;
    }

    return {
      inserted,
      warnings,
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
      },
    };
  }

  extractEmailFromRow(row) {
    for (const [key, value] of Object.entries(row)) {
      if (this.normalizeHeader(key) === "email") {
        return String(value || "").trim().toLowerCase();
      }
    }

    return "";
  }

  normalizeHeader(header) {
    return String(header || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }
}

module.exports = new LopHocService();
