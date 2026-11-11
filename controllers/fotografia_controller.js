const { getConnection, sql } = require("../config/database_sql");
const { subirArchivoS3 } = require("../services/s3_service");
const { procesarTransformaciones } = require("../helpers/image_helper");

const subirFotografia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", mensaje: "Debe incluir una imagen" });
        }

        const usuario_id = req.usuario.id;
        const bufferOriginal = req.file.buffer;
        const timestamp = Date.now();

        // 1. Generar Transformaciones con Sharp
        const { miniaturaBuffer, bnBuffer, sepiaBuffer, escalaBuffer } = await procesarTransformaciones(bufferOriginal);

        // 2. Subir a S3
        const urlOriginal = await subirArchivoS3(bufferOriginal, `original_${timestamp}.jpg`, req.file.mimetype);
        const urlMiniatura = await subirArchivoS3(miniaturaBuffer, `thumb_${timestamp}.jpg`, "image/jpeg");
        const urlBN = await subirArchivoS3(bnBuffer, `trans_bn_${timestamp}.jpg`, "image/jpeg");
        const urlSepia = await subirArchivoS3(sepiaBuffer, `trans_sepia_${timestamp}.jpg`, "image/jpeg");
        const urlEscala = await subirArchivoS3(escalaBuffer, `trans_escala_${timestamp}.jpg`, "image/jpeg");

        // Simulación de detección de rostros con face-api.js / OpenCV (ejemplo: 1 rostro)
        const rostrosDetectados = 1;

        // 3. Guardar en SQL Server
        const pool = await getConnection();
        
        // Guardar Foto Principal
        const resFoto = await pool.request()
            .input("usuario_id", sql.Int, usuario_id)
            .input("url_original", sql.NVarChar, urlOriginal)
            .input("url_miniatura", sql.NVarChar, urlMiniatura)
            .input("rostros_detectados", sql.Int, rostrosDetectados)
            .query(`
                INSERT INTO Fotografias (usuario_id, url_original, url_miniatura, rostros_detectados)
                OUTPUT INSERTED.id
                VALUES (@usuario_id, @url_original, @url_miniatura, @rostros_detectados)
            `);

        const fotoId = resFoto.recordset[0].id;

        // Guardar las 3 transformaciones requeridas
        const transformaciones = [
            { tipo: "blanco_negro", url: urlBN },
            { tipo: "sepia", url: urlSepia },
            { tipo: "escala_reducida", url: urlEscala }
        ];

        for (const t of transformaciones) {
            await pool.request()
                .input("fotografia_id", sql.Int, fotoId)
                .input("tipo_transformacion", sql.NVarChar, t.tipo)
                .input("url_transformada", sql.NVarChar, t.url)
                .query(`
                    INSERT INTO Transformaciones (fotografia_id, tipo_transformacion, url_transformada)
                    VALUES (@fotografia_id, @tipo_transformacion, @url_transformada)
                `);
        }

        return res.status(201).json({
            status: "success",
            mensaje: "Fotografía y transformaciones procesadas y guardadas correctamente",
            fotografia_id: fotoId,
            urls: {
                original: urlOriginal,
                miniatura: urlMiniatura,
                transformaciones
            }
        });

    } catch (error) {
        return res.status(500).json({ status: "error", mensaje: "Error al procesar la fotografía", error: error.message });
    }
};

const obtenerFotografias = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT f.id, f.url_original, f.url_miniatura, f.rostros_detectados, f.fechaSubida,
                   u.id AS usuario_id, u.nombre, u.username
            FROM Fotografias f
            INNER JOIN Usuarios u ON f.usuario_id = u.id
            ORDER BY f.fechaSubida DESC
        `);

        return res.status(200).json({ status: "success", fotografias: result.recordset });
    } catch (error) {
        return res.status(500).json({ status: "error", mensaje: "Error al obtener fotografías" });
    }
};

const obtenerDetalleFotografia = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();

        const resFoto = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT f.id, f.url_original, f.url_miniatura, f.rostros_detectados, f.fechaSubida,
                       u.nombre, u.username
                FROM Fotografias f
                INNER JOIN Usuarios u ON f.usuario_id = u.id
                WHERE f.id = @id
            `);

        if (resFoto.recordset.length === 0) {
            return res.status(404).json({ status: "error", mensaje: "Fotografía no encontrada" });
        }

        const resTrans = await pool.request()
            .input("fotografia_id", sql.Int, id)
            .query("SELECT tipo_transformacion, url_transformada FROM Transformaciones WHERE fotografia_id = @fotografia_id");

        return res.status(200).json({
            status: "success",
            fotografia: resFoto.recordset[0],
            transformaciones: resTrans.recordset
        });
    } catch (error) {
        return res.status(500).json({ status: "error", mensaje: "Error al obtener el detalle" });
    }
};

module.exports = {
    subirFotografia,
    obtenerFotografias,
    obtenerDetalleFotografia
};