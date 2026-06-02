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
  connectTimeout: 5000, // 5 segundos máximo para conectar
});

export function getHermesPool() {
  return pool;
}

const HERMES_TIMEOUT_MS = 5000;

/** Fila cruda que devuelve vista_articulos. Agregar campos si la vista los expone. */
export interface HermesRawRow {
  Codigo: number | string;
  Descripcion: string | null;
  Precio: number | string | null;
  Stock: number | string | null;
  Grupo: string | null;
  Marca: string | null;
}

export async function getHermesProducts() {
  const queryPromise = pool.query('SELECT * FROM vista_articulos').then(([rows]) => rows);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Hermes timeout')), HERMES_TIMEOUT_MS)
  );
  return Promise.race([queryPromise, timeoutPromise]);
}

/** Igual que getHermesProducts pero devuelve tipado fuerte. */
export async function fetchAllHermesRows(timeoutMs = HERMES_TIMEOUT_MS): Promise<HermesRawRow[]> {
  const queryPromise = pool
    .query<mysql.RowDataPacket[]>('SELECT Codigo, Descripcion, Precio, Stock, Grupo, Marca FROM vista_articulos')
    .then(([rows]) => rows as HermesRawRow[]);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Hermes timeout')), timeoutMs)
  );
  return Promise.race([queryPromise, timeoutPromise]);
}