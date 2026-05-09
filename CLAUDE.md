# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

PlainTab is a Chrome/Edge extension (Manifest V3) and standalone web page that replaces the browser's new tab page with a minimal, zero-flash wallpaper experience. Zero external dependencies, no build step — pure vanilla JS + CSS.

## Architecture

### Dual-layer wallpaper system (zero-flash)

Two stacked `<div>` layers in `index.html`:

- **`#wallpaperBack`** (z-index: 0) — always holds a visible image. `preload.js` synchronously writes the pre-formatted thumbnail via `back.style.backgroundImage` before the browser's first paint, so the user never sees a blank/gray background.
- **`#wallpaperFront`** (z-index: 1, `opacity: 0`) — used for fade-in transitions. New full-res images are preloaded in memory (`img.decode()`), set as `background-image` on the front layer, then faded in via CSS `opacity` transition. After the transition completes (~550ms), the image is "stabilized" onto the back layer (direct `back.style.backgroundImage` assignment) and the front layer resets to transparent.

This ensures at least one layer always holds a rendered image — no frame is ever blank.

### JS file loading order (critical)

1. **`js/preload.js`** — synchronous IIFE, runs before anything else. Reads `localStorage.bing_thumb` (Bing) or `local_thumbs[idx]` (local multi-image rotation) and writes it into `#wallpaperBack` via `back.style.backgroundImage`. Must be in `<head>` or immediately after `#wallpaperBack` in the DOM.
2. **`js/languages.js`** — defines `window.I18N` (16 locales) and `window.LanguageList`. Must load before `newtab.js`.
3. **`js/newtab.js`** — the main application (~945 lines). IIFE with clear sections: Constants, Environment detection, DOM refs, State, Utils, i18n, IndexedDB storage, Wallpaper (Bing fetch, local multi-image upload with rotation, dual-layer apply), UI (panels, corner buttons, search bar, local gallery), Extension mode override, Bootstrap.

### Two runtime modes

`newtab.js` detects its environment at init via `typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id`:

- **Extension mode** (`chrome.runtime.id` exists): uses `chrome.search.query()` for CWS single-purpose compliance. The engine selector UI row is hidden and the engine icon becomes a static magnifying glass. Search uses the browser's built-in default search engine.
- **Web mode** (Netlify / GitHub Pages): full engine selector (Google → Bing → Baidu → DuckDuckGo). Search opens `window.open(url, '_self')`.

### Storage

- **IndexedDB** (`PlainTab`, v1, store `wallpaper`): stores raw image blobs.
  - `bing` — single Blob for the Bing daily wallpaper
  - `local_images` — array of `{id, blob, mime, name}` objects (max 12), one per user-uploaded wallpaper
  - IDB reads are done in parallel via `Promise.all` in `loadWallpaper()`
- **localStorage**:
  - `bing_thumb` — single thumbnail data URL (CSS-ready `url(data:...)`), written by `generateThumbnail()`, read by `preload.js` for Bing mode and as fallback
  - `local_thumbs` — JSON array of thumbnail data URLs, index-aligned with IDB `local_images`. Written on upload, synced on delete, self-healed on rotation
  - `ptab_local_index` — rotation index for local wallpapers, incremented each new tab, modulo image count
  - `ptab_bing_meta` — `{src, date, provider}` for Bing image dedup and freshness checks. `src` doubles as the dedup key
  - `ptab_wallpaper_source` — `'bing'` or `'local'`
  - `ptab_lang`, `ptab_search_visibility`, `ptab_icon_opacity`, `ptab_search_engine` — UI preferences

### Multi-image local wallpaper

Users can upload up to 12 local wallpapers. Each new tab rotates to the next image via `ptab_local_index`.

**Upload flow**: `saveLocalImage(file, show)` reads IDB for dedup (name + size), generates thumbnail via canvas, then atomically pushes blob to IDB `local_images` and thumbnail to localStorage `local_thumbs` at the same index. Gallery "+" button is hidden when 12 images exist — no runtime limit check in the save path.

**Batch upload**: File input has `multiple` attribute. Change handler reads current count, calculates `slots = 12 - N`, then iterates ALL selected files — skipping duplicates — until `slots` new images are saved. Only the first successfully saved image is shown as wallpaper; the rest are saved silently.

**Gallery** (`renderLocalGallery`): renders a 3×4 grid using pre-generated base64 thumbnails from `local_thumbs` (not blob URLs). Falls back to `URL.createObjectURL` only if a thumbnail is missing (legacy data). All blob URLs created this way are tracked in `_galleryUrls` and revoked on gallery close via `revokeGalleryUrls()`. Up to 12 thumbnails — when full, the "+" button is hidden.

**Deletion**: `deleteLocalImage(id)` removes the blob from IDB and `splice`s the thumbnail at the same index from `local_thumbs`. Deleting the last local image clears both arrays and switches back to Bing mode.

**Reset to Bing**: `resetToBing()` clears `local_images` (IDB), `local_thumbs`, `bing_thumb`, `ptab_local_index` (localStorage), and switches mode to `'bing'`.

### CSS architecture

**Design tokens** — CSS custom properties on `:root` define the visual language:

- `--glass-bg` / `--glass-border` / `--glass-shadow` — glass-morphism panels (settings, language, search bar)
- `--text-primary` / `--text-secondary` — text hierarchy
- `--icon-opacity` (default `0.45`) — corner button transparency, updated at runtime via `applyOpacity()`
- `--transition` — `0.35s cubic-bezier(0.4, 0, 0.2, 1)`, used consistently for button fades
- `--fallback-start/mid/end` — gradient that shows briefly if no wallpaper is set (should never be visible in normal operation)

**Dark/light mode**: Dark-first with `@media (prefers-color-scheme: light)` override. The `<meta name="darkreader-lock" content="light">` tag prevents Dark Reader from breaking wallpaper colors.

**Responsive**: Single breakpoint at `480px` — shrinks corner buttons and panels, widens search bar to `90vw`.

### i18n

Two parallel i18n systems:
- **Chrome `_locales/`** (16 language dirs, each with `messages.json`) — used for the extension manifest (`extName`, `extDesc`). Only two keys per locale.
- **`js/languages.js`** — `window.I18N` object with all UI strings for all 16 languages. Language detection: Chrome `i18n.getUILanguage()` in extension mode, `navigator.language` in web mode. The `t()` function in `newtab.js` tries `chrome.i18n.getMessage()` first, falls back to `I18N[currentLang]`, then English, then the raw key.

### Bing API endpoints

Two hardcoded JSONP→JSON proxies, fired simultaneously by `fetchBingUrl()` via `Promise.any` — the fastest response wins. Each request has an 8-second `AbortController` timeout for clean teardown.

- `https://bing.biturl.top/?resolution=1920x1080&format=json&index=0&mkt={mkt}`
- `https://bing.kaininx.workers.dev/?resolution=1920x1080&format=json&index=0&mkt={mkt}`

Market codes are derived from the current UI language via `bingMkt()`. Both endpoints return `{url, ...}` — the `url` field is the full-res image direct link (CORS-enabled for IDB storage).

### Known pitfalls

- **Blob MIME loss in IDB**: Blobs retrieved from IndexedDB may lose their MIME type. `loadWallpaper()` recovers it: if `blob.type` is empty and `img.mime` was stored, a new `Blob([blob], {type: img.mime})` is created. Always store `mime` alongside blobs.
- **Non-atomic thumbnail/blob write**: `saveLocalImage()` writes blob to IDB and thumbnail to localStorage in sequence (not a transaction). If the page crashes between these writes, `local_thumbs` will be one item shorter than `local_images`. The self-healing logic in `loadWallpaper()` only repairs when `thumbs.length === localImages.length`, so a length mismatch prevents repair and the missing thumbnail is permanent until that index is rotated to and regenerated.
- **`_uploadKeepOpen` is module-scoped**: In the batch upload handler, `_uploadKeepOpen` is set before `fileInput.click()` and read after the promise chain. Multiple rapid clicks on the gallery "+" button could theoretically cause a race, though the UI makes this very hard to trigger.
- **Gallery blob URL lifecycle**: `renderLocalGallery()` only creates blob URLs as a fallback when a thumbnail is missing. All created blob URLs are tracked in `_galleryUrls` and revoked on gallery close via `revokeGalleryUrls()`. Always call `revokeGalleryUrls()` before clearing gallery DOM.

### File inventory

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3). Permission: `search`. CSP: `img-src` restricted to `'self' https://www.bing.com https://cn.bing.com data: blob:` |
| `index.html` | Single HTML page — the new tab |
| `css/newtab.css` | All styles (~614 lines), glass-morphism design, dark-first + light override, 480px responsive |
| `js/preload.js` | Synchronous thumbnail injection with rotation support (~14 lines) |
| `js/languages.js` | 16-language string table (~37 lines) |
| `js/newtab.js` | All application logic (~945 lines) |
| `404.html` | Netlify SPA fallback (plain HTML, no JS needed) |
| `_locales/*/messages.json` | Chrome i18n for manifest metadata only |
| `icon/` | Extension icons (16/48/128/2048) |
| `imgs/` | Screenshots for README |
| `docs/` | All documentation: translated READMEs (16), changelog.md, release-note.md, requirements.md, architecture.md |
| `docs/changelog-i18n/` | Per-language changelog files (16 languages) |
| `docs/store-listing/` | Per-language Chrome Web Store listing descriptions (16 languages) |

## Development

No build step. Load the extension unpacked:

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable "Developer mode"
3. Click "Load unpacked" → select this directory
4. Open a new tab to test

For the web version, open `index.html` directly in a browser. The Netlify deployment uses `404.html` as a catch-all.

There are no tests, no linter config, no CI, no `package.json`.

### CWS compliance note

Per Chrome Web Store single-purpose policy, the extension version uses `chrome.search.query()` with `disposition: 'CURRENT_TAB'` and hides the engine selector. The `search` permission in `manifest.json` is required for this API. The web version is not bound by this restriction.

## Commit style

Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`. See `git log` for examples.

## Function index (newtab.js)

| Line | Function | Purpose |
|------|----------|---------|
| 91 | `t(key)` | i18n lookup: chrome.i18n → I18N table → English → raw key |
| 100 | `detectLang()` | Browser language detection, returns best matching locale code |
| 112 | `updateLangUI()` | Refresh all DOM text after language change |
| 137 | `renderLangPanel()` | Render language selector button list |
| 162 | `openDB()` | Get or create cached IndexedDB connection |
| 179 | `idbPut(key, value)` | Write key-value to IDB |
| 191 | `idbGet(key)` | Read key from IDB |
| 203 | `idbDelete(key)` | Delete key from IDB |
| 219 | `preloadImage(url)` | Preload image into memory, returns promise |
| 231 | `applyWallpaper(url, mode)` | Full display pipeline: preload → front layer fade-in → stabilize to back → generate thumbnail. Returns thumb value |
| 255 | `generateThumbnail(url)` | Canvas-resize image to 640px wide JPEG, save to `bing_thumb`. Returns thumb value or null |
| 276 | `loadThumbs()` | Parse `local_thumbs` JSON array from localStorage |
| 280 | `saveThumbs(thumbs)` | Serialize thumbs array to `local_thumbs` in localStorage |
| 290 | `bingMkt(lang)` | Language code → Bing market code mapping |
| 296 | `fetchBingUrl()` | Fetch Bing JSON API (Promise.any race, 8s timeout), returns `{url, api}` |
| 315 | `downloadBingBlob(url)` | CORS-fetch image URL as Blob |
| 323 | `loadBingMeta()` | Read `ptab_bing_meta` JSON from localStorage |
| 331 | `saveBingMeta(meta)` | Write `ptab_bing_meta` JSON to localStorage |
| 339 | `cacheBingBlob(url, provider, today)` | Download blob, dedup by URL, store to IDB + update meta. Skips download if same URL + blob exists |
| 371 | `cacheBingInBackground()` | Silent background Bing fetch for local mode pre-caching |
| 389 | `loadWallpaper()` | Main wallpaper loading flow: local rotation → Bing cache → network fetch |
| 466 | `generateId()` | Generate unique ID string for local images |
| 471 | `saveLocalImage(file, show)` | Core: dedup check → generate thumb → save blob (IDB) + thumb (localStorage) atomically. show=true displays wallpaper |
| 502 | `setLocalWallpaper(file, keepOpen)` | Thin wrapper for gallery "+" button single upload |
| 511 | `deleteLocalImage(id)` | Remove image from IDB array + splice thumb at same index |
| 541 | `resetToBing()` | Clear all local data, switch to Bing mode |
| 569 | `openSettings()` | Show settings panel, refresh gallery if local mode |
| 582 | `closeSettings()` | Hide settings panel, revoke gallery blob URLs |
| 591 | `openLangPanel()` | Show language selector panel |
| 600 | `closeLangPanel()` | Hide language selector panel |
| 607 | `closeAll()` | Close both panels |
| 613 | `revokeGalleryUrls()` | Revoke all tracked blob URLs |
| 618 | `removeLocalGallery()` | Hide gallery DOM, restore upload/reset buttons |
| 626 | `refreshLocalGallery()` | Load images from IDB → render gallery |
| 633 | `renderLocalGallery(images, thumbs)` | Build 3×4 gallery grid from thumbnails (base64 preferred, blob fallback) |
| 697 | `showCorners()` | Fade in corner buttons |
| 703 | `hideCorners()` | Fade out corner buttons (debounced) |
| 715 | `isNearTopRight(x, y)` | Hit test for corner button zone |
| 718 | `isInCenter(x, y)` | Hit test for search bar zone |
| 724 | `showSearch()` | Show search bar |
| 732 | `hideSearch()` | Hide search bar (debounced) |
| 746 | `applySearchMode(mode)` | Set search bar visibility mode |
| 752 | `applyOpacity(val)` | Set icon opacity |
| 760 | `applyEngine(engine)` | Switch search engine |
| 769 | `nextEngine()` | Cycle to next search engine (web mode) |
| 775 | `saveSettings()` | Persist all search UI settings |
| 782 | `loadSettings()` | Restore all search UI settings from localStorage |
| 817 | `setupExtensionMode()` | Extension-only: hide engine UI, bind chrome.search.query |
| 934 | `init()` | Bootstrap: detect lang → load settings → load wallpaper → bind events |

Event bindings and global initialization run at the bottom of the IIFE (after `init()`).
