const express = require("express");
const cors = require("cors");
require("dotenv").config();

const usuarioRoutes = require("./routes/usuario_routes");
const fotografiaRoutes = require("./routes/fotografia_routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", usuarioRoutes);
app.use("/api", fotografiaRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: "error",
        mensaje: "Ruta no encontrada en la API del Proyecto Final"
    });
});

const PORT = process.env.PORT || 3900;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose correctamente en http://localhost:${PORT}`);
});