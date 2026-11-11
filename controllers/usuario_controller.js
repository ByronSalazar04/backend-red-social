const { getConnection, sql } = require("../config/database_sql");
const { generarSaltYHash, validarPassword, generarToken } = require("../helpers/auth_helper");

const registrar = async (req, res) => {
    try {
        const { nombre, correo, username, password, google_id } = req.body;
        const pool = await getConnection();

        let salt = null;
        let password_hash = null;

        if (password) {
            const resSeguridad = generarSaltYHash(password);
            salt = resSeguridad.salt;
            password_hash = resSeguridad.hash;
        }

        const result = await pool.request()
            .input("nombre", sql.NVarChar, nombre)
            .input("correo", sql.NVarChar, correo)
            .input("username", sql.NVarChar, username)
            .input("password_hash", sql.NVarChar, password_hash)
            .input("salt", sql.NVarChar, salt)
            .input("google_id", sql.NVarChar, google_id || null)
            .query(`
                INSERT INTO Usuarios (nombre, correo, username, password_hash, salt, google_id)
                OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.username, INSERTED.correo
                VALUES (@nombre, @correo, @username, @password_hash, @salt, @google_id)
            `);

        const usuarioCreado = result.recordset[0];
        const token = generarToken(usuarioCreado);

        return res.status(201).json({
            status: "success",
            mensaje: "Usuario registrado con éxito",
            usuario: usuarioCreado,
            token
        });
    } catch (error) {
        return res.status(400).json({ status: "error", mensaje: "Error al registrar usuario", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const pool = await getConnection();

        const result = await pool.request()
            .input("correo", sql.NVarChar, correo)
            .query("SELECT * FROM Usuarios WHERE correo = @correo");

        const usuario = result.recordset[0];
        if (!usuario) {
            return res.status(404).json({ status: "error", mensaje: "Usuario no encontrado" });
        }

        if (usuario.password_hash && usuario.salt) {
            const esValido = validarPassword(password, usuario.salt, usuario.password_hash);
            if (!esValido) {
                return res.status(400).json({ status: "error", mensaje: "Contraseña incorrecta" });
            }
        }

        const token = generarToken(usuario);

        return res.status(200).json({
            status: "success",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                username: usuario.username,
                correo: usuario.correo
            }
        });
    } catch (error) {
        return res.status(500).json({ status: "error", mensaje: "Error en inicio de sesión" });
    }
};

module.exports = { registrar, login };