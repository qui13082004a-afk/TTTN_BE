const bcrypt = require("bcrypt");
const sinhVienRepo = require("../repositories/sinhVien.repository");

class AuthService {
  async login(email, password) {
    const user = await sinhVienRepo.findByEmail(email);
    if (!user) throw new Error("Sai email");

    const isMatch = await bcrypt.compare(password, user.mat_khau);
    if (!isMatch) throw new Error("Sai mật khẩu"); 

    return user;
  }
}

module.exports = new AuthService();