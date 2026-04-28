const { Op } = require("sequelize");
const {
  LopHoc,
  NhomHoc,
  CongViec,
  TinNhan,
  SinhVien,
} = require("../models");
const lopHocService = require("./lopHoc.service");

class DashboardService {
  async getLecturerSummary(actor, hoc_ky) {
    const lecturerId = this.getLecturerId(actor);
    const requestedHocKy = String(hoc_ky || "").trim() || null;
    const classWhere = {
      id_mon_hoc: {
        [Op.ne]: null,
      },
      is_deleted: false,
    };

    if (requestedHocKy) {
      classWhere.hoc_ky = requestedHocKy;
    }

    const now = new Date();
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const classes = await LopHoc.findAll({
      where: classWhere,
      attributes: ["id_lop", "ten_lop", "ma_lop", "han_chot_dang_ky", "trang_thai"],
      order: [["id_lop", "ASC"]],
    });

    const classIds = classes.map((item) => item.id_lop);

    let totalGroups = 0;
    let taskSapTreHan = 0;

    if (classIds.length > 0) {
      totalGroups = await NhomHoc.count({
        where: { id_lop: classIds },
      });

      const groups = await NhomHoc.findAll({
        where: { id_lop: classIds },
        attributes: ["id_nhom"],
      });

      const groupIds = groups.map((item) => item.id_nhom);
      if (groupIds.length > 0) {
        taskSapTreHan = await CongViec.count({
          where: {
            id_nhom: groupIds,
            han_chot: {
              [Op.lte]: inThreeDays,
            },
            [Op.or]: [
              { trang_thai: null },
              {
                trang_thai: {
                  [Op.notIn]: ["hoan_thanh", "da_hoan_thanh", "completed", "done"],
                },
              },
            ],
          },
        });
      }
    }

    const lopCanChotNhom = classes.filter((lopHoc) => {
      if (lopHoc.trang_thai !== "dang_mo" || !lopHoc.han_chot_dang_ky) {
        return false;
      }

      const registrationDeadline = new Date(lopHoc.han_chot_dang_ky);
      return registrationDeadline >= now && registrationDeadline <= inThreeDays;
    }).length;

    return {
      hoc_ky: requestedHocKy,
      lecturer: {
        id_giang_vien: lecturerId,
      },
      summary: {
        lop_dang_phu_trach: classes.length,
        tong_so_nhom: totalGroups,
        lop_can_chot_nhom: lopCanChotNhom,
        task_sap_tre_han: taskSapTreHan,
      },
    };
  }

  async getPendingActions(actor, hoc_ky) {
    const lecturerId = this.getLecturerId(actor);
    const currentHocKy = await this.resolveCurrentHocKy(lecturerId, hoc_ky);
    const classWhere = this.buildLecturerClassWhere(lecturerId, currentHocKy);
    const now = new Date();

    const classes = await LopHoc.findAll({
      where: {
        ...classWhere,
        trang_thai: "dang_mo",
        han_chot_dang_ky: {
          [Op.lt]: now,
        },
      },
      attributes: [
        "id_lop",
        "ma_lop",
        "ten_lop",
        "han_chot_dang_ky",
        "trang_thai",
        "so_nhom_toi_da",
      ],
      order: [["han_chot_dang_ky", "ASC"]],
    });

    const items = [];

    for (const lopHoc of classes) {
      const ungroupedStudents = await lopHocService.findUngroupedStudentsByClassId(lopHoc.id_lop);
      if (ungroupedStudents.length === 0) {
        continue;
      }

      items.push({
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
        han_chot_dang_ky: lopHoc.han_chot_dang_ky,
        trang_thai: lopHoc.trang_thai,
        so_sinh_vien_chua_co_nhom: ungroupedStudents.length,
        can_auto_group: true,
      });
    }

    return {
      hoc_ky: currentHocKy,
      count: items.length,
      items,
    };
  }

  async getNotifications(actor, { hoc_ky, limit = 20 } = {}) {
    const lecturerId = this.getLecturerId(actor);
    const currentHocKy = await this.resolveCurrentHocKy(lecturerId, hoc_ky);
    const classWhere = this.buildLecturerClassWhere(lecturerId, currentHocKy);

    const notifications = await TinNhan.findAll({
      include: [
        {
          model: NhomHoc,
          attributes: ["id_nhom", "ma_nhom", "ten_nhom", "id_lop"],
          required: true,
          include: [
            {
              model: LopHoc,
              attributes: ["id_lop", "ma_lop", "ten_lop", "hoc_ky"],
              where: classWhere,
              required: true,
            },
          ],
        },
        {
          model: SinhVien,
          attributes: ["id_sinh_vien", "mssv", "ho_ten", "email"],
          required: false,
        },
      ],
      order: [["thoi_gian_gui", "DESC"]],
      limit: Number(limit) > 0 ? Number(limit) : 20,
    });

    return {
      hoc_ky: currentHocKy,
      count: notifications.length,
      items: notifications.map((item) => ({
        id_tin_nhan: item.id_tin_nhan,
        noi_dung: item.noi_dung,
        da_thu_hoi: item.da_thu_hoi,
        thoi_gian_gui: item.thoi_gian_gui,
        nguoi_gui: item.sinh_vien ? item.sinh_vien.toJSON() : null,
        nhom: item.nhom_hoc ? {
          id_nhom: item.nhom_hoc.id_nhom,
          ma_nhom: item.nhom_hoc.ma_nhom,
          ten_nhom: item.nhom_hoc.ten_nhom,
        } : null,
        lop_hoc: item.nhom_hoc?.lop_hoc ? item.nhom_hoc.lop_hoc.toJSON() : null,
      })),
    };
  }

  getLecturerId(actor) {
    if (!actor || !actor.id_giang_vien) {
      throw new Error("Khong xac dinh duoc giang vien dang dang nhap");
    }

    return Number(actor.id_giang_vien);
  }

  async resolveCurrentHocKy(lecturerId, requestedHocKy) {
    if (requestedHocKy && String(requestedHocKy).trim()) {
      return String(requestedHocKy).trim();
    }

    const latestClass = await LopHoc.findOne({
      where: {
        id_giang_vien: lecturerId,
        is_deleted: false,
        hoc_ky: {
          [Op.ne]: null,
        },
      },
      order: [["updated_at", "DESC"], ["id_lop", "DESC"]],
    });

    return latestClass?.hoc_ky || null;
  }

  buildLecturerClassWhere(lecturerId, hocKy) {
    const where = {
      id_giang_vien: lecturerId,
      is_deleted: false,
    };

    if (hocKy) {
      where.hoc_ky = hocKy;
    }

    return where;
  }
}

module.exports = new DashboardService();
