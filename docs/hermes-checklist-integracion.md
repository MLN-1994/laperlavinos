# Checklist de preguntas para integración Hermes

1. **Mecanismo de escritura**
   - ¿La integración debe hacerse mediante SQL directo, stored procedure, o alguna rutina interna de Hermes?
   - ¿Hay validaciones o triggers que deban respetarse al insertar comprobantes desde la web?

   > Respuesta: Se espera que la integración se realice mediante inserciones SQL directas en las tablas indicadas (no se requiere stored procedure ni rutina interna, salvo que se indique lo contrario). Debes construir los INSERTs respetando la lógica de claves y relaciones (ej: max(Codigo)+1, crear cliente si no existe).

2. **Descuento de stock**
   - ¿El stock se descuenta automáticamente al registrar el comprobante de venta, o hay que ejecutar otro proceso/manual?
   - ¿Qué tabla o proceso controla el stock disponible tras la venta?

   > Respuesta: El stock solo se descuenta automáticamente cuando insertas el registro correspondiente en la tabla `movimientos_StK`. Es necesario insertar en esta tabla para que el stock se actualice tras la venta.

3. **Clientes**
   - Si el cliente no existe en la tabla `contactos`, ¿es válido usar el cliente 0 para ventas web, o siempre hay que crear el cliente primero?
   - ¿Qué datos mínimos requiere un cliente nuevo para ser creado desde la web?

   > Respuesta parcial: Según la documentación técnica (hermestablas.md), si el cliente no existe en la tabla `contactos`, hay que crearlo antes de registrar la venta. No se sugiere usar el cliente 0 para ventas web. Sin embargo, la documentación no especifica qué campos mínimos son obligatorios para crear un nuevo cliente, por lo que esta respuesta es incompleta y requiere validación adicional con el responsable de Hermes o revisión de la estructura de la tabla `contactos`.

4. **Vendedor**
   - ¿Qué valor debe asignarse en `NroVen` para ventas web? ¿Existe un vendedor genérico o debe usarse 0?

   > Respuesta: Si no hay un vendedor específico para ventas web, se debe asignar `NroVen = 0`. Esta es una práctica estándar para ventas automáticas o sin responsable directo. Si en el futuro se define un vendedor genérico para la web, se debe usar ese valor. Es importante validar y documentar esta decisión con administración o el responsable de Hermes.

5. **Entorno de pruebas**
   - ¿Existe una base de pruebas o entorno seguro para validar la integración antes de operar en producción?
   - ¿Se puede hacer rollback o revertir comprobantes de prueba?

6. **Observaciones y trazabilidad**
   - ¿Hay algún campo recomendado para dejar trazabilidad de origen web (además de `NombPC='WEB'` y `ModReg='W'`)?
   - ¿Algún valor especial a usar en `Observ` para identificar ventas web?

7. **Confirmación de circuito**
   - ¿Este procedimiento es suficiente para que la venta quede registrada y el stock actualizado, o falta algún paso adicional?

   > Respuesta parcial: Para registrar correctamente una venta web y actualizar el stock, es necesario insertar en al menos tres tablas: `comprob_Ventas`, `Comprobantes` y `movimientos_StK`. Si no insertas en `movimientos_StK`, el stock no se descuenta.

---

Este checklist busca asegurar que la integración sea segura, alineada con el circuito oficial y evite inconsistencias en Hermes.