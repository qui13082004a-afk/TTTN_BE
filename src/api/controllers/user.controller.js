const userService = require("../services/user.service");

exports.getProfile = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email khong duoc de trong" });
    }

    const profile = await userService.getProfileByEmail(email);
    if (!profile) {
      return res.status(404).json({ message: "Khong tim thay nguoi dung voi email nay" });
    }

    res.json({ profile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.query;
    console.log("Controller received query:", { id });

    if (!id) {
      return res.status(400).json({ message: "ID khong duoc de trong" });
    }

    const profile = await userService.getProfileById(id);
    console.log("Service returned:", profile);

    if (!profile) {
      return res.status(404).json({ message: "Khong tim thay nguoi dung voi ID nay" });
    }

    res.json({ profile });
  } catch (error) {
    console.error("Error in getProfileById:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Controller getStudentById received id:", id);

    if (!id) {
      return res.status(400).json({ message: "ID khong duoc de trong" });
    }

    const student = await userService.getStudentById(id);
    console.log("Service returned student:", student);

    if (!student) {
      return res.status(404).json({ message: "Khong tim thay sinh vien voi ID nay" });
    }

    res.json({ student });
  } catch (error) {
    console.error("Error in getStudentById:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getLecturerById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Controller getLecturerById received id:", id);

    if (!id) {
      return res.status(400).json({ message: "ID khong duoc de trong" });
    }

    const lecturer = await userService.getLecturerById(id);
    console.log("Service returned lecturer:", lecturer);

    if (!lecturer) {
      return res.status(404).json({ message: "Khong tim thay giang vien voi ID nay" });
    }

    res.json({ lecturer });
  } catch (error) {
    console.error("Error in getLecturerById:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({ message: "Loi server" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const result = await userService.changePassword(req.user, req.body);
    res.json(result);
  } catch (error) {
    res.status(error.field ? 400 : 500).json({
      message: error.message,
      field: error.field || null,
    });
  }
};
