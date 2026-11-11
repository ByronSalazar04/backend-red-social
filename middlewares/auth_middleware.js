const jwt = require("jsonwebtoken");

const autenticar = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ status: "error", mensaje: "No se proporcionó token de autenticación" });
    }

    const token = authHeader.replace(/Bearer\s?|^Bearer$/gi, "");
    try {
        const payload = jwt.verify(token, process.env.CLAVE_SECRETA_JWT || "CLAVE_SECRET");
        req.usuario = payload;
        next();
    } catch (error) {
        return res.status(401).json({ status: "error", mensaje: "Token inválido o expirado" });
    }
};

module.exports = { autenticar };