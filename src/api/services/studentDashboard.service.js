const { Op } = require("sequelize");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const SinhVienLopHoc = require("../models/sinh_vien_lop_hoc.model");
const CongViec = require("../models/cong_viec.model");
const NhatKy = require("../models/nhat_ky.model");
const TinNhan = require("../models/tin_nhan.model");
const SinhVien = require("../models/sinh_vien.model");

const getDashboard = async (id_sinh_vien, lastSeenMessageId) => {
  const totalGroups = await ThanhVienNhom.count({
    where: { id_sinh_vien }
  });

  const totalCourses = await SinhVienLopHoc.count({
    where: { id_sinh_vien, trang_thai: "dang_hoc" }
  });

  const now = new Date();
  const next7Days = new Date();
  next7Days.setDate(now.getDate() + 7);

  const upcomingDeadlines = await CongViec.count({
    where: {
      id_sinh_vien_phu_trach: id_sinh_vien,
      han_chot: {
        [Op.between]: [now, next7Days]
      },
      trang_thai: {
        [Op.ne]: "hoan_thanh"
      }
    }
  });

  const completedTasks = await CongViec.count({
    where: {
      id_sinh_vien_phu_trach: id_sinh_vien,
      trang_thai: "hoan_thanh"
    }
  });

  const rewardPoints = completedTasks * 10;

  const recentActivities = await NhatKy.findAll({
  include: [
    {
      model: CongViec,
      required: true,
      where: {
        id_sinh_vien_phu_trach: id_sinh_vien
      }
    }
  ],
  order: [["id_nhat_ky", "DESC"]],
  limit: 5
});

// Lấy danh sách nhóm
const myGroups = await ThanhVienNhom.findAll({
  where: { id_sinh_vien },
  attributes: ["id_nhom"]
});

const groupIds = myGroups.map(g => g.id_nhom);

// Lấy tin nhắn trong nhóm
const notifications = await TinNhan.findAll({
  where: {
    id_nhom: {
      [Op.in]: groupIds
    },
    id_nguoi_gui: {
      [Op.ne]: id_sinh_vien
    }
  },
  order: [["thoi_gian_gui", "DESC"]],
  limit: 5
});

  const unreadCount = await TinNhan.count({
  where: {
    id_nhom: {
      [Op.in]: groupIds
    },
    id_nguoi_gui: {
      [Op.ne]: id_sinh_vien
    },
    id_tin_nhan: {
      [Op.gt]: lastSeenMessageId
    },
    da_thu_hoi: 0
  }
});

  const student = await SinhVien.findByPk(id_sinh_vien);

  return {
    success: true,
    data: {
      user: {
        id: student.id_sinh_vien,
        ho_ten: student.ho_ten,
        avatar: student.avatar
      },
      statistics: {
        total_groups: totalGroups,
        total_courses: totalCourses,
        upcoming_deadlines: upcomingDeadlines,
        reward_points: rewardPoints
      },
      recent_activities: recentActivities,
      notifications,
      unread_notifications: unreadCount
    }
  };
};

module.exports = {
  getDashboard
};