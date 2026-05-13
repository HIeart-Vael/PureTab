<p align="center">
  <img src="icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Minimal New Tab</h1>


 > A new tab should do exactly one thing — open, show you a beautiful wallpaper, and send you on to the next page. Do you really need a clock, a greeting, or a screen full of shortcuts?
 >
 > `Ctrl+T` is an instantaneous action — you press it and expect your wallpaper to already be there. Not "loaded fast", but **there from the start**. Dual-layer wallpaper, synchronous preloading, Canvas thumbnail pipeline, hybrid storage — every technical decision converges on the same thing: faster, smoother, more seamless.

<p align="center">
  <a href="docs/README_zh-CN.md">中文 (简体)</a> · <a href="docs/README_zh-TW.md">中文 (繁體)</a> · <a href="docs/README_hi.md">हिन्दी</a> · <a href="docs/README_es.md">Español</a> · <a href="docs/README_ar.md">العربية</a> · <a href="docs/README_fr.md">Français</a> · <a href="docs/README_pt_BR.md">Português</a> · <a href="docs/README_ru.md">Русский</a> · <a href="docs/README_de.md">Deutsch</a> · <a href="docs/README_ja.md">日本語</a> · <a href="docs/README_it.md">Italiano</a> · <a href="docs/README_tr.md">Türkçe</a> · <a href="docs/README_vi.md">Tiếng Việt</a> · <a href="docs/README_ko.md">한국어</a> · <a href="docs/README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.2-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="License">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live_Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="imgs/chrome_01.jpg" width="45%" />
  <img src="imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 View more screenshots</b></summary>
<div align="center">
  <img src="imgs/chrome_03.jpg" width="45%" />
  <img src="imgs/chrome_04.jpg" width="45%" />
  <img src="imgs/chrome_05.jpg" width="45%" />
  <img src="imgs/chrome_06.jpg" width="45%" />
  <img src="imgs/chrome_07.jpg" width="45%" />
  <img src="imgs/chrome_08.jpg" width="45%" />
</div>
</details>

---
Opening a new tab is an instantaneous action — you press `Ctrl+T` and expect your wallpaper to already be there. To get this right, every decision in PlainTab revolves around one goal: putting the wallpaper on screen as fast as possible, with zero visible loading. Dual-layer wallpaper architecture, synchronous preloading, Canvas thumbnail pipeline, hybrid storage strategy — every technical choice converges on the same thing: faster, smoother, more seamless.


PlainTab is both a Manifest V3 browser extension and a standalone web page. Zero external dependencies, no build step, pure vanilla JS + CSS. Extension and web modes share the same codebase, automatically detecting the environment at runtime. [Try it live](https://plaintab.netlify.app).

---

## Quick Start

**Browser extension**: Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo).

**Online start page**: Visit [plaintab.netlify.app](https://plaintab.netlify.app) and set it as your startup page in your browser settings.

**Run locally**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

Load the directory as an unpacked extension in `chrome://extensions`. No build step, no `npm install`.

<details>
<summary><b>🔧 How to remove the gray bar at the bottom of a new tab?</b></summary>

After installing the extension, Chrome / Edge displays a footer at the bottom-right of new tab pages (showing the current extension name). This is browser behavior — PlainTab cannot control it in code.

To disable it: Open a new tab → click the "Customize Chrome" ✏️ button at the bottom-right → Footer → turn off "Show footer on New Tab page." See [Chrome Help](https://support.google.com/chrome/answer/11032183) for details.

</details>

---

## How fast is the wallpaper?

PlainTab's wallpaper display is not "loading an image" — it's **a progression across three time scales**, each building on the previous to make the experience more complete:

| Time | What happens | What the user sees |
|------|-------------|-------------------|
| **0ms** (before first paint) | `preload.js` synchronously reads the base64 thumbnail from localStorage and writes it directly to `#wallpaperBack.style.backgroundImage` | A wallpaper that's already there — not full resolution, but **no white screen or gray background** |
| **~300ms** | `loadWallpaper()` reads the cached Blob from IndexedDB and displays it via a Blob URL | The high-resolution wallpaper appears, smoothly replacing the thumbnail via CSS opacity transition |
| **Only when cache expires** | Network request to Bing API → download Blob → display → asynchronously cache to IDB | The user doesn't notice — the previous wallpaper remains on the back layer as a fallback |

Every technique described below serves these three moments — either reducing time or eliminating visible transition artifacts.

---

## Technical Highlights

### Zero white screen on first paint: dual-layer wallpaper + synchronous preloading

This is PlainTab's most fundamental design. Before an image finishes loading, a new tab would otherwise expose the browser's default background color — typically white or gray. Two stacked `<div>` layers solve this completely:

- **[`#wallpaperBack`](index.html#L14)** (z-index: 0) — always holds a visible image. [`preload.js`](js/preload.js) is placed in `<head>` and executes synchronously, writing the thumbnail `data:` URL before the browser's first paint. This step is synchronous — no async APIs, no network waits. In multi-image rotation mode, it even knows which thumbnail index to use.
- **[`#wallpaperFront`](index.html#L16)** (z-index: 1, `opacity: 0`) — handles the fade-in transition. New image is pre-decoded in memory via [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) → set as front layer background → CSS [`opacity` transition](https://developer.mozilla.org/docs/Web/CSS/transition) fades in → after transition completes, stabilizes to the back layer → front resets to transparent.

Core principle: **at least one layer always holds a rendered image**. The back layer always has something to display; the front layer only appears briefly during transitions. Even if you watch frame by frame, you will never see a blank moment.

### From keystroke to pixel: why thumbnails instead of full images?

`preload.js` cannot wait for async loading — that would miss the first paint. But storing the full image in IndexedDB is async, and the multi-megabyte base64 strings won't fit in localStorage (limited quota). So PlainTab goes one step further after displaying the previous wallpaper: it uses Canvas to resize the image to 640px wide JPEG at 0.55 quality, resulting in compressed sizes typically between 30KB–60KB, safely stored in localStorage. On the next new tab open, `preload.js` reads it and uses it directly.

At 640px, the thumbnail is sharp enough on 2K displays that it's indistinguishable from a full image — and behind controlling this dozen-KB footprint is the [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API)'s precise scaling combined with [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL) quality tuning. This thumbnail also serves as the rendering data source for the gallery's 3×4 grid — generated once, reused in two places.

### Dual `requestAnimationFrame` drives CSS transitions

The step from thumbnail to full-resolution image must trigger a CSS transition. But the browser's style calculation and rendering are asynchronous — if you add the class immediately after setting `backgroundImage`, the browser might process both states in the same frame render cycle, and the transition animation won't fire.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

The first [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) ensures `backgroundImage` has been computed; the second ensures the styles have been committed to the rendering pipeline. Only then does adding the class cause the browser to see a change from "old style → new style", triggering the correct transition. Skip one step, and the transition is bypassed — the user sees a hard cut instead of a fade-in.

### Why do IndexedDB and localStorage coexist?

The two storage systems are not an either/or choice — they have distinct roles:

| Storage | What it stores | Why it goes here |
|---------|---------------|-----------------|
| [IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API) | Raw Blobs (Bing daily wallpaper, user-uploaded local images) | Large files need large quotas; async read/write is perfectly acceptable on non-first-paint paths |
| [localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage) | Thumbnail `data:` URLs, UI preferences, metadata, rotation index | **Synchronous reads** — this is the key. `preload.js` runs before the first paint and cannot wait for any async callback |

The IDB connection is cached as a singleton and automatically reconnects on `onclose`. Blobs retrieved from IDB may lose their MIME type — the `mime` field is always recorded during storage, and on retrieval, the blob is rebuilt with `new Blob([blob], {type: img.mime})` to ensure the Blob URL renders correctly.

### Thumbnail self-healing

`saveLocalImage()` writes to IDB (blob) first, then localStorage (thumbnail). These two steps are not an atomic transaction — if the page crashes between them, the thumbnail array will be one item shorter than the image array. PlainTab does not perform a global self-check at startup (that would mask more serious data inconsistencies). Instead, it **regenerates thumbnails on the fly when rotating to an image whose thumbnail is missing**. Repair only happens when the two arrays have the same length — a length mismatch indicates an unknown write anomaly, and skipping is the safer choice.

### Blob URL lifecycle

All Blob URLs created via [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) in the gallery are tracked in an array and bulk-revoked via [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) when the gallery closes. But this path is a fallback — **pre-generated base64 thumbnails are preferred**, since base64 doesn't require creating/revoking Blob URLs and renders faster.

### CSS custom properties for runtime theming

Icon opacity (`--icon-opacity`) is controlled through a single [CSS custom property](https://developer.mozilla.org/docs/Web/CSS/--*) modified via JS — one `setProperty` call, and the browser automatically repaints all elements referencing that variable. Design tokens (`--glass-bg`, `--glass-border`, `--text-primary`, etc.) are all defined on [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root), with dark/light themes toggled via the [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme) media query.

### Glass-morphism panels

Settings and language panels use [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) to blur the wallpaper content **behind** the panel — not a cheap semi-transparent overlay. Combined with `--glass-bg: rgba(18, 18, 22, 0.82)`, this creates a genuine sense of depth.

### Mouse position-aware UI

Corner buttons and the search bar only appear when needed — `isNearTopRight()` and `isInCenter()` use simple math functions to determine mouse position, avoiding the need for `mouseenter`/`mouseleave` bindings on the full-screen background layer. Hiding has a debounce delay (400ms for buttons, 150ms for the search bar), and is skipped when a panel is open or the input is focused. Every interaction path is the shortest possible: **appear quickly, disappear steadily** — never interrupt the user with false triggers.

### Serialized Promise chain for batch uploads

Users can select multiple local wallpapers at once. Each `saveLocalImage()` call reads and writes to IDB — parallel execution would cause data races. Batch upload uses a Promise chain to serialize all save operations, writing one image at a time. The first successfully saved image is displayed as the wallpaper; the rest are stored silently. This prevents the flickering that would be caused by repeatedly switching images.

### `chrome.search.query()` for CWS compliance

In extension mode, [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) delegates search to the browser's default search engine — a requirement for Chrome Web Store single-purpose policy compliance. The engine selector is hidden from the DOM, and the icon becomes a static magnifying glass.

---

## Techniques used to eliminate latency

PlainTab doesn't use any frameworks or libraries. Every API listed below was chosen to **eliminate one async wait, remove one visible flicker, or shave one frame of latency**:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — Decodes asynchronously before setting `backgroundImage`, avoiding the decode pause during first paint. An `<img>` being loaded doesn't mean it's decoded — without calling `decode()`, the first paint may show a brief blank frame
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — Replaces extra DOM layers and mask images with GPU-composited blur, zero additional layout cost
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — Locks Dark Reader, preventing it from inverting wallpaper colors with filters — the wallpaper is visual content itself, and having it filtered would undo the fidelity efforts of the Canvas thumbnail pipeline
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — A single declaration lets the browser automatically adapt form elements, scrollbars, and system controls — no need to write two separate style overrides
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — A unified easing curve shared by all fade-in and pop animations. Not `ease` or `ease-in-out` — this curve reaches its target faster at the start and decelerates more gently at the end. For millisecond-level UI response differences, the felt difference is noticeable
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — Retrieves the browser UI language in extension mode, more accurately reflecting the user's true intent than `navigator.language`
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — Instead of guessing render timing with `setTimeout`, it aligns precisely with the browser's frame cadence. Using it twice in succession ensures a clear frame boundary between style computation and commit
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — Fires both Bing API endpoints simultaneously and uses whichever responds first, eliminating unnecessary wait
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — Caps each Bing API request at 8 seconds, cleanly aborting the losing connection instead of letting it hang on OS-level TCP timeout

**The technologies NOT used are equally important**: zero external dependencies. No React, no Tailwind, no build tools. The CSP in `manifest.json` restricts `script-src 'self'` — the browser enforces pure vanilla JS. Every library not included means less parse time, less network overhead, and an earlier first paint.

**Font stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` — OS-native fonts, zero network requests, zero layout shift. Font files are typically one of the largest blocking resources on a page — PlainTab sidesteps the entire problem.

---

## Two runtime modes

Same codebase, environment auto-detected at runtime:

| Feature | Extension mode | Web mode |
|---------|---------------|----------|
| Environment detection | `chrome.runtime.id` exists | Everything else |
| Search engine | Browser default (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo selectable |
| Engine switching | Not switchable (static magnifying glass) | Cycle through icons on click |
| Deployment | Chrome Web Store / Developer load | Netlify / GitHub Pages |
| CSP | Declared in `manifest.json` | No CSP needed |

---

## Wallpaper loading priority

Each time a new tab opens, PlainTab searches for the fastest available wallpaper source in this order:

1. **Local wallpaper rotation** — the user's own images (up to 12), blobs already in IDB, fetched directly. Thumbnails are pre-generated. Zero network overhead.
2. **Today's Bing cache** — the Bing wallpaper already fetched today, blob in IDB, converted directly to a Blob URL for display. Zero network overhead.
3. **Bing network fetch** — only when both previous tiers are unavailable does it hit the network. The URL is displayed immediately upon retrieval, while the blob is asynchronously downloaded and cached to IDB — eliminating network wait for the next time.

In local wallpaper mode, the Bing wallpaper is silently updated in the background — users can switch back to Bing mode at any time without waiting for the network.

The Bing API fires both endpoints simultaneously via `Promise.any` with an 8-second `AbortController` timeout — the fastest response wins. The JSON payloads are tiny, so the extra request costs virtually nothing, yet the race ensures optimal latency regardless of where you are. Language codes (e.g., `zh-CN`) are mapped to Bing market codes, with some languages falling back to `en-US`.

---

## Internationalization

Supports 16 languages: 简体中文, 繁體中文, English, 日本語, 한국어, Español, Русский, Deutsch, Français, Italiano, Português, हिन्दी, العربية, Türkçe, Polski, Tiếng Việt.

Two parallel i18n systems: Chrome's `_locales/` handles extension manifest metadata (only `extName` and `extDesc` keys), while [`languages.js`](js/languages.js) handles all UI strings. Language detection priority: Chrome UI language (extension mode) → `navigator.language` (web mode) → primary language match → English fallback.

Found a translation issue or want to add a language? Everything lives in a single file: [`js/languages.js`](js/languages.js), a flat key-value map. Make your changes and submit a PR.

---

## Project structure

```
PlainTab/
├── manifest.json            # Chrome/Edge extension manifest (Manifest V3)
├── index.html               # Single HTML page (extension new tab / web start page)
├── 404.html                 # Netlify SPA fallback
├── LICENSE                  # MIT License
│
├── css/
│   └── newtab.css           # All styles: dual-layer wallpaper, glass-morphism panels, search bar, responsive
│
├── js/
│   ├── preload.js           # Synchronous IIFE: injects thumbnail into back layer before first paint
│   ├── languages.js         # 16-language UI string table + language list
│   └── newtab.js            # Main application: wallpaper management, i18n, storage, UI, search engine
│
├── _locales/                # Chrome i18n (16 language directories, extension manifest only)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # Extension icons (16/48/128/2048 px)
│
├── imgs/                    # Screenshots and promo images
│   ├── chrome_01.jpg ~ chrome_08.jpg  # Feature screenshots
│   └── small_promo.png      # Chrome Web Store small promo tile
│
├── docs/                    # All documentation
│   ├── changelog-i18n/      #   Per-language changelogs (16 languages)
│   └── store-listing/             #   Per-language CWS descriptions (16 languages)
```

- **[`css/`](css/)** — Single ~617-line file: dark/light themes, glass-morphism design tokens, 480px responsive breakpoint
- **[`js/`](js/)** — Three files loaded in order: `preload.js` → `languages.js` → `newtab.js` (order is critical)
- **[`_locales/`](_locales/)** — Contains only `extName` and `extDesc` for manifest; all UI strings managed by [`languages.js`](js/languages.js)
- **[`imgs/`](imgs/)** — Screenshots and promo tiles required by Chrome Web Store
- **[`docs/`](docs/)** — All documentation: 16-language READMEs, `changelog.md`, `release-note.md`, `requirements.md`, `architecture.md`, `changelog-i18n/`, `store-listing/`

---

## Contributing & License

Open source under the MIT license. Found a bug or have an idea? → [Open an Issue](https://github.com/kaininx/PlainTab/issues). Want to contribute code? → Fork + PR.

A few ground rules:
- **Stay zero-dependency** — no npm packages, CDN scripts, or frameworks
- **No build steps** — `index.html` runs directly in the browser
- **Don't expand permissions** — `manifest.json` keeps only the `search` permission

📋 [Changelog](docs/changelog.md)

---

## Credits

- Bing daily wallpaper images come from [Bing](https://www.bing.com) — thank you to the Microsoft Bing team for years of consistently beautiful daily photos
- API proxies: [bing.biturl.top](https://bing.biturl.top) (public proxy) and [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (Cloudflare Worker backup)
- Wallpapers featured in screenshots are from creators across the web

MIT · [Kaelri](https://github.com/kaininx)
