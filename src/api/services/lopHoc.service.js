const { Op } = require("sequelize");
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
  async syncExpiredClassStatuses(filters = {}) {
    await lopHocRepo.markExpiredClasses(filters);
  }

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

    const normalizedClassName = String(ten_lop || "").trim();
    const normalizedSemester = String(hoc_ky || "").trim();
    const normalizedClassCode = String(ma_lop || "").trim();
    const classSize = Number(si_so_toi_da);
    const groupCount = Number(so_nhom_toi_da);
    const registrationDeadline = han_chot_dang_ky || han_chot_dang_ky_nhom;

    if (!normalizedClassName) {
      throw new Error("Ten lop khong duoc de trong");
    }

    if (normalizedClassName.length < 5 || normalizedClassName.length > 100) {
      throw new Error("Ten lop phai tu 5 den 100 ky tu");
    }

    if (!normalizedSemester) {
      throw new Error("Hoc ky khong duoc de trong");
    }

    if (!Number.isInteger(classSize) || classSize <= 0) {
      throw new Error("So sinh vien phai la so nguyen lon hon 0");
    }

    if (!Number.isInteger(groupCount) || groupCount <= 0) {
      throw new Error("So nhom phai la so nguyen lon hon 0");
    }

    if (groupCount > classSize) {
      throw new Error("So nhom khong duoc lon hon so sinh vien");
    }

    if (!registrationDeadline) {
      throw new Error("Han dang ky khong duoc de trong");
    }

    const parsedDeadline = new Date(registrationDeadline);
    if (Number.isNaN(parsedDeadline.getTime())) {
      throw new Error("Han dang ky khong hop le");
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (parsedDeadline < startOfToday) {
      throw new Error("Han dang ky phai lon hon hoac bang ngay hien tai");
    }

    const lecturer = await GiangVien.findByPk(lecturerId);
    if (!lecturer) {
      throw new Error(`Giang vien co ID ${lecturerId} khong ton tai`);
    }

    const duplicatedClass = await LopHoc.findOne({
      where: {
        id_giang_vien: lecturerId,
        hoc_ky: normalizedSemester,
        ten_lop: normalizedClassName,
        is_deleted: false,
      },
    });

    if (duplicatedClass) {
      throw new Error("Lop hoc nay da ton tai trong hoc ky");
    }

    return await lopHocRepo.create({
      id_giang_vien: lecturerId,
      ma_lop: normalizedClassCode || null,
      id_mon_hoc: id_mon_hoc || null,
      hoc_ky: normalizedSemester,
      ten_lop: normalizedClassName,
      si_so_toi_da: classSize,
      so_nhom_toi_da: groupCount,
      mo_ta: mo_ta?.trim() || null,
      han_chot_dang_ky: parsedDeadline,
      trang_thai: "dang_mo",
    });
  }

  async getClassById(id) {
    await this.syncExpiredClassStatuses({ id_lop: id });
    const lopHoc = await lopHocRepo.findById(id);
    if (!lopHoc) {
      throw new Error("Lop hoc khong ton tai");
    }

    return await this.buildClassCardData(lopHoc);
  }

  async getStudentsByClassId(id_lop, actor, keyword) {
    if (!id_lop) {
      throw new Error("ID lop khong duoc de trong");
    }

    const lopHoc = await LopHoc.findByPk(id_lop, {
      include: [
        {
          model: SinhVien,
          attributes: ["id_sinh_vien", "mssv", "ma_lop", "ho_ten", "email", "trang_thai"],
          through: { attributes: [] },
        },
      ],
    });

    if (!lopHoc || lopHoc.is_deleted) {
      throw new Error("Lop hoc khong ton tai");
    }

    this.ensureLecturerOwnsClass(lopHoc, actor);

    const groups = await NhomHoc.findAll({
      where: { id_lop: lopHoc.id_lop },
      attributes: ["id_nhom", "ma_nhom", "ten_nhom"],
    });

    const groupIds = groups.map((group) => group.id_nhom);
    const members = groupIds.length > 0
      ? await ThanhVienNhom.findAll({
        where: { id_nhom: groupIds },
        attributes: ["id_nhom", "id_sinh_vien"],
      })
      : [];

    const groupMap = new Map(groups.map((group) => [Number(group.id_nhom), group]));
    const studentGroupMap = new Map();

    for (const member of members) {
      studentGroupMap.set(Number(member.id_sinh_vien), Number(member.id_nhom));
    }

    const normalizedKeyword = String(keyword || "").trim().toLowerCase();
    const filteredStudents = (lopHoc.sinh_viens || []).filter((student) => {
      if (!normalizedKeyword) {
        return true;
      }

      const mssv = String(student.mssv || "").toLowerCase();
      const hoTen = String(student.ho_ten || "").toLowerCase();
      return mssv.includes(normalizedKeyword) || hoTen.includes(normalizedKeyword);
    });

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
        id_giang_vien: lopHoc.id_giang_vien,
        han_chot_dang_ky: lopHoc.han_chot_dang_ky,
      },
      keyword: normalizedKeyword || null,
      students: filteredStudents
        .map((student) => {
          const studentJson = student.toJSON();
          const groupId = studentGroupMap.get(Number(student.id_sinh_vien)) || null;
          const group = groupId ? groupMap.get(groupId) : null;

          return {
            ...studentJson,
            ma_lop: studentJson.ma_lop || lopHoc.ma_lop,
            group: group
              ? {
                id_nhom: group.id_nhom,
                ma_nhom: group.ma_nhom,
                ten_nhom: group.ten_nhom,
              }
              : null,
            is_grouped: Boolean(group),
            group_display: group?.ma_nhom || "Chua co",
          };
        })
        .sort((a, b) => String(a.ho_ten || "").localeCompare(String(b.ho_ten || ""), "vi")),
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

  async getGroupManagementSummary(id_lop, actor) {
    const lopHoc = await this.getOwnedClass(id_lop, actor);
    const totalStudents = await SinhVienLopHoc.count({
      where: {
        id_lop: lopHoc.id_lop,
        trang_thai: "dang_hoc",
      },
    });
    const ungroupedStudents = await this.findUngroupedStudentsByClassId(lopHoc.id_lop);
    const groupedStudents = Math.max(totalStudents - ungroupedStudents.length, 0);
    const now = new Date();
    const registrationDeadline = lopHoc.han_chot_dang_ky ? new Date(lopHoc.han_chot_dang_ky) : null;
    const isExpired = registrationDeadline ? registrationDeadline < now : false;

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
        hoc_ky: lopHoc.hoc_ky,
        han_chot_dang_ky: lopHoc.han_chot_dang_ky,
        trang_thai: lopHoc.trang_thai,
      },
      stats: {
        grouped_students: groupedStudents,
        total_students: totalStudents,
        ungrouped_students: ungroupedStudents.length,
      },
      registration_status: {
        is_expired: isExpired,
        label: isExpired ? "Da het han dang ky" : "Dang mo",
      },
      actions: {
        can_create_group: !isExpired,
        can_auto_group: isExpired && ungroupedStudents.length > 0,
      },
    };
  }

  async getAvailableGroupsByClassId(id_lop, actor) {
    const data = await this.getGroupsByClassId(id_lop, actor);
    const availableGroups = data.groups
      .map((group) => ({
        id_nhom: group.id_nhom,
        ma_nhom: group.ma_nhom,
        ten_nhom: group.ten_nhom,
        so_thanh_vien: Number(group.so_thanh_vien || 0),
        so_luong_toi_da: Number(group.so_luong_toi_da || 0),
      }))
      .filter((group) => group.so_thanh_vien < group.so_luong_toi_da)
      .sort((a, b) => {
        if (a.so_thanh_vien !== b.so_thanh_vien) {
          return a.so_thanh_vien - b.so_thanh_vien;
        }
        return a.id_nhom - b.id_nhom;
      });

    return {
      class: data.class,
      count: availableGroups.length,
      groups: availableGroups,
    };
  }

  async createGroupForClass(id_lop, actor, data = {}) {
    const lopHoc = await this.getOwnedClass(id_lop, actor);
    const now = new Date();
    if (lopHoc.han_chot_dang_ky && new Date(lopHoc.han_chot_dang_ky) < now) {
      throw new Error("Lop hoc da het han dang ky nen khong the tao nhom moi");
    }

    const existingGroups = await NhomHoc.findAll({
      where: { id_lop: lopHoc.id_lop },
      attributes: ["id_nhom", "ma_nhom", "ten_nhom", "so_luong_toi_da"],
      order: [["id_nhom", "ASC"]],
    });

    if (Number(lopHoc.so_nhom_toi_da || 0) > 0 && existingGroups.length >= Number(lopHoc.so_nhom_toi_da)) {
      throw new Error("Da dat toi da so nhom cho phep cua lop hoc");
    }

    const nextIndex = existingGroups.length + 1;
    const defaultCode = this.generateGroupCode(lopHoc, nextIndex);
    const groupName = String(data.ten_nhom || "").trim() || `Nhom ${nextIndex}`;
    const groupCode = String(data.ma_nhom || "").trim() || defaultCode;
    const maxMembers = Number(data.so_luong_toi_da || this.getDefaultGroupCapacity(lopHoc));

    if (!Number.isInteger(maxMembers) || maxMembers <= 0) {
      throw new Error("So luong toi da cua nhom phai la so nguyen lon hon 0");
    }

    const duplicatedCode = await NhomHoc.findOne({
      where: {
        id_lop: lopHoc.id_lop,
        ma_nhom: groupCode,
      },
    });

    if (duplicatedCode) {
      throw new Error("Ma nhom da ton tai trong lop hoc");
    }

    const group = await NhomHoc.create({
      id_lop: lopHoc.id_lop,
      ma_nhom: groupCode,
      ten_nhom: groupName,
      trang_thai: "thu_cong",
      so_luong_toi_da: maxMembers,
    });

    return {
      id_nhom: group.id_nhom,
      ma_nhom: group.ma_nhom,
      ten_nhom: group.ten_nhom,
      so_luong_toi_da: group.so_luong_toi_da,
      so_thanh_vien: 0,
    };
  }

  async assignStudentToGroup({ id_lop, id_nhom, id_sinh_vien, actor }) {
    if (!id_lop || !id_nhom || !id_sinh_vien) {
      throw new Error("ID lop, ID nhom va ID sinh vien la bat buoc");
    }

    const lopHoc = await this.getOwnedClass(id_lop, actor);
    const [group, enrollment] = await Promise.all([
      NhomHoc.findByPk(id_nhom),
      SinhVienLopHoc.findOne({
        where: {
          id_lop: lopHoc.id_lop,
          id_sinh_vien,
          trang_thai: "dang_hoc",
        },
      }),
    ]);

    if (!group || Number(group.id_lop) !== Number(lopHoc.id_lop)) {
      throw new Error("Nhom hoc khong thuoc lop nay");
    }

    if (!enrollment) {
      throw new Error("Sinh vien khong thuoc lop hoc nay");
    }

    const existingGroups = await NhomHoc.findAll({
      where: { id_lop: lopHoc.id_lop },
      attributes: ["id_nhom"],
    });

    const existingMembership = existingGroups.length > 0
      ? await ThanhVienNhom.findOne({
        where: {
          id_sinh_vien,
          id_nhom: existingGroups.map((item) => item.id_nhom),
        },
      })
      : null;

    if (existingMembership) {
      throw new Error("Sinh vien da co nhom trong lop hoc nay");
    }

    const currentMemberCount = await ThanhVienNhom.count({
      where: { id_nhom: group.id_nhom },
    });

    if (currentMemberCount >= Number(group.so_luong_toi_da || 0)) {
      throw new Error("Nhom da day, khong the them sinh vien moi");
    }

    await ThanhVienNhom.create({
      id_nhom: group.id_nhom,
      id_sinh_vien,
      vai_tro_noi_bo: "thanh_vien",
      ngay_gia_nhap: new Date(),
    });

    const updatedMemberCount = currentMemberCount + 1;
    const student = await SinhVien.findByPk(id_sinh_vien, {
      attributes: ["id_sinh_vien", "mssv", "ho_ten", "email"],
    });

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
      },
      group: {
        id_nhom: group.id_nhom,
        ma_nhom: group.ma_nhom,
        ten_nhom: group.ten_nhom,
        so_thanh_vien: updatedMemberCount,
        so_luong_toi_da: Number(group.so_luong_toi_da || 0),
      },
      student: student ? student.toJSON() : { id_sinh_vien },
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
    await this.syncExpiredClassStatuses({ id_giang_vien });
    const classes = await lopHocRepo.findByLecturerId(id_giang_vien);
    return await Promise.all(classes.map((lopHoc) => this.buildClassCardData(lopHoc)));
  }

  async getAllClasses() {
    await this.syncExpiredClassStatuses();
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

    await this.syncExpiredClassStatuses();
    const classes = await lopHocRepo.findByKeyword(keyword.trim());
    return await Promise.all(classes.map((lopHoc) => this.buildClassCardData(lopHoc)));
  }

  async searchByLecturerName(ten_giang_vien) {
    if (!ten_giang_vien || ten_giang_vien.trim() === "") {
      throw new Error("Ten giang vien khong duoc de trong");
    }

    await this.syncExpiredClassStatuses();
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

    if (lopHoc.ma_lop && student.ma_lop !== lopHoc.ma_lop) {
      await student.update({ ma_lop: lopHoc.ma_lop });
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
        ma_lop: student.ma_lop,
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

  getDefaultGroupCapacity(lopHoc) {
    const classSize = Number(lopHoc.si_so_toi_da || 0);
    const maxGroups = Number(lopHoc.so_nhom_toi_da || 0);

    if (classSize > 0 && maxGroups > 0) {
      return Math.max(1, Math.ceil(classSize / maxGroups));
    }

    return 5;
  }

  generateGroupCode(lopHoc, nextIndex) {
    const suffix = String(nextIndex).padStart(2, "0");
    return lopHoc.ma_lop ? `${lopHoc.ma_lop}-N${suffix}` : `LOP${lopHoc.id_lop}-N${suffix}`;
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
