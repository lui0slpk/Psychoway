import mysql from "mysql2/promise";
import env from "./environment.js";

/**
 * Pool de conexiones MySQL con API de Promesas.
 * Usa pool en lugar de una sola conexión para mejor rendimiento y resiliencia.
 */
const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Ejecuta una query SQL parametrizada y retorna los resultados.
 * @param {string} sql - Query SQL con placeholders (?)
 * @param {Array} params - Parámetros para la query
 * @returns {Promise<Array>} Resultados de la query
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Ejecuta una query SQL y retorna el ResultSetHeader (para INSERT/UPDATE/DELETE).
 * @param {string} sql - Query SQL con placeholders (?)
 * @param {Array} params - Parámetros para la query
 * @returns {Promise<import('mysql2').ResultSetHeader>}
 */
export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

/**
 * Verifica la conexión a la base de datos.
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conectado a MySQL");
    connection.release();
    return true;
  } catch (err) {
    console.error("❌ Error conectando a la base de datos:", err.message);
    console.log(
      "Asegúrate de que XAMPP/MySQL esté corriendo y la base de datos 'psychoway' exista.",
    );
    return false;
  }
}

export default pool;
