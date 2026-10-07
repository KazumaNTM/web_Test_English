
Regla de oro: `app.js` no conoce el contenido ni el disco; `banco.js`
no contiene lógica; `memoria.js` es la única vía de persistencia.

Si al abrir la página aparece un banner rojo indicando archivos que
faltan, significa que algún archivo no está en su carpeta correcta.

## Uso local (PC)

Doble clic en `index.html`. Todo funciona: test, memoria, temas.
El botón QR detectará `file://` y mostrará una guía (ver más abajo).

## Uso en el iPhone

Opción A — QR con servidor local (en casa, mismo Wi-Fi):
1. En la carpeta del proyecto: `python -m http.server 8000`
2. Abre `http://TU-IP-LOCAL:8000` en el PC (la IP se ve con `ipconfig`)
3. Pulsa el botón QR, introduce la IP en el campo y escanea con el iPhone

Opción B — GitHub Pages (desde cualquier lugar):
1. Sube la carpeta a un repositorio tuyo
2. Settings → Pages → Branch: main → Save
3. Tu URL: `https://TU-USUARIO.github.io/NOMBRE-REPO/`
4. El QR funcionará directamente con esa URL

## Cambiar de material (nuevo banco de preguntas)

Adjunta tu nuevo documento (PDF, apuntes…) en un chat y pide:
"Genera un js/banco.js con este contrato" — luego reemplaza el archivo.
El sitio se adapta solo: número de preguntas, secciones, letras y colores.

Contrato del banco:

```js
const BANCO = {
  meta: {
    id: "identificador-unico-v1",
    titulo: "…", subtitulo: "…",
    descripcion: "… (sin cifras)", nota: "…"
  },
  secciones: { A:{nombre:"…",color:"#f5a524"}, … },
  preguntas: [ { s:"A", q:"…", o:["…","…","…","…"], c:1, e:"…" } ]
};