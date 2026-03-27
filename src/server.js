require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello Qui! Project Node.js đã sẵn sàng.');
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});