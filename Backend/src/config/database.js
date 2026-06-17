import pg from "pg";
import env from "./environment.js";

const { Pool } = pg;

/**
 * Pool de conexiones PostgreSQL (Supabase).
 * Usa la connection string directa de Supabase (Session Mode, puerto 5432).
 */
const pool = new Pool({
  connectionString: env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Ejecuta una query SQL parametrizada y retorna los resultados como array.
 * Los placeholders deben ser $1, $2, ... (sintaxis PostgreSQL).
 * @param {string} sql - Query SQL con placeholders ($1, $2, ...)
 * @param {Array} params - Parámetros para la query
 * @returns {Promise<Array>} Filas resultado
 */
export async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

/**
 * Ejecuta una query de mutación (INSERT/UPDATE/DELETE) y retorna el resultado completo.
 * Para INSERT usa RETURNING para obtener el id insertado.
 * @param {string} sql - Query SQL con placeholders ($1, $2, ...)
 * @param {Array} params - Parámetros para la query
 * @returns {Promise<import('pg').QueryResult>} Resultado completo de pg
 */
export async function execute(sql, params = []) {
  const result = await pool.query(sql, params);
  return result;
}

/**
 * Verifica la conexión a Supabase/PostgreSQL.
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Conectado a Supabase (PostgreSQL)");
    client.release();
    return true;
  } catch (err) {
    console.error("❌ Error conectando a Supabase:", err.message);
    console.log("Verifica que SUPABASE_DB_URL esté correctamente configurado en .env");
    return false;
  }
}

export default pool;
