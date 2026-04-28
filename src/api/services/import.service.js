const { Op } = require("sequelize");
const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const sinhVienRepo = require("../repositories/sinhVien.repository");
const { LopHoc, SinhVien, SinhVienLopHoc } = require("../models");

class ImportService {
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

    const warnings = [];
    const rows = this.getImportRows(data, warnings);

    if (rows.length === 0) {
      return this.buildImportResult(lopHoc, {
        inserted: 0,
        createdAccounts: 0,
        warnings,
      });
    }

    const existingStudents = await this.findExistingStudents(rows);
    const studentMap = this.buildStudentLookupMap(existingStudents);
    const existingClassStudentIds = await this.findExistingClassStudentIds(
      lopHoc.id_lop,
      existingStudents.map((student) => student.id_sinh_vien)
    );

    const defaultPassword = await bcrypt.hash("123456", 10);
    const importData = await this.buildStudentClassImportData({
      rows,
      studentMap,
      existingClassStudentIds,
      id_lop: lopHoc.id_lop,
      ma_lop: lopHoc.ma_lop,
      defaultPassword,
      warnings,
    });

    if (importData.insertData.length > 0) {
      await SinhVienLopHoc.bulkCreate(importData.insertData);
    }

    return this.buildImportResult(lopHoc, {
      inserted: importData.insertData.length,
      createdAccounts: importData.createdAccounts,
      warnings,
    });
  }

  getImportRows(data, warnings) {
    const rows = [];

    data.forEach((row, index) => {
      const lineNumber = index + 2;
      const studentData = this.extractStudentDataFromRow(row);

      if (!studentData.email && !studentData.mssv) {
        warnings.push(`Dong ${lineNumber} thieu ca Email va MSSV nen khong the import`);
        return;
      }

      rows.push({
        lineNumber,
        ...studentData,
      });
    });

    return rows;
  }

  async findExistingStudents(rows) {
    const emails = [...new Set(rows.map((row) => row.email).filter(Boolean))];
    const mssvs = [...new Set(rows.map((row) => row.mssv).filter(Boolean))];
    const conditions = [];

    if (emails.length > 0) {
      conditions.push({ email: { [Op.in]: emails } });
    }

    if (mssvs.length > 0) {
      conditions.push({ mssv: { [Op.in]: mssvs } });
    }

    if (conditions.length === 0) {
      return [];
    }

    return SinhVien.findAll({
      where: {
        [Op.or]: conditions,
      },
    });
  }

  buildStudentLookupMap(students) {
    const map = new Map();

    students.forEach((student) => {
      if (student.email) {
        map.set(this.buildEmailKey(student.email), student);
      }

      if (student.mssv) {
        map.set(this.buildMssvKey(student.mssv), student);
      }
    });

    return map;
  }

  async findExistingClassStudentIds(id_lop, studentIds) {
    if (studentIds.length === 0) {
      return new Set();
    }

    const existingClassStudents = await SinhVienLopHoc.findAll({
      where: {
        id_lop,
        id_sinh_vien: {
          [Op.in]: studentIds,
        },
      },
    });

    return new Set(existingClassStudents.map((item) => item.id_sinh_vien));
  }

  async buildStudentClassImportData({
    rows,
    studentMap,
    existingClassStudentIds,
    id_lop,
    ma_lop,
    defaultPassword,
    warnings,
  }) {
    const insertData = [];
    const insertedStudentIds = new Set();
    let createdAccounts = 0;

    for (const row of rows) {
      let student = this.findStudentInMap(studentMap, row);

      if (!student) {
        student = await this.createStudentFromRow(row, defaultPassword, warnings);

        if (!student) {
          continue;
        }

        createdAccounts++;
        this.addStudentToMap(studentMap, student);
      }

      const studentClassCode = row.ma_lop || ma_lop || null;

      if (studentClassCode && student.ma_lop !== studentClassCode) {
        await student.update({ ma_lop: studentClassCode });
      }

      if (existingClassStudentIds.has(student.id_sinh_vien)) {
        warnings.push(`Dong ${row.lineNumber} voi sinh vien ${this.getStudentIdentifier(row)} da co trong lop`);
        continue;
      }

      if (insertedStudentIds.has(student.id_sinh_vien)) {
        warnings.push(`Dong ${row.lineNumber} voi sinh vien ${this.getStudentIdentifier(row)} bi trung trong file`);
        continue;
      }

      insertData.push({
        id_sinh_vien: student.id_sinh_vien,
        id_lop,
      });

      insertedStudentIds.add(student.id_sinh_vien);
    }

    return {
      insertData,
      createdAccounts,
    };
  }

  async createStudentFromRow(row, defaultPassword, warnings) {
    if (!row.ho_ten) {
      warnings.push(`Dong ${row.lineNumber} chua co ho ten nen khong the tao tai khoan sinh vien`);
      return null;
    }

    const email = row.email || `${row.mssv}@student.stu.edu.vn`.toLowerCase();

    try {
      return await sinhVienRepo.create({
        mssv: row.mssv || null,
        ma_lop: row.ma_lop || null,
        ho_ten: row.ho_ten,
        email,
        mat_khau: defaultPassword,
      });
    } catch (error) {
      warnings.push(`Dong ${row.lineNumber} khong the tao tai khoan sinh vien: ${error.message}`);
      return null;
    }
  }

  buildImportResult(lopHoc, { inserted, createdAccounts, warnings }) {
    return {
      inserted,
      createdAccounts,
      warnings,
      class: {
        id_lop: lopHoc.id_lop,
        ma_lop: lopHoc.ma_lop,
        ten_lop: lopHoc.ten_lop,
      },
    };
  }

  extractStudentDataFromRow(row) {
    const normalizedRow = this.normalizeRowKeys(row);
    const hoLot = normalizedRow.holot || "";
    const ten = normalizedRow.ten || "";
    const fullName = normalizedRow.hoten || normalizedRow.hovaten || `${hoLot} ${ten}`.trim();

    return {
      ho_ten: String(fullName || "").trim(),
      email: String(normalizedRow.email || "").trim().toLowerCase(),
      ma_lop: String(
        normalizedRow.malop ||
        normalizedRow.malophoc ||
        normalizedRow.classcode ||
        normalizedRow.lop ||
        ""
      ).trim(),
      mssv: String(
        normalizedRow.mssv ||
        normalizedRow.masinhvien ||
        normalizedRow.masv ||
        ""
      ).trim(),
    };
  }

  normalizeRowKeys(row) {
    return Object.entries(row).reduce((normalizedRow, [key, value]) => {
      normalizedRow[this.normalizeHeader(key)] = value;
      return normalizedRow;
    }, {});
  }

  findStudentInMap(studentMap, row) {
    if (row.email && studentMap.has(this.buildEmailKey(row.email))) {
      return studentMap.get(this.buildEmailKey(row.email));
    }

    if (row.mssv && studentMap.has(this.buildMssvKey(row.mssv))) {
      return studentMap.get(this.buildMssvKey(row.mssv));
    }

    return null;
  }

  addStudentToMap(studentMap, student) {
    if (student.email) {
      studentMap.set(this.buildEmailKey(student.email), student);
    }

    if (student.mssv) {
      studentMap.set(this.buildMssvKey(student.mssv), student);
    }
  }

  getStudentIdentifier(row) {
    return row.email || row.mssv;
  }

  buildEmailKey(email) {
    return `email:${String(email || "").trim().toLowerCase()}`;
  }

  buildMssvKey(mssv) {
    return `mssv:${String(mssv || "").trim().toLowerCase()}`;
  }

  normalizeHeader(header) {
    return String(header || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
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
}

module.exports = new ImportService();
