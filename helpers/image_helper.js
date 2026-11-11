const sharp = require("sharp");

// Procesa miniaturas y transformaciones automáticas (Simulación de Lambda / Sharp)
const procesarTransformaciones = async (buffer) => {
    // 1. Miniatura (Thumbnail)
    const miniaturaBuffer = await sharp(buffer)
        .resize(200, 200, { fit: "cover" })
        .toBuffer();

    // 2. Blanco y Negro
    const bnBuffer = await sharp(buffer)
        .grayscale()
        .toBuffer();

    // 3. Sepia
    const sepiaBuffer = await sharp(buffer)
        .recomb([
            [0.393, 0.769, 0.189],
            [0.349, 0.686, 0.168],
            [0.272, 0.534, 0.131]
        ])
        .toBuffer();

    // 4. Reducción de escala (Resized 50%)
    const escalaBuffer = await sharp(buffer)
        .resize({ width: 500 })
        .toBuffer();

    return {
        miniaturaBuffer,
        bnBuffer,
        sepiaBuffer,
        escalaBuffer
    };
};

module.exports = {
    procesarTransformaciones
};