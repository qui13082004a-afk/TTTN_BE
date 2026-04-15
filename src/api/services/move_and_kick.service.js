const { SinhVien, NhomHoc, CongViec, NhatKy, sequelize } = require("../models");

class AdminService {
  async moveStudent({ id_sinh_vien, id_nhom_from, id_nhom_to }) {
    const studentId = Number(id_sinh_vien);
    const fromGroupId = Number(id_nhom_from);
    const toGroupId = Number(id_nhom_to);

    if (!studentId || !fromGroupId || !toGroupId) {
      throw new Error("id_sinh_vien, id_nhom_from và id_nhom_to là bắt buộc và phải là số.");
    }

    if (fromGroupId === toGroupId) {
      throw new Error("Nhóm nguồn và nhóm đích phải khác nhau.");
    }

    const [student, fromGroup, toGroup] = await Promise.all([
      SinhVien.findByPk(studentId),
      NhomHoc.findByPk(fromGroupId),
      NhomHoc.findByPk(toGroupId),
    ]);

    if (!student) {
      throw new Error("Sinh viên không tồn tại.");
    }

    if (!fromGroup) {
      throw new Error("Nhóm nguồn không tồn tại.");
    }

    if (!toGroup) {
      throw new Error("Nhóm đích không tồn tại.");
    }

    if (fromGroup.id_lop !== toGroup.id_lop) {
      throw new Error("Hai nhóm phải thuộc cùng một lớp học.");
    }

    const [updatedCount] = await sequelize.transaction(async (transaction) => {
      return await CongViec.update(
        { id_nhom: toGroupId },
        {
          where: {
            id_sinh_vien: studentId,
            id_nhom: fromGroupId,
          },
          transaction,
        }
      );
    });

    if (updatedCount === 0) {
      throw new Error("Không tìm thấy công việc của sinh viên trong nhóm nguồn để di chuyển.");
    }

    return {
      id_sinh_vien: studentId,
      id_nhom_from: fromGroupId,
      id_nhom_to: toGroupId,
      moved_count: updatedCount,
    };
  }

  async kickStudent({ id_sinh_vien, id_nhom }) {
    const studentId = Number(id_sinh_vien);
    const groupId = Number(id_nhom);

    if (!studentId || !groupId) {
      throw new Error("id_sinh_vien và id_nhom là bắt buộc và phải là số.");
    }

    const [student, group] = await Promise.all([
      SinhVien.findByPk(studentId),
      NhomHoc.findByPk(groupId),
    ]);

    if (!student) {
      throw new Error("Sinh viên không tồn tại.");
    }

    if (!group) {
      throw new Error("Nhóm không tồn tại.");
    }

    const result = await sequelize.transaction(async (transaction) => {
      const tasks = await CongViec.findAll({
        where: {
          id_sinh_vien: studentId,
          id_nhom: groupId,
        },
        transaction,
      });

      if (tasks.length === 0) {
        return { updatedCount: 0, deletedLogs: 0 };
      }

      const taskIds = tasks.map((task) => task.id_cong_viec);

      const deletedLogs = await NhatKy.destroy({
        where: {
          id_cong_viec: taskIds,
        },
        transaction,
      });

      const [updatedCount] = await CongViec.update(
        { id_nhom: null },
        {
          where: {
            id_sinh_vien: studentId,
            id_nhom: groupId,
          },
          transaction,
        }
      );

      return { updatedCount, deletedLogs };
    });

    if (result.updatedCount === 0) {
      throw new Error("Không tìm thấy sinh viên trong nhóm để xóa.");
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
