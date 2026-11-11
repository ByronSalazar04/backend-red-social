const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'RedSocialInstagram',
  port: process.env.DB_PORT || 3306
};

// Crear pool de conexiones para manejo eficiente
const pool = mysql.createPool(dbConfig);

const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a MySQL en AWS realizada con éxito');
    connection.release();
    return pool;
  } catch (error) {
    console.error('Error al conectar a MySQL:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  getConnection
};