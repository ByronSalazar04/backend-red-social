const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario_controller");

router.post("/auth/registro", usuarioController.registrar);
router.post("/auth/login", usuarioController.login);

module.exports = router;