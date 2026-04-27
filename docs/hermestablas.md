comprob_Ventas:
  NroEmp=2
  Codigo= max(Codigo)+1
  NroCli= contactos.NroCon (si no existe hay que crear el cliente en la tabla contactos)
  Nombre= Nombre del cliente
  Provin=1 (provincia=bs. as.)
  Cuit
  CatIva= 1=responsable inscripto - 4=consumidor final - 7=monotributo
  TipRub=0
  FecOpe= Fecha de operación
  FecDif= Fecha de vencimiento
  CodDGR=0
  TipOpe=1
  TipCom=7 (comprobante interno no factura)
  Letra= 'X'
  Compro='0009-00000001' (formato 0009- 8 digitos para el numero de comprobante)
  Observ= texto libre (podemos hacer que el cliente escriba alguna observacion desde la pagina)
  OpeExe=0
  IvaIn1=Neto 21%
  IvaIn2=0
  IvaIn3=0
  IvaIn4=0
  IvaIn5=0
  DebFis=IVA
  IvaRni=0
  ReTope=0
  PerIva=0
  RetIva=0
  RetIng=0
  ImpInt=Impuestos internos
  NoGrav=0
  Varios=0
  TotOpe= Total del comprobante
  ImpRes=0
  ImpIva=0
  TipMov=0
  Cancel=1
  NombPC='WEB'
  Moneda=0
  RetSUS=0
  RetGan=0
  Imputa=0
  PerIng=0
  FecReg= Fecha de registro con hora (Ej: 22/04/2026 13:45)
  ModReg='W'
  RetMun=0
  TotITC=0
  ImpCO2=0
  Cotiza=1
------------------------------------------------------------------------------------

Comprobantes:
  Codigo=comprob_Ventas.Codigo
  NroVen= Vendedor (preguntar que vendedor asignamos. Si no poner valor 0)
  NroFac=0
  Domici=domicilio cliente
  Locali= codigo postal + localidad del cliente (Ej: (8000) Bahía Blanca)
  PorDes=0
  CarFin=0
  Remito=''
  Condic=''
  OrdenC=''
  TipFle=0
  ValDec=''
  Bultos=''
  fEnvio=''
  mPagos=''
  Puerto=''
  TotFle=0
  Seguro=0
  NroTra=0
  NomCon=''
  Valide=''
  Entreg=''
  NroEmp=2
  NroCar=0
  Comis1=0
  ObsCo1=''
  Comis2=0
  ObsCo2=''
------------------------------------------------

items_comprobantes:
  Codigo=comprob_Ventas.Codigo
  OrdImp=Orden de impresion (numerar 0,1,2,3,...)
  CodArt=Codigo articulo
  Cantid=Cantidad
  Descri=Descripcion
  NroLis=0
  PreUni=Precio neto unitario
  Descue=0
  PorDes=0
  OpeExe=0
  NetoGr=PreUni*Cantid
  DebFis=IVA total del item
  IvaRni=0
  PerIva=0
  RetIva=0
  RetIng=0
  ImpInt=0
  pCosto=precio de costo del articulo
  ColAdi=''
  TabIva=1
  NroEmp=2
  PrFijo=0
  TotITC=0
  ImpCO2=0
  PorUni=0
------------------------------------------------------------------

movimientos_stk:
  Codigo=Codigo del articulo
  FecMov=Fecha del movimiento
  NroCon=Nro cliente
  Nombre=Nombre cliente
  TipDes=0
  TipMov=2
  CodCom=comprob_Ventas.Codigo
  Compro=Comprobante (Ej: 'DI X 0009-00000001')
  Cantid=Cantidad
  PreUni=Precio unitario sin iva
  TipDep=0
  OrdenC=''
  Confor=0
  Observ=''
  NroEmp=2
  Clave=autonumerico (si lo dejas en null creo que se completa solo)
  NroUsu=0
  Bultos=0
----------------------------------------------------------------------------------------

pagos:
  NroEmp=2
  Codigo=max(Codigo)+1
  CodVta=comprob_Ventas.Codigo
  CodCra=0
  FecPag=Fecha de pago

----------------------------------------------------------------------------------------

pagos_detalle:
  NroEmp=2
  Codigo=pagos.Codigo
  TipPag= 1=Efectivo - 6=pago electrónico
  ImpPag=Importe del pago
  CodChe= Si es efectivo va en 0. Si TipPag=6 va tipo_tarjetas.Codigo
  CodAsi=0
  Clave=null
