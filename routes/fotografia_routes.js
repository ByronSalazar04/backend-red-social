const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const fotografiaController = require("../controllers/fotografia_controller");
const { autenticar } = require("../middlewares/auth_middleware");

router.get("/fotografias", fotografiaController.obtenerFotografias);
router.get("/fotografias/:id", fotografiaController.obtenerDetalleFotografia);
router.post("/fotografias", autenticar, upload.single("imagen"), fotografiaController.subirFotografia);

module.exports = router;