//const dotenv = require("dotenv");
//dotenv.config();
require("dotenv").config();
console.log(process.env);

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
);
const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connect Success!");
  } catch (err) {
    console.log("Connect Fail", err);
  }
};
module.exports = {
  sequelize,
  connect,
};
