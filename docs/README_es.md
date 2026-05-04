<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab V3 · Página de Inicio Minimalista</h1>

> **Una nueva pestaña debería hacer solo una cosa:**
> Abrirse → mostrarte un fondo de pantalla que disfrutes → enviarte a la página que necesitas.
> ¿Realmente necesitas la hora, un saludo o una pantalla llena de accesos directos?
> **La respuesta de PlainTab: resta radical. Una reescritura completa con arquitectura de fondo de pantalla de doble capa. Cero parpadeo — que tu nueva pestaña vuelva a ser puramente «PLAIN».**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.3-blue?style=flat-square" alt="Versión">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licencia">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Demo en vivo">
  </a>
</p>

<p align="center">
  <strong>Una página de inicio limpia, rápida y no intrusiva para tu nueva pestaña.</strong><br>
  Disponible en <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · cero parpadeo · sin límite de tamaño de archivo<br>
  Fondo diario de Bing · Imágenes locales · 16 idiomas · Barra de búsqueda flexible · <strong>Privacidad ante todo</strong>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" /> 
  <img src="../imgs/chrome_03.jpg" width="45%" />
  <img src="../imgs/chrome_04.jpg" width="45%" /> 
  <img src="../imgs/chrome_05.jpg" width="45%" />
  <img src="../imgs/chrome_06.jpg" width="45%" /> 
  <img src="../imgs/chrome_07.jpg" width="45%" />
  <img src="../imgs/chrome_08.jpg" width="45%" /> 
</div>

---

## 🆕 Novedades en v3

v3 es una **reescritura completa desde cero** con un avance: **sistema de fondo de doble capa con cero parpadeo**.

<details>
<summary><b>💡 ¿Por qué parpadeaba v2?</b></summary>

La versión anterior usaba un solo `<div>` con cambios de `background-image` en CSS. Pasar de la miniatura (regla de hoja de estilo) a la imagen completa (estilo en línea) requería un cambio en cascada — durante el cual el navegador eliminaba el fondo renderizado durante al menos un fotograma, revelando el fondo gris.

</details>

**Solución de v3 — Composición de doble capa:**
1. `#wallpaperBack` — siempre mantiene una imagen visible. `preload.js` escribe sincrónicamente una miniatura de 640px antes del primer pintado del navegador
2. `#wallpaperFront` — comienza transparente. Después de que la imagen completa se decodifica, aparece gradualmente encima
3. Al menos una capa siempre tiene una imagen visible → **sin parpadeo gris**

Consulta [CHANGELOG.md](./CHANGELOG.md) para obtener detalles técnicos completos.

---

## ✨ ¿Por qué PlainTab?

- 🔒 **Privacidad absolutamente limpia** — No se recopilan datos personales. Todos los fondos de pantalla se almacenan localmente.
- 🚀 **Inicio de navegación unificado en un minuto** — Configurar como página de inicio + instalar extensión. La extensión nunca fuerza cambios en la página de inicio.
- 🧩 **Tan ligero que apenas lo notas** — Cero dependencias, JavaScript puro, inicio instantáneo.
- 🌍 **Funciona de inmediato** — Detecta automáticamente el idioma del navegador (16), compatible con Google / Bing / Baidu / DuckDuckGo.

---

## 🚀 Dos formas de probarlo

| Método | Descripción | Mejor para |
|--------|-------------|------------|
| 🌐 **Página de inicio en línea** | Visita [plaintab.netlify.app](https://plaintab.netlify.app), configúrala como página de inicio del navegador | Una página de inicio limpia sin instalar nada |
| 🧩 **Extensión del navegador** | Instala desde Chrome o Edge Store | Experiencia minimalista en cada nueva pestaña |

### Extensión de navegador · Instalación desde tienda
- **Chrome Web Store**: [Próximamente]()
- **Edge Add-ons**: [Próximamente]()

> 💡 ¿Aún no disponible? Carga manualmente en modo desarrollador: ve a `chrome://extensions` → activa **Modo desarrollador** → **Cargar descomprimida** → selecciona la carpeta del proyecto

---

## 💡 Recomendación del desarrollador: tres fondos de pantalla, tres entradas

Has instalado la extensión: tu nueva pestaña ya se ve genial. Pero hay algo que quizás no sepas: PlainTab también está desplegado en dos lugares más:

| Entrada | Configuración | URL |
|---------|-------------|------|
| 🧩 **Nueva pestaña** | Extensión del navegador | Cargar esta extensión |
| 🌐 **Página de inicio** | Inicio del navegador | `plaintab.netlify.app` |
| 🏠 **Página principal** | Botón de inicio | `kaininx.github.io/PlainTab` |

Establece `plaintab.netlify.app` como tu página de inicio del navegador, déjala seguir la actualización diaria de Bing. Cada vez que inicies el navegador, esa será tu **segundo fondo de pantalla**.

Sí, hay más. Encuentra el "Botón de inicio" en la configuración de apariencia de tu navegador, pon `kaininx.github.io/PlainTab`, elige otro fondo que te guste. Ahora tienes un **tercer fondo de pantalla**.

Las tres entradas están completamente aisladas. Pon un fondo local diferente en cada una, o deja que todas sigan la actualización diaria de Bing. Abre el navegador: un fondo. Haz clic en el botón de inicio: otro. Abre una nueva pestaña: un tercero. Rotación garantizada.

**Configuración:**
1. Instala la extensión → Nueva pestaña ✓
2. Configuración del navegador → Al iniciar → Abrir una página específica → `https://plaintab.netlify.app`
3. Configuración del navegador → Apariencia → Mostrar botón de inicio → `https://kaininx.github.io/PlainTab`

---

## 🛠️ Uso

| Acción | Efecto |
|--------|--------|
| Mover el ratón a la esquina superior derecha | Mostrar iconos de idioma / configuración |
| Mover el ratón cerca del centro | La barra de búsqueda aparece (modo flotante) |
| Hacer clic en el icono de engranaje | Abrir panel de fondo de pantalla y opciones avanzadas |
| Hacer clic en el icono del globo | Cambiar el idioma de la interfaz |
| Hacer clic en el icono del motor de búsqueda | Alternar Google → Bing → Baidu → DuckDuckGo |
| Pulsar `Enter` en la barra de búsqueda | Buscar con el motor actual |
| Pulsar `Esc` | Cerrar todos los paneles |

### Fondo de pantalla
- **Bing Diario**: Se obtiene automáticamente una vez al día. Solo se almacena en caché la imagen de hoy.
- **Fondo local**: Sube imágenes de cualquier tamaño (IndexedDB, **sin límite de tamaño de archivo**). Solo se conserva la última imagen subida. Restablece con un clic al diario de Bing.

### Opciones avanzadas
| Opción | Descripción |
|--------|-------------|
| Modo de barra de búsqueda | Flotante / Siempre / Oculta |
| Opacidad del icono | 0 – 1 (predeterminado 0.45) |
| Motor de búsqueda | Google / Bing / Baidu / DuckDuckGo |

> **Extensión de Chrome vs. Versión web — Diferencia de búsqueda:** Para cumplir con la política de "Propósito único" de Chrome Web Store, la extensión utiliza la Chrome Search API, que respeta el motor de búsqueda predeterminado configurado en el navegador del usuario. La función de cambio de motor no está disponible en el modo de extensión. La versión web (Netlify / GitHub Pages) no está sujeta a esta restricción y conserva el selector de motor de búsqueda completo. Aparte de la implementación de búsqueda, ambas versiones son funcionalmente idénticas.

> Todos los ajustes se guardan en `localStorage`. Sin cuenta, sin sincronización en la nube.

---

## 🔧 Barra de pie de página en nueva pestaña

Después de instalar la extensión, Chrome / Edge muestra un pie de página en la esquina inferior derecha de la nueva pestaña (mostrando el nombre de la extensión). Esto es un comportamiento del navegador, no algo que PlainTab agregue.

**Cómo ocultarlo (según la [Ayuda de Chrome](https://support.google.com/chrome/answer/11032183?hl=es)):**

Abre una nueva pestaña → haz clic en el icono "Personalizar Chrome" ✏️ de la esquina inferior derecha → Pie de página → desactiva "Mostrar pie de página en la página de nueva pestaña".

---

## 🌐 Soporte multilingüe

16 idiomas integrados, detectados automáticamente desde el navegador, seleccionables manualmente en cualquier momento:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Contribuciones

Las issues y Pull Requests son bienvenidas. Mantén PlainTab minimalista — JavaScript puro, sin pasos de compilación, sin dependencias.

---

## 📄 Licencia

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Agradecimientos

- APIs de fondos de Bing: [bing.img.run](https://bing.img.run) y [bing.biturl.top](https://bing.biturl.top)
- Algunos fondos de pantalla en capturas son de la web — gracias a cada talentoso creador.

---

<p align="center">
  <sub>Limpio · Rápido · Sin anuncios · Solo tuyo</sub>
</p>
