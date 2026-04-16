const authService = require("../services/auth.service");

exports.registerLecturer = async (req, res) => {
  try {
    const { ho_ten, email, password } = req.body;
    const lecturer = await authService.registerLecturer({ ho_ten, email, password });

    res.status(201).json({
      message: "Tạo tài khoản giảng viên thành công",
      lecturer,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      message: "Đăng nhập thành công",
      user: result.user,
      token: result.token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
