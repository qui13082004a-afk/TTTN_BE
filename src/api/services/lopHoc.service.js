const { Op } = require("sequelize");
const XLSX = require("xlsx");
const lopHocRepo = require("../repositories/lopHoc.repository");
const sinhVienRepo = require("../repositories/sinhVien.repository");
const {
  GiangVien,
  LopHoc,
  SinhVien,
  SinhVienLopHoc,
  NhomHoc,
  ThanhVienNhom,
  CongViec,
  TinNhan,
  sequelize,
} = require("../models");

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

    return await this.buildClassCardData(lopHoc);
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
          through: { attributes: [] },
        },
      ],
    });

    if (!lopHoc || lopHoc.is_deleted) {
      throw new Error("Lop hoc khong ton tai");
    }

    this.ensureLecturerOwnsClass(lopHoc, actor);

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

  async getGroupsByClassId(id_lop, actor) {
    const lopHoc = await this.getOwnedClass(id_lop, actor);

    const groups = await NhomHoc.findAll({
      where: { id_lop: lopHoc.id_lop },
      include: [
        {
          model: SinhVien,
          attributes: ["id_sinh_vien", "mssv", "ho_ten", "email"],
          through: {
            attributes: ["vai_tro_noi_bo", "ngay_gia_nhap"],
          },
        },
      ],
      order: [["id_nhom", "ASC"]],
    });

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
      },
      groups: groups.map((group) => ({
        ...group.toJSON(),
        sinh_viens: Array.isArray(group.sinh_viens)
          ? [...group.sinh_viens].sort((a, b) =>
            String(a.ho_ten || "").localeCompare(String(b.ho_ten || ""), "vi")
          )
          : [],
        so_thanh_vien: Array.isArray(group.sinh_viens) ? group.sinh_viens.length : 0,
      })),
    };
  }

  async getUngroupedStudentsByClassId(id_lop, actor) {
    const lopHoc = await this.getOwnedClass(id_lop, actor);
    const students = await this.findUngroupedStudentsByClassId(lopHoc.id_lop);

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
      },
      count: students.length,
      students,
    };
  }

  async autoGroupStudents(id_lop, actor) {
    const lopHoc = await this.getOwnedClass(id_lop, actor);
    const now = new Date();

    if (!lopHoc.han_chot_dang_ky || new Date(lopHoc.han_chot_dang_ky) > now) {
      throw new Error("Lop hoc chua qua han dang ky nen khong the phan nhom tu dong");
    }

    if (lopHoc.trang_thai !== "dang_mo") {
      throw new Error("Chi co the phan nhom tu dong voi lop dang mo");
    }

    const ungroupedStudents = await this.findUngroupedStudentsByClassId(lopHoc.id_lop);
    if (ungroupedStudents.length === 0) {
      throw new Error("Tat ca sinh vien trong lop da co nhom");
    }

    const result = await sequelize.transaction(async (transaction) => {
      const groupedStudents = [];
      let createdGroups = 0;
      let groups = await this.loadGroupsWithCounts(lopHoc.id_lop, transaction);

      for (const student of ungroupedStudents) {
        let targetGroup = groups.find((group) => group.memberCount < group.so_luong_toi_da);

        if (!targetGroup) {
          const nextIndex = groups.length + 1;
          const newGroup = await NhomHoc.create({
            id_lop: lopHoc.id_lop,
            ma_nhom: this.generateGroupCode(lopHoc, nextIndex),
            ten_nhom: `Nhom ${nextIndex}`,
            trang_thai: "tu_dong",
            so_luong_toi_da: this.getGroupCapacity(lopHoc, groups),
          }, { transaction });

          targetGroup = {
            id_nhom: newGroup.id_nhom,
            ma_nhom: newGroup.ma_nhom,
            ten_nhom: newGroup.ten_nhom,
            so_luong_toi_da: newGroup.so_luong_toi_da || 5,
            memberCount: 0,
          };

          groups.push(targetGroup);
          groups.sort((a, b) => {
            if (a.memberCount !== b.memberCount) return a.memberCount - b.memberCount;
            return a.id_nhom - b.id_nhom;
          });
          createdGroups++;
        }

        await ThanhVienNhom.findOrCreate({
          where: {
            id_nhom: targetGroup.id_nhom,
            id_sinh_vien: student.id_sinh_vien,
          },
          defaults: {
            id_nhom: targetGroup.id_nhom,
            id_sinh_vien: student.id_sinh_vien,
            vai_tro_noi_bo: "thanh_vien",
            ngay_gia_nhap: now,
          },
          transaction,
        });

        targetGroup.memberCount += 1;
        groupedStudents.push({
          id_sinh_vien: student.id_sinh_vien,
          mssv: student.mssv,
          ho_ten: student.ho_ten,
          email: student.email,
          id_nhom: targetGroup.id_nhom,
          ten_nhom: targetGroup.ten_nhom,
        });

        groups.sort((a, b) => {
          if (a.memberCount !== b.memberCount) return a.memberCount - b.memberCount;
          return a.id_nhom - b.id_nhom;
        });
      }

      await lopHoc.update({ trang_thai: "da_chot" }, { transaction });

      return { groupedStudents, createdGroups };
    });

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
        trang_thai: "da_chot",
      },
      grouped_count: result.groupedStudents.length,
      created_group_count: result.createdGroups,
      grouped_students: result.groupedStudents,
    };
  }

  async getClassesByLecturer(id_giang_vien) {
    const classes = await lopHocRepo.findByLecturerId(id_giang_vien);
    return await Promise.all(classes.map((lopHoc) => this.buildClassCardData(lopHoc)));
  }

  async getAllClasses() {
    const classes = await lopHocRepo.findAll();
    return await Promise.all(classes.map((lopHoc) => this.buildClassCardData(lopHoc)));
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

  async getDeleteCheck(id, actor) {
    const lopHoc = await this.getOwnedClass(id, actor);
    const stats = await this.getClassActivityStats(lopHoc.id_lop);
    const canHardDelete = stats.student_count === 0
      && stats.group_count === 0
      && stats.task_count === 0
      && stats.message_count === 0;

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
      },
      can_hard_delete: canHardDelete,
      can_soft_delete: !canHardDelete,
      action_if_confirmed: canHardDelete ? "hard_delete" : "soft_delete",
      reason: canHardDelete
        ? "Lop chua co sinh vien va du lieu hoat dong, co the xoa vinh vien"
        : "Khong the xoa vinh vien lop da co du lieu hoat dong, chi nen an lop",
      stats,
    };
  }

  async hideClass(id, actor) {
    const lopHoc = await this.getOwnedClass(id, actor);
    const updated = await lopHoc.update({
      is_deleted: true,
      trang_thai: "da_an",
    });

    return {
      id_lop: updated.id_lop,
      ma_lop: updated.ma_lop,
      ten_lop: updated.ten_lop,
      is_deleted: updated.is_deleted,
      trang_thai: updated.trang_thai,
    };
  }

  async deleteClass(id, actor) {
    const check = await this.getDeleteCheck(id, actor);
    if (!check.can_hard_delete) {
      throw new Error("Khong the xoa lop da co du lieu hoat dong");
    }

    const deleted = await lopHocRepo.delete(id);
    if (!deleted) {
      throw new Error("Xoa lop hoc that bai");
    }

    return deleted;
  }

  async searchClasses(keyword) {
    if (!keyword || keyword.trim() === "") {
      throw new Error("Tu khoa tim kiem khong duoc de trong");
    }

    const classes = await lopHocRepo.findByKeyword(keyword.trim());
    return await Promise.all(classes.map((lopHoc) => this.buildClassCardData(lopHoc)));
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
    const filtered = classes.filter((lopHoc) => lecturerIds.includes(lopHoc.id_giang_vien));
    return await Promise.all(filtered.map((lopHoc) => this.buildClassCardData(lopHoc)));
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
    if (!lopHoc || lopHoc.is_deleted) {
      throw new Error("Lop hoc khong ton tai");
    }

    this.ensureLecturerOwnsClass(lopHoc, actor);

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
    if (!lopHoc || lopHoc.is_deleted) {
      throw new Error("Lop hoc khong ton tai");
    }

    this.ensureLecturerOwnsClass(lopHoc, actor);

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

  async getOwnedClass(id_lop, actor) {
    const lopHoc = await LopHoc.findByPk(id_lop);
    if (!lopHoc || lopHoc.is_deleted) {
      throw new Error("Lop hoc khong ton tai");
    }

    this.ensureLecturerOwnsClass(lopHoc, actor);
    return lopHoc;
  }

  ensureLecturerOwnsClass(lopHoc, actor) {
    if (
      actor?.role !== "admin" &&
      actor?.id_giang_vien &&
      Number(lopHoc.id_giang_vien) !== Number(actor.id_giang_vien)
    ) {
      throw new Error("Ban khong co quyen thao tac voi lop hoc nay");
    }
  }

  async findUngroupedStudentsByClassId(id_lop) {
    const enrolledStudents = await SinhVien.findAll({
      attributes: ["id_sinh_vien", "mssv", "ho_ten", "email", "trang_thai"],
      include: [
        {
          model: LopHoc,
          where: { id_lop },
          attributes: [],
          through: {
            where: { trang_thai: "dang_hoc" },
            attributes: [],
          },
        },
      ],
      order: [["ho_ten", "ASC"]],
    });

    if (enrolledStudents.length === 0) {
      return [];
    }

    const groups = await NhomHoc.findAll({
      where: { id_lop },
      attributes: ["id_nhom"],
    });

    if (groups.length === 0) {
      return enrolledStudents.map((student) => student.toJSON());
    }

    const memberRows = await ThanhVienNhom.findAll({
      where: {
        id_nhom: groups.map((group) => group.id_nhom),
      },
      attributes: ["id_sinh_vien"],
    });

    const groupedStudentIds = new Set(memberRows.map((member) => Number(member.id_sinh_vien)));

    return enrolledStudents
      .filter((student) => !groupedStudentIds.has(Number(student.id_sinh_vien)))
      .map((student) => student.toJSON());
  }

  async loadGroupsWithCounts(id_lop, transaction) {
    const groups = await NhomHoc.findAll({
      where: { id_lop },
      include: [
        {
          model: SinhVien,
          attributes: ["id_sinh_vien"],
          through: { attributes: [] },
          required: false,
        },
      ],
      order: [["id_nhom", "ASC"]],
      transaction,
    });

    return groups.map((group) => ({
      id_nhom: group.id_nhom,
      ma_nhom: group.ma_nhom,
      ten_nhom: group.ten_nhom,
      so_luong_toi_da: Number(group.so_luong_toi_da || 5),
      memberCount: Array.isArray(group.sinh_viens) ? group.sinh_viens.length : 0,
    })).sort((a, b) => {
      if (a.memberCount !== b.memberCount) return a.memberCount - b.memberCount;
      return a.id_nhom - b.id_nhom;
    });
  }

  getGroupCapacity(lopHoc, groups) {
    const existingCapacity = groups.find((group) => Number(group.so_luong_toi_da || 0) > 0);
    if (existingCapacity) {
      return Number(existingCapacity.so_luong_toi_da);
    }

    return Number(lopHoc.si_so_toi_da || 5);
  }

  generateGroupCode(lopHoc, nextIndex) {
    const suffix = String(nextIndex).padStart(2, "0");
    return lopHoc.ma_lop ? `${lopHoc.ma_lop}-N${suffix}` : `LOP${lopHoc.id_lop}-N${suffix}`;
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

  async buildClassCardData(lopHoc) {
    const stats = await this.getClassActivityStats(lopHoc.id_lop);
    const displayStatus = this.getDisplayStatus(lopHoc);

    return {
      ...lopHoc.toJSON(),
      ma_mon_hoc: lopHoc.id_mon_hoc ? String(lopHoc.id_mon_hoc) : null,
      ten_mon_hoc: lopHoc.mo_ta || null,
      so_sinh_vien: stats.student_count,
      so_nhom: stats.group_count,
      trang_thai_hien_thi: displayStatus.code,
      nhan_trang_thai: displayStatus.label,
    };
  }

  getDisplayStatus(lopHoc) {
    const now = new Date();
    const isExpired = lopHoc.han_chot_dang_ky && new Date(lopHoc.han_chot_dang_ky) < now;

    if (
      lopHoc.trang_thai === "het_han" ||
      lopHoc.trang_thai === "da_chot" ||
      lopHoc.trang_thai === "da_an" ||
      isExpired
    ) {
      return {
        code: "het_han",
        label: "Het han",
      };
    }

    return {
      code: "dang_mo",
      label: "Dang mo",
    };
  }

  async getClassActivityStats(id_lop) {
    const studentCount = await SinhVienLopHoc.count({
      where: { id_lop },
    });

    const groups = await NhomHoc.findAll({
      where: { id_lop },
      attributes: ["id_nhom"],
    });

    const groupIds = groups.map((group) => group.id_nhom);
    const groupCount = groupIds.length;

    let taskCount = 0;
    let messageCount = 0;

    if (groupIds.length > 0) {
      taskCount = await CongViec.count({
        where: { id_nhom: groupIds },
      });

      messageCount = await TinNhan.count({
        where: { id_nhom: groupIds },
      });
    }

    return {
      student_count: studentCount,
      group_count: groupCount,
      task_count: taskCount,
      message_count: messageCount,
    };
  }
}

module.exports = new LopHocService();
