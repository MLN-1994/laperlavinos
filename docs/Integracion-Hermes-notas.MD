##
1. Instala el cliente MySQL:
 npm install mysql2

2. Variables creades en .env.local:

HERMES_HOST=
HERMES_USER=
HERMES_PASSWORD=
HERMES_DATABASE=
HERMES_PORT=



3. Crea el cliente de conexión en el backend:

Crea src/lib/hermesClient.ts:

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

export async function getHermesProducts() {
  const [rows] = await pool.query('SELECT * FROM vista_articulos');
  return rows;
}

# (Solo importa y usa este cliente en código backend (API routes, server actions, scripts). Nunca en componentes React ni hooks.)

4. Crea una API Route en Next.js

import { NextResponse } from 'next/server';
import { getHermesProducts } from '@/lib/hermesClient';

export async function GET() {
  try {
    const products = await getHermesProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}

# Así el frontend nunca ve las credenciales ni accede directo a MySQL.

5. Buenas prácticas

Nunca expongas credenciales ni lógica MySQL en el frontend.
Solo usa el cliente y las variables en el backend (API routes, server actions).
Maneja errores y no devuelvas detalles sensibles al frontend.
Usa un pool de conexiones para eficiencia.
Agrega .env.local a .gitignore.
Si subes a producción, usa variables de entorno seguras en el hosting.

6. Siguiente paso

Implementa la tabla de productos publicados en Supabase para guardar los IDs seleccionados.
El panel admin permite seleccionar/deseleccionar productos para la web.
Al mostrar productos en la tienda, filtra usando los IDs guardados en Supabase, pero la info de stock, precio, etc. siempre viene en tiempo real desde Hermes.
Resumen del flujo

Traes todos los productos desde Hermes (vista_articulos).
En Supabase guardas los IDs de los productos seleccionados para la web.
El admin de la web permite elegir qué productos mostrar.
El frontend pide los productos publicados, y para cada uno consulta los datos frescos a Hermes.


## a mejorar panel ADMIN
Mejorar la experiencia de usuario:

Agrega paginación o scroll infinito si hay muchos productos.
Muestra loaders claros durante operaciones (publicar/quitar).
Agrega confirmaciones para acciones destructivas (ej: quitar producto).
Robustecer validaciones:

Valida los datos antes de publicar (campos requeridos, imagen seleccionada, etc).
Muestra mensajes de error claros y útiles.
Modulariza y ordena:

Centraliza hooks en src/hooks/.
Crea un layout para admin en src/app/admin/layout.tsx.
Separa lógica de imágenes/publicación en hooks o utils propios.
Mejora el manejo de estado:

Si el panel crece, considera Zustand o Context para estado global (por ahora, useState está bien si es simple).
Documenta:

Agrega comentarios y un README para el panel admin.
Documenta los flujos principales y dependencias.
Prepara para el futuro:

Deja TODOs o comentarios donde irá la auth/roles.
Revisa las policies de Supabase antes de producción.