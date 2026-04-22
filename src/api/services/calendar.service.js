const { Op } = require("sequelize");
const { LopHoc, NhomHoc, CongViec } = require("../models");

class CalendarService {
  async getCalendarClasses(actor, hoc_ky) {
    const lecturerId = this.getLecturerId(actor);
    const currentHocKy = await this.resolveCurrentHocKy(lecturerId, hoc_ky);
    const where = this.buildClassWhere(lecturerId, currentHocKy);

    const classes = await LopHoc.findAll({
      where,
      attributes: ["id_lop", "ma_lop", "ten_lop", "hoc_ky", "id_mon_hoc", "han_chot_dang_ky", "trang_thai"],
      order: [["updated_at", "DESC"], ["id_lop", "DESC"]],
    });

    return {
      hoc_ky: currentHocKy,
      count: classes.length,
      classes: classes.map((lopHoc) => ({
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
        hoc_ky: lopHoc.hoc_ky,
        ma_mon_hoc: lopHoc.id_mon_hoc ? String(lopHoc.id_mon_hoc) : null,
        han_chot_dang_ky: lopHoc.han_chot_dang_ky,
        trang_thai: lopHoc.trang_thai,
      })),
    };
  }

  async getMonthEvents(actor, { month, year, id_lop, hoc_ky }) {
    const lecturerId = this.getLecturerId(actor);
    const { startDate, endDate } = this.resolveMonthRange(month, year);
    const currentHocKy = await this.resolveCurrentHocKy(lecturerId, hoc_ky);
    const classes = await this.getAccessibleClasses(lecturerId, currentHocKy, id_lop);
    const classIds = classes.map((lopHoc) => lopHoc.id_lop);

    if (classIds.length === 0) {
      return {
        hoc_ky: currentHocKy,
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear(),
        selected_class_id: id_lop ? Number(id_lop) : null,
        count: 0,
        dates: [],
      };
    }

    const groupedDates = new Map();

    const registrationEvents = classes.filter((lopHoc) =>
      lopHoc.han_chot_dang_ky &&
      lopHoc.han_chot_dang_ky >= startDate &&
      lopHoc.han_chot_dang_ky < endDate
    );

    for (const lopHoc of registrationEvents) {
      this.addDateMarker(groupedDates, this.toDateKey(lopHoc.han_chot_dang_ky), "han_dang_ky");
    }

    const groups = await NhomHoc.findAll({
      where: { id_lop: classIds },
      attributes: ["id_nhom"],
    });

    const groupIds = groups.map((group) => group.id_nhom);

    if (groupIds.length > 0) {
      const tasks = await CongViec.findAll({
        where: {
          id_nhom: groupIds,
          han_chot: {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
          },
        },
        attributes: ["han_chot"],
      });

      for (const task of tasks) {
        this.addDateMarker(groupedDates, this.toDateKey(task.han_chot), "deadline_cong_viec");
      }
    }

    return {
      hoc_ky: currentHocKy,
      month: startDate.getMonth() + 1,
      year: startDate.getFullYear(),
      selected_class_id: id_lop ? Number(id_lop) : null,
      count: groupedDates.size,
      dates: Array.from(groupedDates.entries())
        .map(([date, info]) => ({
          date,
          has_event: true,
          event_count: info.event_count,
          event_types: Array.from(info.types),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  async getDayEvents(actor, { date, id_lop, hoc_ky }) {
    const lecturerId = this.getLecturerId(actor);
    const selectedDate = this.parseDateOnly(date);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const currentHocKy = await this.resolveCurrentHocKy(lecturerId, hoc_ky);
    const classes = await this.getAccessibleClasses(lecturerId, currentHocKy, id_lop);
    const classMap = new Map(classes.map((lopHoc) => [lopHoc.id_lop, lopHoc]));
    const events = [];

    for (const lopHoc of classes) {
      if (
        lopHoc.han_chot_dang_ky &&
        lopHoc.han_chot_dang_ky >= selectedDate &&
        lopHoc.han_chot_dang_ky < nextDate
      ) {
        events.push({
          event_time: lopHoc.han_chot_dang_ky,
          event_type: "han_dang_ky",
          event_name: "Han chot dang ky nhom",
          class: lopHoc,
        });
      }
    }

    const classIds = classes.map((lopHoc) => lopHoc.id_lop);
    if (classIds.length > 0) {
      const groups = await NhomHoc.findAll({
        where: { id_lop: classIds },
        attributes: ["id_nhom", "id_lop"],
      });

      const groupIds = groups.map((group) => group.id_nhom);
      const groupToClassMap = new Map(groups.map((group) => [group.id_nhom, group.id_lop]));

      if (groupIds.length > 0) {
        const tasks = await CongViec.findAll({
          where: {
            id_nhom: groupIds,
            han_chot: {
              [Op.gte]: selectedDate,
              [Op.lt]: nextDate,
            },
          },
          attributes: ["id_nhom", "ten_cong_viec", "han_chot", "trang_thai"],
          order: [["han_chot", "ASC"]],
        });

        for (const task of tasks) {
          const classId = groupToClassMap.get(task.id_nhom);
          const lopHoc = classMap.get(classId);
          if (!lopHoc) {
            continue;
          }

          events.push({
            event_time: task.han_chot,
            event_type: "deadline_cong_viec",
            event_name: task.ten_cong_viec,
            task_status: task.trang_thai,
            class: lopHoc,
          });
        }
      }
    }

    events.sort((a, b) => new Date(a.event_time) - new Date(b.event_time));

    return {
      hoc_ky: currentHocKy,
      date: this.toDateKey(selectedDate),
      selected_class_id: id_lop ? Number(id_lop) : null,
      count: events.length,
      items: events.map((event) => ({
        event_time: event.event_time,
        event_type: event.event_type,
        event_name: event.event_name,
        task_status: event.task_status || null,
        class: {
          id_lop: event.class.id_lop,
          ma_lop: event.class.ma_lop,
          ten_lop: event.class.ten_lop,
          ma_mon_hoc: event.class.id_mon_hoc ? String(event.class.id_mon_hoc) : null,
        },
        formatted_text: `[${this.formatTime(event.event_time)}] [${this.formatDate(event.event_time)}] - ${event.event_name}: ${event.class.ten_lop}`,
      })),
      empty_message: events.length === 0 ? "Khong co su kien nao trong ngay nay" : null,
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

  buildClassWhere(lecturerId, hocKy) {
    const where = {
      id_giang_vien: lecturerId,
      is_deleted: false,
    };

    if (hocKy) {
      where.hoc_ky = hocKy;
    }

    return where;
  }

  async getAccessibleClasses(lecturerId, hocKy, id_lop) {
    const where = this.buildClassWhere(lecturerId, hocKy);
    if (id_lop) {
      where.id_lop = Number(id_lop);
    }

    return await LopHoc.findAll({
      where,
      attributes: ["id_lop", "ma_lop", "ten_lop", "id_mon_hoc", "hoc_ky", "han_chot_dang_ky", "trang_thai"],
      order: [["id_lop", "ASC"]],
    });
  }

  resolveMonthRange(month, year) {
    const now = new Date();
    const parsedMonth = month ? Number(month) : now.getMonth() + 1;
    const parsedYear = year ? Number(year) : now.getFullYear();

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      throw new Error("Thang khong hop le");
    }

    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 3000) {
      throw new Error("Nam khong hop le");
    }

    const startDate = new Date(parsedYear, parsedMonth - 1, 1);
    const endDate = new Date(parsedYear, parsedMonth, 1);
    return { startDate, endDate };
  }

  parseDateOnly(dateString) {
    if (!dateString) {
      throw new Error("Ngay khong duoc de trong");
    }

    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Ngay khong hop le");
    }

    return date;
  }

  addDateMarker(groupedDates, dateKey, type) {
    if (!groupedDates.has(dateKey)) {
      groupedDates.set(dateKey, {
        event_count: 0,
        types: new Set(),
      });
    }

    const current = groupedDates.get(dateKey);
    current.event_count += 1;
    current.types.add(type);
  }

  toDateKey(date) {
    return new Date(date).toISOString().slice(0, 10);
  }

  formatTime(date) {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  formatDate(date) {
    const value = new Date(date);
    const day = String(value.getDate()).padStart(2, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const year = value.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

module.exports = new CalendarService();
