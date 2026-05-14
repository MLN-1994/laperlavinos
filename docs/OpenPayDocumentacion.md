PASO ACCESO OPENPAY(BBVA) 
Mail: Adm.laperlabah@gmail.com
Clave: Patagonia26+



Cómo empezar
A continuación repasaremos los pasos previos que deberás tener en cuenta para realizar la integración de nuestras
soluciones de pago.

Solicitud de credenciales
Para pedir tus credenciales contactate con nosotros y contanos de tu negocio.

Construye tu integración
Ahora que contamos con las credenciales podemos avanzar con la integración.

Lo primero que debes hacer es elegir qué solución quieres implementar teniendo en cuenta las necesidades del negocio.

Requisitos para integar
Credenciales
Para comenzar a trabajar con nuestra API para generar links de pago deberás contar con tus credenciales de acceso. Las
mismas están compuestas por:

client_id Clave pública de la aplicación. Debes usarla solo para tus integraciones.
client_secret Clave privada de la aplicación para generar pagos. Debes usarla solo para tus integraciones. Recuerda que no debes compartirla ni utilizarla fuera del servidor.
base_url Consultar en la sección Ambientes/Auth Server.
Obtener el token (JWT)
Con el client ID y la secret podemos solicitar al servicio de autenticación un JWT que nos permita
interactuar con la API de Checkout.

<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '{base_url}/oauth/token',
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "grant_type": "client_credentials",
    "client_id": "XXXXXXX-XXX-XXXX-XXX-XXXXXXXXXXXX",
    "client_secret": "XXXXXXXXXX",
    "scope": "*"
  }',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
Nos va a devolver un JSON con los siguientes datos:

{
"token_type": "Bearer",
"expires_in": "3600",
"access_token":"xxxxxxxxxxxxx",
"refresh_token":"xxxxxxxxxxxxx"
}
El atributo que vamos a utilizar para las próximas interacciones con las APIs será access_token

Integración Checkout
Integrar Openpay Checkout te permite cobrar a través de nuestro formulario web desde cualquier dispositivo
de manera simple, rápida y segura.

1. Generar intención de pago
Este paso deberás realizarlo desde tu backend.

Si todavía no generaste el JWT para autenticarte podés ver la
sección Requisitos para integrar

A través de un POST a {base_url}/api/v2/orders se creará la intención de pago.

Consultar {base_url} en la sección Ambientes/Checkout.

<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '{base_url}/api/v2/orders',
  CURLOPT_CUSTOMREQUEST => 'POST',  
  CURLOPT_POSTFIELDS =>'{
    "data": {
        "attributes": {
            "currency": "032",
            "items": [
                {
                    "id": 1,
                    "name": "Chicken roll",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 110000
                    },
                    "quantity": 1
                },
                {
                    "id": 3,
                    "name": "Porto cheese burger",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 120000
                    },
                    "quantity": 2
                }
            ]
        }
    }
}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/vnd.api+json',
    'Accept: application/vnd.api+json',
    'Authorization: Bearer {reemplazar_por_jwt}'
  ),
));

$response = curl_exec($curl);

$order = json_decode($response);

curl_close($curl);
2. Agregá el Checkout a tu sitio
Con la intención de pago generada en el paso anterior, en tu frontend puedes agregar el link del Checkout en tu sitio en
el lugar que quieras que aparezca.

<!doctype html>
<html>
  <head>
    <title>Pagar</title>
  </head>
  <body>
    <a href="<?php echo $order->data->links->checkout; ?>">Pagar con Openpay</a>
  </body>
</html>
Recorda que la intencion de pago tiene una duracion de 10 minutos.
3. Pago
Ya terminamos la integración. Ahora el comprador podrá continuar con el flujo en nuestro Checkout web.

Estado de la orden
Cuando se integra Openpay Checkout se genera una intención de pago (entidad Order)

Esta intención es la que luego en el checkout se procede a pagar.

Se puede consultar el estado de la misma para ver si tiene un pago aprobado asociado y si el mismo se encuentra aprobado.

1. Primero generar intención de pago
Este paso deberás realizarlo desde tu backend.

Ya detallado en un paso anterior Integración Checkout

2. Consultar el estado de la intención creada
Se debe reemplazar el valor {reemplazar_por_uuid} por el UUID de la intención de pago generada en el paso anterior.

Consultar {base_url} en la sección Ambientes/Checkout.

A través de un GET a {base_url}/api/v2/orders/{reemplazar_por_uuid} se consultará el estado de la intención de pago.

<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '{base_url}/api/v2/orders/{reemplazar_por_uuid}',
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/vnd.api+json',
    'Accept: application/vnd.api+json',
    'Authorization: Bearer {reemplazar_por_jwt}'
  ),
));

$response = curl_exec($curl);

$order = json_decode($response);

curl_close($curl);
Dentro de la variable $order tendremos un json con la intención de pago con la siguiente estructura:

{
    "data": {
        "id": "/api/v2/orders/0b7f233a-c5ca-4968-9b72-40a239f80355",
        "type": "Order",
        "attributes": {
            "uuid": "0b7f233a-c5ca-4968-9b72-40a239f80355",
            "source": "order_source_example",
            "appId": "Openpay",
            "paymentLimits": 1,
            "orderNumber": "00000001-0000000012",
            "price": {
                "currency": "032",
                "amount": 42
            },
            "shipping": null,
            "items": [
                {
                    "name": "",
                    "quantity": 1,
                    "unitPrice": {
                        "currency": "032",
                        "amount": 42
                    },
                    "itemId": null
                }
            ],
            "status": "SUCCESS",
            "taxes": [],
            "links": {
                "checkout": "{base_url}/orders/0b7f233a-c5ca-4968-9b72-40a239f80355",
                "redirect_url": {
                    "success": null,
                    "failed": null
                }
            },
            "hasPendingPayment": false,
            "payment": {
                "id": 123,
                "authorization_code": "012345",
                "reference_number": "62d6c4784212b",
                "status": "APPROVED"
            },
            "payments": [
                {
                    "id": 123,
                    "authorization_code": "012345",
                    "reference_number": "62d6c4784212b",
                    "status": "APPROVED"
                }
            ]
        },
        "links": [
            {
                "checkout": "{base_url}/orders/0b7f233a-c5ca-4968-9b72-40a239f80355",
                "redirect_url": {
                    "success": null,
                    "failed": null
                }
            }
        ]
    }
}

Integración avanzada
Las siguientes características son opcionales y las podés utilizar en tus integraciones.

Para hacer un uso correcto de la API consultar base_url en la sección Ambientes/Checkout.

Monto del envío
Al crear una orden desde el endpoint api/v2/orders, tenes la posibilidad de sumar el costo del envío y mostrarlo como un ítem dentro del detalle de elementos.

Configuración
Para configurarlo, basta con agregar el nodo shipping con el nombre name y el sub nodo price con el valor del monto del envío y la moneda a utilizar.

"shipping": {
    "name": "Envio por Correo Argentino",
    "price": {
        "currency": "032",
        "amount": 601
    }
}
Detalles
Field Name	Details
name	type="string", length=63, nullable=true
currency	type="string", length=3, nullable=false
amount	type="integer"
Ejemplo
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '{base_url}/api/v2/orders',
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "data": {
        "attributes": {
            "currency": "032",
            "items": [
                {
                    "id": 1,
                    "name": "Chicken roll",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 110000
                    },
                    "quantity": 1
                },
                {
                    "id": 3,
                    "name": "Porto cheese burger",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 120000
                    },
                    "quantity": 2
                }
            ],
            "shipping": {
                "name": "Envio por Correo Argentino",
                "price": {
                    "currency": "032",
                    "amount": 15000
                }
            }
        }
    }
}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/vnd.api+json',
    'Accept: application/vnd.api+json',
    'Authorization: Bearer {reemplazar_por_jwt}'
  ),
));

$response = curl_exec($curl);

$order = json_decode($response);

curl_close($curl);
URL de retorno
Al finalizar el proceso de pago, tienes la opción de redireccionar al comprador tanto para pagos aprobados como para pagos rechazados.

Configuracion
Esta característica da la opción de sumar el nodo redirect_urls y definir dentro un link para success y un link para failed.

"redirect_urls": {
    "success": "https://www.mitienda.com/success",
    "failed": "https://www.mitienda.com/failed"
}
Detalles
Field Name	Details
success	type="string", length=255, nullable=true
failed	type="string", length=255, nullable=true
Ejemplo
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '{base_url}/api/v2/orders',
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "data": {
        "attributes": {
            "currency": "032",
            "items": [
                {
                    "id": 1,
                    "name": "Chicken roll",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 110000
                    },
                    "quantity": 1
                },
                {
                    "id": 3,
                    "name": "Porto cheese burger",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 120000
                    },
                    "quantity": 2
                }
            ],
            "redirect_urls": {
                "success": "https://www.mitienda.com/success",
                "failed": "https://www.mitienda.com/failed"
            }
        }
    }
}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/vnd.api+json',
    'Accept: application/vnd.api+json',
    'Authorization: Bearer {reemplazar_por_jwt}'
  ),
));

$response = curl_exec($curl);

$order = json_decode($response);

curl_close($curl);
Webhook URL
Sirve para que al momento de finalizar un pago, notifiquemos el estado del mismo.

Configuracion
Simplemente agregar la key webhookUrl en la raíz de attributes y colocar la URL al cual enviaremos la notificación.

"webhookUrl": "https://www.google.com/?q=soyunhook"
Detalles
Field Name	Details
webhookUrl	type="string", length=255, nullable=true
Ejemplo
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '{base_url}/api/v2/orders',
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "data": {
        "attributes": {
            "currency": "032",
            "items": [
                {
                    "id": 1,
                    "name": "Chicken roll",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 110000
                    },
                    "quantity": 1
                },
                {
                    "id": 3,
                    "name": "Porto cheese burger",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 120000
                    },
                    "quantity": 2
                }
            ],
            "redirect_urls": {
                "success": "https://www.mitienda.com/success",
                "failed": "https://www.mitienda.com/failed"
            },
            "webhookUrl": "https://webhook.com",
        }
    }
}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/vnd.api+json',
    'Accept: application/vnd.api+json',
    'Authorization: Bearer {reemplazar_por_jwt}'
  ),
));

$response = curl_exec($curl);

$order = json_decode($response);

curl_close($curl);
Ejemplo de POST al WebHook
{
  "data": {
    "type": "Payment",
    "order": {
      "uuid": "ea138a99-c9df-44a5-b2bf-09e5db6f8d0c",
      "status": "SUCCESS",
      "source": "app_payment_link"
    },
    "payment": {
      "id": 1823,
      "authorizationCode": "901159",
      "refNumber": "62b4a8ff60fee",
      "status": "APPROVED"
    }
  }
}

expireLimitMinutes
Establece un tiempo limite para realizar el pago. Una vez vencido dicho tiempo, el pago ya no podrá realizarse.

Configuracion
Agregar la key expireLimitMinutes en la raíz de attributes y colocar el valor expresado en minutos.

"expireLimitMinutes": 14400
Detalles
Field Name	Details
expireLimitMinutes	type="integer"
Ejemplo
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '{base_url}/api/v2/orders',
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "data": {
        "attributes": {
            "currency": "032",
            "items": [
                {
                    "id": 1,
                    "name": "Chicken roll",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 110000
                    },
                    "quantity": 1
                },
                {
                    "id": 3,
                    "name": "Porto cheese burger",
                    "unitPrice": {
                        "currency": "032",
                        "amount": 120000
                    },
                    "quantity": 2
                }
            ],
            "expireLimitMinutes": 14400,
        }
    }
}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/vnd.api+json',
    'Accept: application/vnd.api+json',
    'Authorization: Bearer {reemplazar_por_jwt}'
  ),
));

$response = curl_exec($curl);

$order = json_decode($response);

curl_close($curl);