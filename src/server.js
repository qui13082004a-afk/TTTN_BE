const { sequelize } = require("./config/database");
const express = require("express");
const app = express();
const { SinhVienLopHoc } = require("./api/models");

const importRoute = require("./api/routes/index");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.use("/api", importRoute);

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`>>> Server đang chạy tại port: ${PORT}`);

  try {
    await sequelize.authenticate();
    await SinhVienLopHoc.sync();
    console.log("Kết nối Database thành công! (Sequelize)");
  } catch (error) {
    console.error("Không thể kết nối Database:", error);
  }
});
