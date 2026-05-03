const { Op } = require("sequelize");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const CongViec = require("../models/cong_viec.model");
const NhomHoc = require("../models/nhom_hoc.model");

const getSchedule = async (id_sinh_vien, selectedDate) => {
  
  if (!selectedDate) {
    return {
      success: false,
      message: "Thiếu ngày cần xem lịch"
    };
  }

  const memberships = await ThanhVienNhom.findAll({
    where: { id_sinh_vien }
  });

  const groupIds = memberships.map(item => item.id_nhom);

  if (groupIds.length === 0) {
    return {
      success: true,
      data: {
        marked_dates: [],
        events: []
      }
    };
  }

  const allTasks = await CongViec.findAll({
  where: {
    id_nhom: {
      [Op.in]: groupIds
    },
    id_sinh_vien_phu_trach: id_sinh_vien 
  },
  include: [
    {
      model: NhomHoc,
      as: "nhom_hoc"
    }
  ]
});
  const marked_dates = [...new Set(
    allTasks.map(task =>
      task.han_chot
        ? task.han_chot.toISOString().split("T")[0]
        : null
    ).filter(Boolean)
  )];

  const events = allTasks
  .filter(task => {
    if (!task.han_chot) return false;
    const taskDate = task.han_chot.toISOString().split("T")[0];
    return taskDate === selectedDate;
  })
  .map(task => ({
    id_cong_viec: task.id_cong_viec,
    ten_cong_viec: task.ten_cong_viec,
    mo_ta: task.mo_ta,
    thoi_gian: task.han_chot
      ? task.han_chot.toISOString()
      : null,
    nhom: task.nhom_hoc?.ten_nhom || ""
  }));

  return {
    success: true,
    data: {
      marked_dates,
      events
    }
  };
};

const countLateTasks = async (id_sinh_vien) => {
  const memberships = await ThanhVienNhom.findAll({
    where: { id_sinh_vien }
  });

  const groupIds = memberships.map(item => item.id_nhom);

  if (groupIds.length === 0) {
    return {
      success: true,
      data: {
        total_late_tasks: 0,
        late_tasks: []
      }
    };
  }

  const now = new Date();

  const lateTasks = await CongViec.findAll({
    where: {
      id_nhom: {
        [Op.in]: groupIds
      },
      han_chot: {
        [Op.lt]: now
      },
      trang_thai: {
        [Op.ne]: "hoan_thanh"
      }
    },
    include: [
      {
        model: NhomHoc,
        as: "nhom_hoc"
      }
    ],
    order: [["han_chot", "ASC"]]
  });

  return {
    success: true,
    data: {
      total_late_tasks: lateTasks.length,
      late_tasks: lateTasks.map(task => ({
        id_cong_viec: task.id_cong_viec,
        ten_cong_viec: task.ten_cong_viec,
        han_chot: task.han_chot,
        trang_thai: task.trang_thai,
        nhom: task.nhom_hoc?.ten_nhom || ""
      }))
    }
  };
};

module.exports = {
  getSchedule,
  countLateTasks
};