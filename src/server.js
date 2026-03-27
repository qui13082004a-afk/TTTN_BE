const { sequelize } = require("./config/database"); 
const express = require('express');
const app = express();

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