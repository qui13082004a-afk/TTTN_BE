const {
  sequelize,
  LopHoc,
  NhomHoc,
  SinhVien,
  SinhVienLopHoc,
  ThanhVienNhom,
  CongViec,
  YeuCauChuyenNhom,
} = require("../models");

class GroupChangeRequestService {
  async createRequest(actor, { id_lop, id_nhom_moi, ly_do }) {
    if (actor?.role !== "sinhvien" || !actor?.id_sinh_vien) {
      throw new Error("Chi sinh vien moi duoc gui yeu cau chuyen nhom");
    }

    const classId = Number(id_lop);
    const targetGroupId = Number(id_nhom_moi);
    const studentId = Number(actor.id_sinh_vien);

    if (!classId || !targetGroupId) {
      throw new Error("ID lop va ID nhom moi la bat buoc");
    }

    const [lopHoc, targetGroup, enrollment] = await Promise.all([
      LopHoc.findByPk(classId),
      NhomHoc.findByPk(targetGroupId),
      SinhVienLopHoc.findOne({
        where: {
          id_lop: classId,
          id_sinh_vien: studentId,
          trang_thai: "dang_hoc",
        },
      }),
    ]);

    if (!lopHoc || lopHoc.is_deleted) {
      throw new Error("Lop hoc khong ton tai");
    }

    if (!targetGroup || Number(targetGroup.id_lop) !== classId) {
      throw new Error("Nhom moi khong thuoc lop hoc nay");
    }

    if (!enrollment) {
      throw new Error("Sinh vien khong thuoc lop hoc nay");
    }

    const currentMembership = await ThanhVienNhom.findOne({
      where: {
        id_sinh_vien: studentId,
      },
      include: [
        {
          model: NhomHoc,
          attributes: ["id_nhom", "id_lop"],
          where: { id_lop: classId },
          required: true,
        },
      ],
    });

    if (!currentMembership) {
      throw new Error("Sinh vien hien tai chua co nhom");
    }

    const currentGroupId = Number(currentMembership.id_nhom);

    if (currentGroupId === targetGroupId) {
      throw new Error("Sinh vien da o san trong nhom nay");
    }

    const pendingRequest = await YeuCauChuyenNhom.findOne({
      where: {
        id_sinh_vien: studentId,
        trang_thai: "dang_cho_duyet",
      },
      include: [
        {
          model: NhomHoc,
          as: "nhom_moi",
          attributes: ["id_nhom", "id_lop"],
          where: { id_lop: classId },
          required: true,
        },
      ],
    });

    if (pendingRequest) {
      throw new Error("Sinh vien dang co yeu cau chuyen nhom cho duyet");
    }

    const request = await YeuCauChuyenNhom.create({
      id_sinh_vien: studentId,
      id_nhom_cu: currentGroupId,
      id_nhom_moi: targetGroupId,
      ly_do: String(ly_do || "").trim() || null,
      trang_thai: "dang_cho_duyet",
    });

    return {
      id_yeu_cau: request.id_yeu_cau,
      id_sinh_vien: studentId,
      id_lop: classId,
      id_nhom_cu: currentGroupId,
      id_nhom_moi: targetGroupId,
      trang_thai: request.trang_thai,
    };
  }

  async getPendingRequestsByClass(id_lop, actor) {
    const lopHoc = await this.getOwnedClass(id_lop, actor);

    const requests = await YeuCauChuyenNhom.findAll({
      where: {
        trang_thai: "dang_cho_duyet",
      },
      include: [
        {
          model: SinhVien,
          attributes: ["id_sinh_vien", "mssv", "ho_ten", "email"],
          required: true,
        },
        {
          model: NhomHoc,
          as: "nhom_cu",
          attributes: ["id_nhom", "ma_nhom", "ten_nhom"],
          required: true,
        },
        {
          model: NhomHoc,
          as: "nhom_moi",
          attributes: ["id_nhom", "ma_nhom", "ten_nhom", "so_luong_toi_da", "id_lop"],
          where: { id_lop: lopHoc.id_lop },
          required: true,
        },
      ],
      order: [["id_yeu_cau", "DESC"]],
    });

    const items = await Promise.all(
      requests.map(async (request) => {
        const targetCount = await ThanhVienNhom.count({
          where: { id_nhom: request.id_nhom_moi },
        });

        return {
          id_yeu_cau: request.id_yeu_cau,
          id_sinh_vien: request.id_sinh_vien,
          id_nhom_cu: request.id_nhom_cu,
          id_nhom_moi: request.id_nhom_moi,
          ly_do: request.ly_do,
          trang_thai: request.trang_thai,
          mssv: request.sinh_vien?.mssv || null,
          ho_ten: request.sinh_vien?.ho_ten || null,
          email: request.sinh_vien?.email || null,
          ma_nhom_cu: request.nhom_cu?.ma_nhom || null,
          ten_nhom_cu: request.nhom_cu?.ten_nhom || null,
          ma_nhom_moi: request.nhom_moi?.ma_nhom || null,
          ten_nhom_moi: request.nhom_moi?.ten_nhom || null,
          so_luong_toi_da: Number(request.nhom_moi?.so_luong_toi_da || 0),
          so_thanh_vien_nhom_moi: targetCount,
        };
      })
    );

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
      },
      sort: "id_yeu_cau_DESC",
      count: items.length,
      items,
    };
  }

  async getPendingCountByClass(id_lop, actor) {
    const lopHoc = await this.getOwnedClass(id_lop, actor);

    const count = await YeuCauChuyenNhom.count({
      where: {
        trang_thai: "dang_cho_duyet",
      },
      include: [
        {
          model: NhomHoc,
          as: "nhom_moi",
          attributes: [],
          where: { id_lop: lopHoc.id_lop },
          required: true,
        },
      ],
    });

    return {
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
      },
      pending_count: Number(count || 0),
    };
  }

  async rejectRequest(id_yeu_cau, actor) {
    const request = await this.getPendingRequestOwnedByLecturer(id_yeu_cau, actor);

    await request.update({
      trang_thai: "da_tu_choi",
    });

    return {
      id_yeu_cau: request.id_yeu_cau,
      trang_thai: "da_tu_choi",
      notification_message: `Yeu cau chuyen sang nhom ${request.nhom_moi?.ma_nhom} cua ban da bi tu choi`,
    };
  }

  async approveRequest(id_yeu_cau, actor) {
    const request = await this.getPendingRequestOwnedByLecturer(id_yeu_cau, actor);

    const result = await sequelize.transaction(async (transaction) => {
      const lockedRequest = await YeuCauChuyenNhom.findOne({
        where: {
          id_yeu_cau: request.id_yeu_cau,
          trang_thai: "dang_cho_duyet",
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!lockedRequest) {
        throw new Error("Yeu cau khong con o trang thai cho duyet");
      }

      const [currentGroup, targetGroup] = await Promise.all([
        NhomHoc.findByPk(lockedRequest.id_nhom_cu, { transaction, lock: transaction.LOCK.UPDATE }),
        NhomHoc.findByPk(lockedRequest.id_nhom_moi, { transaction, lock: transaction.LOCK.UPDATE }),
      ]);

      if (!currentGroup || !targetGroup) {
        throw new Error("Khong tim thay nhom cu hoac nhom moi");
      }

      const currentMembership = await ThanhVienNhom.findOne({
        where: {
          id_nhom: lockedRequest.id_nhom_cu,
          id_sinh_vien: lockedRequest.id_sinh_vien,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!currentMembership) {
        throw new Error("Sinh vien khong con nam trong nhom cu");
      }

      const targetCount = await ThanhVienNhom.count({
        where: { id_nhom: lockedRequest.id_nhom_moi },
        transaction,
      });

      if (targetCount >= Number(targetGroup.so_luong_toi_da || 0)) {
        throw new Error(`Khong the duyet! Nhom [${targetGroup.ma_nhom}] da du so luong toi da`);
      }

      await ThanhVienNhom.destroy({
        where: {
          id_nhom: lockedRequest.id_nhom_cu,
          id_sinh_vien: lockedRequest.id_sinh_vien,
        },
        transaction,
      });

      await ThanhVienNhom.create({
        id_nhom: lockedRequest.id_nhom_moi,
        id_sinh_vien: lockedRequest.id_sinh_vien,
        vai_tro_noi_bo: currentMembership.vai_tro_noi_bo || "thanh_vien",
        ngay_gia_nhap: new Date(),
      }, { transaction });

      await CongViec.update(
        { id_nhom: lockedRequest.id_nhom_moi },
        {
          where: {
            id_sinh_vien_phu_trach: lockedRequest.id_sinh_vien,
            id_nhom: lockedRequest.id_nhom_cu,
          },
          transaction,
        }
      );

      const currentGroupCount = await ThanhVienNhom.count({
        where: { id_nhom: lockedRequest.id_nhom_cu },
        transaction,
      });

      if (currentGroupCount === 0) {
        await NhomHoc.destroy({
          where: { id_nhom: lockedRequest.id_nhom_cu },
          transaction,
        });
      }

      await lockedRequest.update({
        trang_thai: "da_chap_nhan",
      }, { transaction });

      return {
        from_group_deleted: currentGroupCount === 0,
        target_count_after: targetCount + 1,
      };
    });

    return {
      id_yeu_cau: request.id_yeu_cau,
      trang_thai: "da_chap_nhan",
      from_group_deleted: result.from_group_deleted,
      notification_message: `Yeu cau chuyen sang nhom ${request.nhom_moi?.ma_nhom} cua ban da duoc chap nhan`,
    };
  }

  async getOwnedClass(id_lop, actor) {
    const lopHoc = await LopHoc.findByPk(Number(id_lop));
    if (!lopHoc || lopHoc.is_deleted) {
      throw new Error("Lop hoc khong ton tai");
    }

    if (
      actor?.role !== "admin" &&
      actor?.id_giang_vien &&
      Number(lopHoc.id_giang_vien) !== Number(actor.id_giang_vien)
    ) {
      throw new Error("Ban khong co quyen thao tac voi lop hoc nay");
    }

    return lopHoc;
  }

  async getPendingRequestOwnedByLecturer(id_yeu_cau, actor) {
    const request = await YeuCauChuyenNhom.findOne({
      where: {
        id_yeu_cau: Number(id_yeu_cau),
      },
      include: [
        {
          model: NhomHoc,
          as: "nhom_moi",
          attributes: ["id_nhom", "id_lop", "ma_nhom", "ten_nhom", "so_luong_toi_da"],
          required: true,
        },
        {
          model: NhomHoc,
          as: "nhom_cu",
          attributes: ["id_nhom", "ma_nhom", "ten_nhom"],
          required: false,
        },
      ],
    });

    if (!request) {
      throw new Error("Yeu cau chuyen nhom khong ton tai");
    }

    await this.getOwnedClass(request.nhom_moi.id_lop, actor);

    if (request.trang_thai !== "dang_cho_duyet") {
      throw new Error("Yeu cau khong con o trang thai cho duyet");
    }

    return request;
  }
}

module.exports = new GroupChangeRequestService();
