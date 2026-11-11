const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const generarSaltYHash = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return { salt, hash };
};

const validarPassword = (password, salt, hashGuardado) => {
    const hashCalculado = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hashCalculado === hashGuardado;
};

const generarToken = (usuario) => {
    return jwt.sign(
        { id: usuario.id, username: usuario.username, correo: usuario.correo },
        process.env.CLAVE_SECRETA_JWT || "CLAVE_SECRET",
        { expiresIn: "30d" }
    );
};

module.exports = {
    generarSaltYHash,
    validarPassword,
    generarToken
};