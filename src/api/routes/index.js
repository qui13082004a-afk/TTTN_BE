const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const importRoute = require("./import.route");

router.use("/auth", authRoute);
router.use("/import", importRoute);

module.exports = router;