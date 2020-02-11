const express = require("express");
const auth = require("./auth");
const user = require("./user");

let router = express.Router();
module.exports = router;

router.use("/auth", auth);
router.use("/user", user);