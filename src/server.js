const { sequelize } = require("./config/database"); 
const express = require('express');
const app = express();

const importRoute = require("./api/routes/index");

// middleware ver1.1
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route
app.use("/api", importRoute);

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

const PORT = process.env.PORT; 
app.listen(PORT, "0.0.0.0", () => {
  console.log(`>>> Server đang chạy tại port: ${PORT}`);
});
console.log("IMPORT ROUTE:", importRoute);