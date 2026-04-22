const { sequelize } = require("./config/database");
const express = require("express");
const app = express();

const { SinhVienLopHoc } = require("./api/models");
require("dotenv").config();

const importRoute = require("./api/routes/index");

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const allowAllOrigins = allowedOrigins.includes("*");

  if (allowAllOrigins) {
    res.header("Access-Control-Allow-Origin", "*");
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Vary", "Origin");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

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