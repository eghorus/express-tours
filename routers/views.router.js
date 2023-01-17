const express = require("express");
const viewsControllers = require("../controllers/views.controllers");

const router = express.Router();

router.get("/", viewsControllers.getHome);

module.exports = router;
