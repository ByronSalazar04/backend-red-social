const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock_key",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock_secret"
    }
});

const subirArchivoS3 = async (buffer, fileName, mimeType) => {
    // Si aún no tienes bucket configurado, retorna una URL simulada
    if (!process.env.AWS_BUCKET_NAME || process.env.AWS_BUCKET_NAME === "tu-bucket-s3-instagram") {
        return `https://s3.amazonaws.com/mock-bucket/${fileName}`;
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: mimeType
    };

    await s3Client.send(new PutObjectCommand(params));
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

module.exports = {
    subirArchivoS3
};