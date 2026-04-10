const authService = require("../services/auth.service");

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