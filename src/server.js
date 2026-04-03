const { sequelize } = require("./config/database"); 
const express = require('express');
const app = express();

const importRoute = require("./api/routes/index");

// middleware ver1.1
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route
app.use("/api", importRoute);

// test route
app.get("/", (req, res) => {
  res.send("Server đang chạy...");
});

// check DB
async function checkConnection() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối Database thành công! (Sequelize)');
  } catch (error) {
    console.error(' Không thể kết nối Database:', error);
    process.exit(1); 
  }
}

checkConnection();

const port = process.env.PORT || 8080; 
app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
});

//test
console.log("IMPORT ROUTE:", importRoute);