const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const importRoute = require("./import.route");
const userRoute = require("./user.route");
const classRoute = require("./class.route");
const moveRoute = require("./move.route");
const kickRoute = require("./kick_student.route");
const dashboardRoute = require("./dashboard.route");

router.use("/auth", authRoute);
router.use("/import", importRoute);
router.use("/users", userRoute);
router.use("/classes", classRoute);
router.use("/move", moveRoute);
router.use("/kick", kickRoute);
router.use("/dashboard", dashboardRoute);

module.exports = router;
