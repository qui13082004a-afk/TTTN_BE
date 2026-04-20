const { SinhVien, NhomHoc, CongViec, NhatKy, ThanhVienNhom, sequelize } = require("../models");

class AdminService {
  async moveStudent({ id_sinh_vien, id_nhom_from, id_nhom_to }) {
    const studentId = Number(id_sinh_vien);
    const fromGroupId = Number(id_nhom_from);
    const toGroupId = Number(id_nhom_to);

    if (!studentId || !fromGroupId || !toGroupId) {
      throw new Error("id_sinh_vien, id_nhom_from va id_nhom_to la bat buoc va phai la so.");
    }

    if (fromGroupId === toGroupId) {
      throw new Error("Nhom nguon va nhom dich phai khac nhau.");
    }

    const [student, fromGroup, toGroup] = await Promise.all([
      SinhVien.findByPk(studentId),
      NhomHoc.findByPk(fromGroupId),
      NhomHoc.findByPk(toGroupId),
    ]);

    if (!student) {
      throw new Error("Sinh vien khong ton tai.");
    }

    if (!fromGroup) {
      throw new Error("Nhom nguon khong ton tai.");
    }

    if (!toGroup) {
      throw new Error("Nhom dich khong ton tai.");
    }

    if (fromGroup.id_lop !== toGroup.id_lop) {
      throw new Error("Hai nhom phai thuoc cung mot lop hoc.");
    }

    const result = await sequelize.transaction(async (transaction) => {
      const membership = await ThanhVienNhom.findOne({
        where: {
          id_sinh_vien: studentId,
          id_nhom: fromGroupId,
        },
        transaction,
      });

      if (!membership) {
        return { movedCount: 0, membershipMoved: false };
      }

      await ThanhVienNhom.findOrCreate({
        where: {
          id_sinh_vien: studentId,
          id_nhom: toGroupId,
        },
        defaults: {
          id_sinh_vien: studentId,
          id_nhom: toGroupId,
          vai_tro_noi_bo: membership.vai_tro_noi_bo,
          ngay_gia_nhap: new Date(),
        },
        transaction,
      });

      await ThanhVienNhom.destroy({
        where: {
          id_sinh_vien: studentId,
          id_nhom: fromGroupId,
        },
        transaction,
      });

      const [movedCount] = await CongViec.update(
        { id_nhom: toGroupId },
        {
          where: {
            id_sinh_vien_phu_trach: studentId,
            id_nhom: fromGroupId,
          },
          transaction,
        }
      );

      return { movedCount, membershipMoved: true };
    });

    if (!result.membershipMoved) {
      throw new Error("Khong tim thay sinh vien trong nhom nguon de di chuyen.");
    }

    return {
      id_sinh_vien: studentId,
      id_nhom_from: fromGroupId,
      id_nhom_to: toGroupId,
      moved_count: result.movedCount,
    };
  }

  async kickStudent({ id_sinh_vien, id_nhom }) {
    const studentId = Number(id_sinh_vien);
    const groupId = Number(id_nhom);

    if (!studentId || !groupId) {
      throw new Error("id_sinh_vien va id_nhom la bat buoc va phai la so.");
    }

    const [student, group] = await Promise.all([
      SinhVien.findByPk(studentId),
      NhomHoc.findByPk(groupId),
    ]);

    if (!student) {
      throw new Error("Sinh vien khong ton tai.");
    }

    if (!group) {
      throw new Error("Nhom khong ton tai.");
    }

    const result = await sequelize.transaction(async (transaction) => {
      const tasks = await CongViec.findAll({
        where: {
          id_sinh_vien_phu_trach: studentId,
          id_nhom: groupId,
        },
        transaction,
      });

      const removedMembership = await ThanhVienNhom.destroy({
        where: {
          id_sinh_vien: studentId,
          id_nhom: groupId,
        },
        transaction,
      });

      let deletedLogs = 0;
      if (tasks.length > 0) {
        const taskIds = tasks.map((task) => task.id_cong_viec);
        deletedLogs = await NhatKy.destroy({
          where: {
            id_cong_viec: taskIds,
          },
          transaction,
        });
      }

      const [updatedCount] = await CongViec.update(
        { id_nhom: null },
        {
          where: {
            id_sinh_vien_phu_trach: studentId,
            id_nhom: groupId,
          },
          transaction,
        }
      );

      return { updatedCount, deletedLogs, removedMembership };
    });

    if (!result.removedMembership && result.updatedCount === 0) {
      throw new Error("Khong tim thay sinh vien trong nhom de xoa.");
    }

    return {
      id_sinh_vien: studentId,
      id_nhom: groupId,
      kicked_count: result.updatedCount,
      deleted_nhat_ky: result.deletedLogs,
    };
  }
}

module.exports = new AdminService();
