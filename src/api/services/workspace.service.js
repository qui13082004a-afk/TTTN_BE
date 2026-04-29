const NhomHoc = require("../models/nhom_hoc.model");
const LopHoc = require("../models/lop_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const SinhVien = require("../models/sinh_vien.model");
const TinNhan = require("../models/tin_nhan.model");

const getWorkspaceInfo = async (id_nhom, id_sinh_vien) => {
  const group = await NhomHoc.findOne({
    where: { id_nhom },
    include: [
      {
        model: LopHoc,
        as: "lop_hoc",
        attributes: ["ma_lop", "ten_lop"]
      }
    ]
  });

  if (!group) {
    throw new Error("Không tìm thấy nhóm");
  }

  const member = await ThanhVienNhom.findOne({
    where: {
      id_nhom,
      id_sinh_vien
    }
  });

  if (!member) {
    throw new Error("Bạn không thuộc nhóm này");
  }

  const isLeader = group.id_nhom_truong === Number(id_sinh_vien);

  return {
    success: true,
    data: {
      group_info: {
        id_nhom: group.id_nhom,
        ma_nhom: group.ma_nhom,
        ten_nhom: group.ten_nhom,
        ten_mon_hoc: group.lop_hoc?.ten_lop,
        ma_lop: group.lop_hoc?.ma_lop
      },
      current_user: {
        id_sinh_vien,
        vai_tro: isLeader ? "truong_nhom" : "thanh_vien"
      },
      menu_actions: [
        {
          key: "create_task",
          label: "Tạo task mới",
          allow: true
        },
        {
          key: "task_list",
          label: "Việc cần làm",
          allow: true
        },
        {
          key: "members",
          label: "Xem thành viên nhóm",
          allow: true
        },
        {
          key: "chat",
          label: "Thảo luận nhóm",
          allow: true
        },
        {
          key: "change_group",
          label: "Xin đổi nhóm",
          allow: true
        }
      ]
    }
  };
};

const getMessageCount = async (userId) => {
  const count = await TinNhan.count({
    where: {
      id_nguoi_gui: userId,
      da_thu_hoi: false
    }
  });

  return {
    success: true,
    data: {
      total_messages: count
    }
  };
};

const getMessages = async (userId) => {
  const list = await TinNhan.findAll({
    where: {
      id_nguoi_gui: userId,
      da_thu_hoi: false
    },
    order: [["thoi_gian_gui", "DESC"]]
  });

  return {
    success: true,
    data: list
  };
};

const revokeMessage = async (userId, notificationId) => {
  const notification = await TinNhan.findOne({
    where: {
      id_tin_nhan: notificationId,
      id_nguoi_gui: userId
    }
  });

  if (!notification) {
    throw new Error("Không tìm thấy tin nhắn");
  }

  await notification.update({
    da_thu_hoi: true
  });

  return {
    success: true,
    message: "Đã thu hồi tin nhắn"
  };
};

module.exports = {
  getWorkspaceInfo,
  getMessageCount,
  getMessages,
  revokeMessage
};