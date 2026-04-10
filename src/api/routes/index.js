const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const importRoute = require("./import.route");
const userRoute=require("./user.route");
const classRoute = require("./class.route");

router.use("/auth", authRoute);
router.use("/import", importRoute);
router.use("/users", userRoute);
router.use("/classes", classRoute);

module.exports = router;