const userService = require("../services/user.service");

exports.getProfile = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email không được để trống" });
    }

    const profile = await userService.getProfileByEmail(email);
    if (!profile) {
      return res.status(404).json({ message: "Không tìm thấy người dùng với email này" });
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
      return res.status(400).json({ message: "ID không được để trống" });
    }

    const profile = await userService.getProfileById(id);
    console.log("Service returned:", profile);

    if (!profile) {
      return res.status(404).json({ message: "Không tìm thấy người dùng với ID này" });
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
      return res.status(400).json({ message: "ID không được để trống" });
    }

    const student = await userService.getStudentById(id);
    console.log("Service returned student:", student);

    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên với ID này" });
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
      return res.status(400).json({ message: "ID không được để trống" });
    }

    const lecturer = await userService.getLecturerById(id);
    console.log("Service returned lecturer:", lecturer);

    if (!lecturer) {
      return res.status(404).json({ message: "Không tìm thấy giảng viên với ID này" });
    }

    res.json({ lecturer });
  } catch (error) {
    console.error("Error in getLecturerById:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // Thông tin user đã được middleware authenticateToken gán vào req.user
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};