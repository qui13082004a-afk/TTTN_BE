const authService = require("../services/auth.service");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    res.json({ message: "Đăng nhập thành công", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};