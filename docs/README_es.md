<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Página de inicio minimalista</h1>


 > Una nueva pestaña solo debería hacer una cosa: abrirse, mostrar un bonito fondo de pantalla y enviarte a la siguiente página web. ¿De verdad necesitas un reloj, un saludo o una pantalla llena de accesos directos? La respuesta de PlainTab: la máxima simplificación, la máxima velocidad: devuelve tu nueva pestaña a su estado original, hermosa y limpia.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licencia">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Pruebalo en linea-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 Ver mas capturas de pantalla</b></summary>
<div align="center">
  <img src="../imgs/chrome_03.jpg" width="45%" />
  <img src="../imgs/chrome_04.jpg" width="45%" />
  <img src="../imgs/chrome_05.jpg" width="45%" />
  <img src="../imgs/chrome_06.jpg" width="45%" />
  <img src="../imgs/chrome_07.jpg" width="45%" />
  <img src="../imgs/chrome_08.jpg" width="45%" />
</div>
</details>

---
Abrir una nueva pestana es una accion instantanea: pulsas `Ctrl+T` y esperas que tu fondo de pantalla ya este ahi. Para lograr esto, todo el diseno de PlainTab gira en torno a un objetivo: **mostrar el fondo de pantalla en pantalla lo mas rapido posible**, sin ningun proceso de carga visible. Arquitectura de doble capa, precarga sincrona, pipeline de miniaturas con Canvas, estrategia de almacenamiento hibrido: todas las decisiones tecnicas convergen en una misma cosa: mas rapido, mas fluido, mas imperceptible.

PlainTab es simultaneamente una extension de navegador Manifest V3 y una pagina web independiente. Cero dependencias externas, sin paso de compilacion, vanilla JS + CSS puro. El modo extension y el modo web comparten el mismo codigo base, detectando automaticamente el entorno en tiempo de ejecucion para adaptar su comportamiento. [Pruebalo en linea](https://plaintab.netlify.app).

---

## Inicio rapido

**Extension de navegador**: Instalalo desde [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo).

**Pagina de inicio en linea**: Visita [plaintab.netlify.app](https://plaintab.netlify.app) y configuralo como pagina de inicio en los ajustes de tu navegador.

**Ejecucion local**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

Carga el directorio mediante "Cargar extension descomprimida" en `chrome://extensions`. Sin paso de compilacion, no necesita `npm install`.

<details>
<summary><b>🔧 Como eliminar la barra gris del pie de pagina en la nueva pestana?</b></summary>

Tras instalar la extension, Chrome/Edge muestra un pie de pagina en la esquina inferior derecha de la nueva pestana (indicando el nombre de la extension). Esto es comportamiento del navegador, PlainTab no puede controlarlo desde el codigo.

Como desactivarlo: nueva pestana → "Personalizar Chrome" ✏️ en la esquina inferior derecha → Pie de pagina → desactivar "Mostrar pie de pagina en la pagina de nueva pestana". Consulta la [Ayuda oficial de Chrome](https://support.google.com/chrome/answer/11032183?hl=es).

</details>

---

## Que tan rapido es el fondo de pantalla?

La presentacion del fondo de pantalla de PlainTab no es "cargar una imagen", sino **progresar en tres escalas temporales**, cada nivel perfecciona la experiencia sobre el anterior:

| Momento | Que sucede | Que ve el usuario |
|------|-----------|-------------|
| **0ms** (antes del primer fotograma) | `preload.js` lee sincronamente la miniatura base64 de localStorage y la escribe directamente en `#wallpaperBack.style.backgroundImage` | Un fondo de pantalla que ya esta ahi—no es HD, pero **nunca hay pantalla blanca ni fondo gris** |
| **~300ms** | `loadWallpaper()` lee el Blob cachead de IndexedDB y lo muestra mediante una URL de Blob | Aparece el fondo HD, reemplazando suavemente la miniatura con una transicion de opacidad CSS |
| **Solo cuando la cache caduca** | Solicitud de red a la API de Bing → descarga del Blob → visualizacion → almacenamiento asincrono en IDB | El usuario no lo nota—el fondo anterior permanece en la capa back como respaldo |

Cada una de las siguientes tecnicas sirve a estos tres momentos—ya sea acortando el tiempo o eliminando las marcas visibles de transicion.

---

## Aspectos tecnicos destacados

### Sin pantalla blanca en el primer fotograma: doble capa + precarga sincrona

Este es el diseno mas fundamental de PlainTab. Al abrir una nueva pestana, antes de que la imagen termine de cargarse, el navegador muestra su color de fondo predeterminado—normalmente pantalla blanca o fondo gris. Dos capas `<div>` resuelven este problema por completo:

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0)—siempre tiene una imagen visible. [`preload.js`](../js/preload.js) se ejecuta sincronamente en `<head>`, escribiendo la miniatura `data: URL` antes de que el navegador renderice el primer fotograma. Esto es sincrono—sin ninguna API asincrona, sin esperar a la red. En el modo de rotacion multiple, incluso sabe que indice de miniatura usar en ese momento.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`)—para transiciones de aparicion gradual. La nueva imagen se precodifica en memoria mediante [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) → se establece como fondo de la capa frontal → aparece gradualmente con la [transicion de `opacity`](https://developer.mozilla.org/docs/Web/CSS/transition) de CSS → una vez completada la transicion, se estabiliza en la capa back → la capa front se restablece a transparente.

Principio fundamental: **en cualquier momento, al menos una capa tiene una imagen renderizada**. La capa back siempre tiene algo que mostrar; la capa front solo interviene brevemente durante las transiciones. Incluso si el usuario observa la pantalla fotograma a fotograma, no vera ni un solo instante en blanco.

### De la entrada al pixel: por que una miniatura y no la imagen original?

`preload.js` no puede esperar a la carga asincrona—eso haria que perdiera el primer fotograma. Pero las imagenes originales se almacenan asincronamente en IndexedDB, y una cadena base64 de varios MB no cabe en localStorage (cuota limitada). Por eso PlainTab, una vez mostrado el fondo anterior, **da un paso adicional**: usa Canvas para reducir la imagen a un JPEG de 640px de ancho, calidad 0.55, normalmente comprimido a 30KB–60KB, almacenandolo de forma segura en localStorage. La proxima vez que se abra una nueva pestana, `preload.js` lo tomara y lo usara directamente.

640px es lo suficientemente nitido en una pantalla 2K como para no parecer una miniatura—y detras de controlar ese tamano de unas decenas de KB esta el escalado preciso de la [API Canvas](https://developer.mozilla.org/docs/Web/API/Canvas_API) + el ajuste de calidad de [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL). Esta miniatura tambien es la fuente de datos para la cuadricula 3×4 de la galeria—se genera una vez, se reutiliza en dos sitios.

### Transicion CSS impulsada por dos `requestAnimationFrame`

En el momento de cambiar de la miniatura a la imagen HD, es necesario activar la transicion CSS. Pero el calculo de estilos y el renderizado del navegador son asincronos—si se anade la clase inmediatamente despues de establecer `backgroundImage`, el navegador podria procesar ambos estados en el mismo fotograma de renderizado y la animacion de transicion no se activaria.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

El primer [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) asegura que `backgroundImage` ya se ha calculado; el segundo asegura que el estilo se ha enviado a la pipeline de renderizado. Solo al anadir la clase en ese momento, el navegador ve un cambio de "estilo anterior → estilo nuevo" y puede activar la transicion correcta. Si falta un paso, la transicion se salta directamente—el usuario ve un cambio brusco en lugar de una aparicion gradual.

### Por que IndexedDB y localStorage coexisten?

No se trata de elegir entre dos almacenamientos, sino de division del trabajo:

| Almacenamiento | Que contiene | Por que esta aqui |
|------|--------|---------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | Blobs originales (fondo diario de Bing, imagenes locales subidas por el usuario) | Los archivos grandes necesitan cuotas grandes; la lectura/escritura asincrona es perfectamente aceptable fuera de la ruta del primer fotograma |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | Miniaturas `data: URL`, preferencias de UI, metadatos, indice de rotacion | **Lectura sincrona**—esto es clave. `preload.js` se ejecuta antes del primer fotograma y no puede esperar ninguna devolucion de llamada asincrona |

La conexion IDB se almacena en cache como singleton, y se reconstruye automaticamente al cerrarse (`onclose`). Los Blobs recuperados de IDB pueden perder su tipo MIME—al almacenar, registra siempre el campo `mime`; al recuperar, reconstruye con `new Blob([blob], {type: img.mime})` para asegurar que la URL del Blob se renderice correctamente.

### Autocuracion de miniaturas

`saveLocalImage()` escribe primero en IDB (blob), luego en localStorage (miniatura). Estos dos pasos no son una transaccion atomica—si la pagina se bloquea justo entre ellos, el array de miniaturas tendra un elemento menos que el array de imagenes. PlainTab no realiza una autoverificacion global al inicio (eso podria ocultar inconsistencias de datos mas graves), sino que **regenera la miniatura sobre la marcha cuando la rotacion alcanza una imagen con miniatura faltante**. Solo repara cuando ambos arrays tienen la misma longitud—una disparidad de longitud indica una anomalia de escritura desconocida, y saltarla es la opcion mas segura.

### Ciclo de vida de las URLs de Blob

Todas las URLs de Blob creadas mediante [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) en la galeria se rastrean en un array y se limpian en lote mediante [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) al cerrar la galeria. Pero esta ruta es un fallback—**se da prioridad a las miniaturas base64 pregeneradas**, porque base64 no necesita crear/revocar URLs de Blob y su renderizado es mas rapido.

### Tematizacion en tiempo de ejecucion con propiedades personalizadas CSS

La opacidad de los iconos (`--icon-opacity`) se controla mediante la modificacion de una [propiedad personalizada CSS](https://developer.mozilla.org/docs/Web/CSS/--*) desde JS, unificando todos los botones de esquina y paneles—un solo setProperty y el navegador redibuja automaticamente todos los elementos que referencian esa variable. Los tokens de diseno (`--glass-bg`, `--glass-border`, `--text-primary`, etc.) estan todos definidos en [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root), y los temas oscuro/claro se alternan mediante la consulta de medios [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme).

### Paneles de vidrio esmerilado

Los paneles de configuracion e idioma usan [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) para desenfocar el contenido del fondo de pantalla **detras** del panel—no es la solucion barata de una superposicion semitransparente. Combinado con `--glass-bg: rgba(18, 18, 22, 0.82)`, se crea una verdadera sensacion de profundidad.

### UI sensible a la posicion del raton

Los botones de esquina y la barra de busqueda solo aparecen cuando se necesitan—`isNearTopRight()` e `isInCenter()` son dos funciones matematicas que determinan la posicion del raton, sin necesidad de vincular `mouseenter`/`mouseleave` a la capa de fondo de pantalla completa. El ocultamiento tiene retardo (400ms para botones, 150ms para la barra de busqueda), y se salta cuando un panel esta abierto o un campo de entrada tiene el foco. Cada ruta de interaccion es la mas corta posible: **aparecer rapido, desaparecer estable**, sin interrumpir al usuario con activaciones accidentales.

### Carga por lotes con cadena de Promesas en serie

Los usuarios pueden seleccionar varios fondos de pantalla locales a la vez. Cada `saveLocalImage()` lee y escribe en IDB—la ejecucion en paralelo causaria condiciones de carrera. La carga por lotes serializa todas las operaciones de guardado mediante una cadena de Promesas, escribiendo solo una imagen a la vez; la primera imagen guardada con exito se muestra como fondo de pantalla, el resto solo se almacenan. Asi el usuario no ve parpadeos causados por cambios repetidos de imagen.

### `chrome.search.query()` para cumplimiento de CWS

En modo extension, se usa [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) para delegar la busqueda al motor de busqueda predeterminado del navegador—requisito de cumplimiento de la politica de proposito unico de Chrome Web Store. El selector de motor se oculta del DOM y el icono se convierte en una lupa estatica.

---

## Tecnologias utilizadas para eliminar la latencia

PlainTab no utiliza ningun framework ni libreria. Cada una de las siguientes APIs se eligio para **ahorrar una espera asincrona, eliminar un parpadeo visible, reducir un fotograma de retardo**:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — decodifica asincronamente antes de establecer `backgroundImage`, evitando la pausa de decodificacion durante el renderizado del primer fotograma. Que un `<img>` se haya cargado no significa que este decodificado—no llamar a `decode()` podria mostrar un breve fotograma vacio en el primer renderizado
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — utiliza un desenfoque sintetizado por GPU para eliminar capas DOM adicionales e imagenes de mascara, sin coste adicional de maquetacion
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — bloquea Dark Reader para evitar que invierta los colores del fondo de pantalla con filtros—el fondo de pantalla es contenido visual en si mismo; ser procesado por filtros malograria el esfuerzo de fidelidad de la pipeline de miniaturas Canvas
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — una unica declaracion permite al navegador adaptar automaticamente los colores de formularios, barras de desplazamiento y controles del sistema, sin necesidad de escribir dos conjuntos de estilos manualmente
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — curva de aceleracion unificada, compartida por todas las animaciones de aparicion y emergentes. No es `ease` ni `ease-in-out`—esta curva llega mas rapido al objetivo al principio y tiene una caida mas suave al final; para diferencias de respuesta de UI a nivel de milisegundos, la diferencia en la sensacion es notable
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — obtiene el idioma de la UI del navegador en modo extension, reflejando la intencion real del usuario con mas precision que `navigator.language`
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — no depende de `setTimeout` para adivinar el momento del renderizado, sino que se alinea con precision al ritmo de fotogramas del navegador. Usarlo dos veces asegura un limite de fotograma claro entre el calculo de estilos y su envio
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — Dispara ambos endpoints de la API de Bing simultáneamente y usa el que responda primero, eliminando esperas innecesarias
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — Limita cada solicitud a la API de Bing a 8 segundos, abortando limpiamente la conexión perdedora en lugar de dejarla colgada hasta el tiempo de espera TCP del sistema operativo

**Las tecnologias no utilizadas son igualmente importantes**: cero dependencias externas. Sin React, Tailwind ni herramientas de compilacion. La CSP en `manifest.json` restringe `script-src 'self'`—el navegador impone vanilla JS puro. Cada libreria no incluida significa menos tiempo de analisis, menos sobrecarga de red, un primer fotograma mas temprano.

**Pila de fuentes**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`—fuentes nativas del sistema operativo, cero solicitudes de red, cero desplazamiento de maquetacion. Los archivos de fuentes suelen ser uno de los recursos de bloqueo mas grandes de una pagina; PlainTab evita todo el problema.

---

## Dos modos de ejecucion

El mismo codigo, deteccion automatica del entorno en tiempo de ejecucion:

| Caracteristica | Modo extension | Modo web |
|------|----------|----------|
| Deteccion de entorno | `chrome.runtime.id` existe | Cualquier otro caso |
| Motor de busqueda | Predeterminado del navegador (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo seleccionable |
| Cambio de motor | No se puede cambiar (lupa estatica) | Alternar con clic en el icono |
| Despliegue | Chrome Web Store / carga como desarrollador | Netlify / GitHub Pages alojamiento directo |
| CSP | Declarado en `manifest.json` | Sin CSP necesario |

---

## Prioridad de carga del fondo de pantalla

Cada vez que se abre una nueva pestana, se busca la fuente de fondo de pantalla mas rapida disponible en el siguiente orden:

1. **Rotacion de fondos locales**—imagenes propias del usuario (maximo 12), Blob ya en IDB, se toman directamente. Las miniaturas ya estan pregeneradas. Sin coste de red.
2. **Cache de Bing del dia**—el fondo de Bing ya obtenido hoy, el Blob esta en IDB, se convierte directamente a URL de Blob para mostrar. Sin coste de red.
3. **Obtencion de red de Bing**—solo se accede a la red cuando los dos niveles anteriores no estan disponibles. Una vez obtenida la URL, se muestra inmediatamente, mientras se descarga el Blob asincronamente a IDB para evitar la espera de red la proxima vez.

En modo de fondos locales, el fondo de Bing tambien se actualiza silenciosamente en segundo plano—el usuario puede volver al modo Bing en cualquier momento sin esperar a la red.

La API de Bing dispara ambos endpoints simultaneamente mediante `Promise.any` con un tiempo de espera de 8 segundos via `AbortController` — la respuesta mas rapida gana. Los payloads JSON son minusculos, por lo que la solicitud extra cuesta practicamente nada, pero la competencia garantiza la latencia optima sin importar donde te encuentres. Los codigos de idioma (como `zh-CN`) se asignan a codigos de mercado de Bing, y algunos idiomas recurren a `en-US`.

---

## Internacionalizacion

Soporta 16 idiomas: 简体中文, 繁體中文, English, 日本語, 한국어, Espanol, Русский, Deutsch, Francais, Italiano, Portugues, हिन्दी, العربية, Turkce, Polski, Tieng Viet.

Dos sistemas i18n en paralelo: Chrome `_locales/` se encarga de los metadatos del manifiesto de la extension (solo dos claves `extName`, `extDesc`), [`languages.js`](../js/languages.js) se encarga de todas las cadenas de la UI. Prioridad de deteccion de idioma: idioma de la UI de Chrome (modo extension) → `navigator.language` (modo web) → coincidencia de idioma principal → fallback a English.

Hay alguna imperfeccion en la traduccion o quieres anadir un nuevo idioma? El archivo de idiomas es solo uno, [`js/languages.js`](../js/languages.js), puro mapeo clave-valor. Haz los cambios y envia un PR.

---

## Estructura del proyecto

```
PlainTab/
├── manifest.json            # Manifiesto de extension Chrome/Edge (Manifest V3)
├── index.html               # Unica pagina HTML (nueva pestana de la extension / pagina web de inicio)
├── 404.html                 # Pagina de respaldo SPA de Netlify
├── LICENSE                  # Licencia MIT
│
├── css/
│   └── newtab.css           # Todos los estilos: fondo de doble capa, paneles de vidrio esmerilado, barra de busqueda, responsive
│
├── js/
│   ├── preload.js           # IIFE sincrono: inyecta miniatura en la capa back antes del primer fotograma
│   ├── languages.js         # Tabla de cadenas de UI para 16 idiomas + lista de idiomas
│   └── newtab.js            # Programa principal: gestion de fondos, i18n, almacenamiento, UI, motor de busqueda
│
├── _locales/                # i18n de Chrome (16 directorios de idioma, solo para el manifiesto de la extension)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # Iconos de la extension (16/48/128/2048 px)
│
├── imgs/                    # Capturas de pantalla e imagenes promocionales
│   ├── chrome_01.jpg ~ chrome_08.jpg  # Capturas de pantalla de funcionalidades
│   └── small_promo.png      # Imagen promocional pequena de Chrome Web Store
│
├── docs/                    # README multilingue (16 idiomas) + CHANGELOG
│
└── changelog/               # Registro de cambios de version por idioma
```

- **[`css/`](../css/)** — Archivo unico de ~617 lineas, tema oscuro/claro, tokens de diseno de vidrio morfismo, punto de ruptura responsive a 480px
- **[`js/`](../js/)** — Tres archivos que se cargan en orden: `preload.js` → `languages.js` → `newtab.js` (el orden no se puede alterar)
- **[`_locales/`](../_locales/)** — Solo contiene `extName` y `extDesc` para el manifiesto de la extension; todas las cadenas de UI son gestionadas por [`languages.js`](../js/languages.js)
- **[`imgs/`](../imgs/)** — Capturas de pantalla e imagenes promocionales requeridas por Chrome Web Store
- **[`docs/`](../docs/)** y **[`changelog/`](../changelog/)** — Documentacion multilingue, 16 idiomas cada uno con su propio archivo independiente

---

## Contribucion y licencia

Codigo abierto bajo licencia MIT. Encuentras un fallo o tienes una idea? → [Abre un Issue](https://github.com/kaininx/PlainTab/issues); quieres modificar codigo? → Fork + PR.

Algunas convenciones:
- **Mantener cero dependencias**—no incluir paquetes npm, scripts CDN ni frameworks
- **No anadir pasos de compilacion**—`index.html` se ejecuta directamente en el navegador
- **No ampliar permisos**—`manifest.json` solo conserva el permiso `search`

📋 [Registro de cambios](CHANGELOG.md)

---

## Agradecimientos

- Las imagenes diarias de Bing provienen de [Bing](https://www.bing.com), gracias al equipo de Microsoft Bing por proporcionar constantemente imagenes diarias de alta calidad
- Proxies de API: [bing.biturl.top](https://bing.biturl.top) (proxy publico) y [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (respaldo Cloudflare Worker)
- Los fondos de pantalla que aparecen en las capturas son de varios creadores de la web

MIT · [Kaelri](https://github.com/kaininx)
