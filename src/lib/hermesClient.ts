import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.HERMES_HOST,
  user: process.env.HERMES_USER,
  password: process.env.HERMES_PASSWORD,
  database: process.env.HERMES_DATABASE,
  port: Number(process.env.HERMES_PORT),
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export function getHermesPool() {
  return pool;
}

export async function getHermesProducts() {
  const [rows] = await pool.query('SELECT * FROM vista_articulos');
  return rows;
}