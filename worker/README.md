# Servicio de enlaces para WhatsApp

## Qué hace
El Worker guarda los datos del enlace en Cloudflare KV y entrega una página HTML individual con etiquetas Open Graph. Esto permite que WhatsApp lea título, descripción e imagen desde el servidor.

## Requisitos
- Cuenta gratuita de Cloudflare.
- Un Worker.
- Un espacio KV llamado exactamente `ENLACES`.

## Publicación manual inicial
1. En Cloudflare abre **Workers & Pages** y crea un Worker.
2. Entra a **Edit code** y reemplaza el contenido por el archivo `worker.js` de esta carpeta.
3. Publica el Worker.
4. En el Worker abre **Settings > Bindings > Add > KV namespace**.
5. Crea un namespace llamado `ENLACES` y vincúlalo con la variable/binding `ENLACES`.
6. Guarda y vuelve a desplegar si Cloudflare lo solicita.
7. Copia la dirección pública que termina en `.workers.dev`.

## Conectar la interfaz
En `js/config.js`, cambia `PENDIENTE_CONFIGURAR_CLOUDFLARE` por la dirección completa del Worker, por ejemplo:
`https://nombre-del-worker.tu-cuenta.workers.dev`
No agregues una diagonal al final.

## Publicar la interfaz
Activa GitHub Pages en el repositorio: **Settings > Pages > Deploy from a branch > main > /(root) > Save**. La web quedará en la dirección GitHub Pages del repositorio.

## Prueba
1. Abre la web publicada desde el teléfono.
2. Crea un enlace con título, descripción, URL original e imagen pública.
3. Pega el enlace generado en un chat de WhatsApp.
4. Espera a que aparezca la tarjeta; envíala y verifica desde otro teléfono.

## Importante
- La imagen debe ser pública y accesible sin iniciar sesión. Un enlace local del teléfono no sirve como imagen de vista previa.
- El enlace de destino conserva sus permisos originales. Si el archivo de Drive es privado, el cliente necesitará autorización de Google.
- La tarjeta es una vista previa; no convierte un archivo privado en público.
- WhatsApp decide cuándo y cómo muestra las vistas previas. La prueba real en WhatsApp es indispensable.
- El servicio no solicita contraseñas ni tokens.
