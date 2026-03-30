## Desarrollo

Instalación y arranque:

```bash
npm install
npm run dev
```

La app corre por defecto en http://localhost:3000.

## Mercado Pago

La integración implementa configuración manual de cuenta en /admin/mercadopago y generación de checkout link al finalizar el pedido o desde el generador manual del panel.

Configuración requerida:

1. Para usar una sola cuenta ya mismo, cargar MERCADOPAGO_ACCESS_TOKEN y NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY en el entorno.
2. Para permitir configuración manual persistida desde el panel, ejecutar el script [docs/mercadopago-supabase.sql](docs/mercadopago-supabase.sql) en Supabase.
3. Definir NEXT_PUBLIC_APP_URL con la URL pública real de la tienda.

Notas técnicas:

- El access token del vendedor se guarda únicamente del lado servidor usando SUPABASE_SERVICE_ROLE_KEY.
- El frontend nunca accede directo a la tabla de credenciales de Mercado Pago.
- El panel permite pegar manualmente public key y access token del cliente, sin flujo OAuth.
