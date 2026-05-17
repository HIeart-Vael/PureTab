<p align="center">
  <img src="../../icon/icon2048.png" alt="PlainTab Logo" width="88">
</p>

<h1 align="center">PlainTab Technical Notes</h1>

<p align="center">
  For people who want to read the code, change features, learn browser extension development, or study AI-assisted project work.
</p>

<p align="center">
  <a href="README_zh-CN.md">中文</a>
  ·
  <a href="../../README.md">Project README</a>
  ·
  <a href="../README_zh-CN.md">中文介绍</a>
  ·
  <a href="../RELEASE_NOTES.md">Release Notes</a>
  ·
  <a href="https://plaintab.kaininx.workers.dev">Live Demo</a>
</p>

<div align="center">
  <img src="../../imgs/chrome_01.jpg" width="45%" alt="PlainTab screenshot 1" />
  <img src="../../imgs/chrome_02.jpg" width="45%" alt="PlainTab screenshot 2" />
</div>

## Before Reading

This document is not a store listing and not a full API reference. It explains:

- how PlainTab's core experience is implemented;
- where to start reading the code;
- which modules own which responsibilities;
- which areas need extra care when modified;
- why the project stays static, lightweight, and dependency-free.

If you only want to know whether PlainTab is worth trying, start with the [project README](../../README.md) or the [Chinese introduction](../README_zh-CN.md). If you want to learn, modify, or maintain the project, this document is the better entry point.

## Project Positioning

PlainTab is a Chrome / Edge Manifest V3 new-tab extension. The same page can also run as a standalone web page by opening `index.html` directly.

The project constraints are deliberate:

- no npm dependency;
- no frontend framework;
- no build step;
- vanilla JavaScript, CSS, and browser APIs;
- one shared codebase for extension mode and web mode;
- the new-tab opening experience has priority over architectural elegance.

PlainTab is more direct than a modern framework application: scripts are loaded in order from HTML, CSS is split by feature, and runtime modules cooperate through `window` namespaces. The goal is not formal purity. The goal is fast opening, stable behavior, and code that is easy to inspect.

## Startup Path

The most important path is the wallpaper shown when the page first opens. The order in [index.html](../../index.html) is intentional:

1. `#wallpaperBack` enters the DOM first.
2. [js/preload.js](../../js/preload.js) runs synchronously.
3. `#wallpaperFront` enters the DOM.
4. language, wallpaper, settings, and main runtime scripts load after that.

[js/preload.js](../../js/preload.js) does one thing: read `ptab_wallpaper_preview` from `localStorage`, and if it exists and is reasonably sized, write it into `#wallpaperBack.style.backgroundImage`.

It must not:

- access IndexedDB;
- fetch from the network;
- generate thumbnails;
- scan folders;
- wait for async callbacks;
- depend on the main runtime modules.

It sits on the earliest visible path. If it becomes heavy, users are more likely to see an empty wait before the wallpaper appears.

## Wallpaper Rendering

Wallpaper rendering is owned by [js/wallpaper/show.js](../../js/wallpaper/show.js). The page uses two wallpaper layers:

| Layer | Role |
|------|------|
| `#wallpaperBack` | Holds the stable current image; also receives the startup preview from `preload.js` |
| `#wallpaperFront` | Fades in the next image, then hands the final image back to the back layer |

This is not complexity for its own sake. It prevents the background from being cleared while a new image is loading, decoding, or transitioning.

The public runtime surface is `WallpaperShow`:

- `apply(url, transitionMs, sourceId)`: load and fade in a new image.
- `applyAndSavePreview(url, sourceId)`: apply an image and generate the next startup preview.
- `thumbnail(source)`: generate a normal thumbnail.
- `blurredThumbnail(source, blur)`: generate a blurred thumbnail.
- `showPreparedPreview(preview)`: directly display a prepared preview.
- `showPreparedUrl(url, id)`: directly display a prepared image URL.

If you need to change wallpaper transitions, start with `show.js` and [css/wallpaper.css](../../css/wallpaper.css). Other UI modules should not directly manage the two wallpaper layers.

## WASM Theme Engine

Wallpaper theme colors are owned by [js/wallpaper/theme.js](../../js/wallpaper/theme.js). They do not run on the startup hot path. After a wallpaper is shown, [js/wallpaper/show.js](../../js/wallpaper/show.js) schedules theme extraction after animation frames and during idle time.

Theme extraction has two paths:

| Path | File | Role |
|------|------|------|
| WASM | [js/wallpaper/theme_engine.wasm](../../js/wallpaper/theme_engine.wasm) | preferred path for pixel analysis and palette extraction |
| JS fallback | [js/wallpaper/theme.js](../../js/wallpaper/theme.js) | fallback when WASM cannot load, keeping web mode and failure cases usable |

The C++ source lives in [wasm/theme_engine.cpp](../../wasm/theme_engine.cpp). Build scripts live in [wasm/build.bat](../../wasm/build.bat) and [wasm/build.sh](../../wasm/build.sh). On Windows:

```powershell
.\wasm\build.bat
```

This generates `js/wallpaper/theme_engine.wasm`, which is the runtime asset loaded by the extension. The source and build scripts stay under `wasm/`.

Runtime flow:

1. `theme.js` draws the current wallpaper into a `96x96` Canvas.
2. `getImageData()` reads the RGBA pixels.
3. JS writes the pixels into WASM linear memory.
4. C++ performs spatial weighting, color-quality weighting, color quantization, Top color ranking, and candidate selection.
5. `decodeWasmPalette()` decodes the WASM result buffer into a JS palette.
6. `themeFromPalette()` turns the palette into final CSS theme variables.

The C++ palette includes:

- `dominant`: highest-weight dominant color.
- `mood`: weighted average of the top colors.
- `vibrant`: high-saturation accent candidate.
- `muted`: softer mid-saturation candidate.
- `dark` / `light`: dark and light candidates.
- `top`: the top 32 weighted colors.

The WASM engine is not a direct translation of the old JS loop. It adds wallpaper-specific analysis:

- center pixels receive a mild spatial boost, reducing edge, border, and vignette noise;
- very dark, very bright, and low-saturation gray pixels are down-weighted;
- each quantized bucket outputs a real weighted average RGB, not just the bucket center;
- average luminance is weighted as well.

In extension mode, `manifest.json` must keep:

```text
script-src 'self' 'wasm-unsafe-eval'
```

Chrome MV3 extension pages need that directive for WebAssembly. In normal web or `file://` mode, if the browser refuses to fetch local wasm, the theme system falls back to JS automatically.

### Measured Performance

The following numbers came from extension mode, local wallpaper `少女-绿感.png`, and 50 benchmark rounds. The current WASM/JS comparison uses the same `96x96` sample, or 9216 pixels.

| Item | Time |
|------|------|
| Canvas `getImageData`, 96x96 | 0.638 ms |
| First WASM analysis / initialization | 0.600 ms |
| WASM analysis, 96x96 | 0.210 ms |
| WASM total, pixel read + analysis | 0.848 ms |
| JS analysis, 96x96 | 0.376 ms |
| JS total, pixel read + analysis | 1.014 ms |
| Legacy JS 36x36 total | 0.138 ms |

Takeaways:

- For the same `96x96` input, WASM analysis is about `1.79x` faster than JS.
- Including Canvas pixel read, the total path is about `1.20x` faster.
- The legacy `36x36` path is still faster because it only processes 1296 pixels; the current path processes 9216 pixels, or 7.1x more.
- The point of the current design is not to beat the old low-resolution path on raw time. It spends less than 1 ms total to get a higher-resolution and more stable palette.

## Wallpaper Data

Wallpaper data and storage helpers live in [js/wallpaper/data.js](../../js/wallpaper/data.js).

PlainTab uses both `localStorage` and IndexedDB:

| Storage | Main Use |
|---------|----------|
| `localStorage` | small settings, UI preferences, previews, thumbnails, current source state |
| IndexedDB | larger image blobs for Bing / API / uploads / RSS, plus folder handles |

The startup preview must be in `localStorage` because it needs synchronous access. Full images are too large for that path, so they live in IndexedDB.

Common keys include:

- `ptab_wallpaper_preview`: preview used during startup.
- `ptab_wallpaper`: wallpaper provider model.
- `ptab_wallpaper_thumbs`: thumbnail cache.
- `ptab_wallpaper_blur_thumbs`: blurred thumbnail cache.
- `ptab_ui`: UI preferences for search, appearance, and wallpaper display.
- `ptab_shortcuts`: command palette links and settings.
- `ptab_shortcut_icons`: shortcut icon cache.

For large data, write the large payload before writing references. When deleting, remove references before deleting the payload. Otherwise an interrupted write can leave state pointing to missing data.

## Wallpaper Sources

PlainTab currently supports five wallpaper source types:

| Source | File / Module | Notes |
|--------|---------------|-------|
| Bing | [js/wallpaper/fetch.js](../../js/wallpaper/fetch.js) | default source, cached by date |
| Upload | settings modules + `WallpaperData` | user-selected images stored as blobs and thumbnails |
| Folder | [js/wallpaper/folder.js](../../js/wallpaper/folder.js) | reads a local folder through the File System Access API |
| RSS | settings modules + fetch/data | fetches image feeds and caches usable entries |
| API | settings modules + fetch/data | supports direct image URLs and JSON image fields |

All sources share the same display layer. Whether the image comes from the network, an upload, a local folder, RSS, or an API, it should eventually go through `WallpaperShow` for display, preview generation, and transition handling.

Failure policy:

- do not clear the current image just because the active source failed;
- reuse old cache when possible;
- keep Bing cache as a general fallback where possible;
- ask for confirmation before switching away from a source when cached data may be discarded;
- if applying a new source fails, keep the previous stable state.

## Settings System

The settings system has two layers:

| Layer | File | Role |
|-------|------|------|
| Level-one panel | [js/settings-bootstrap.js](../../js/settings-bootstrap.js) | lightweight entry, upload button, active source, version / GitHub |
| Full settings | [js/settings-panel.js](../../js/settings-panel.js) | appearance, wallpaper, shortcuts, data, about |

The level-one panel must stay lightweight. It is used often and should not eagerly load the whole settings module.

Full settings use two save models:

- UI preferences are saved immediately, such as search position, opacity, radius, and wallpaper fit.
- Wallpaper source settings use a draft model and are only saved after the user clicks "Apply configuration".

Wallpaper sources use drafts because they may involve network tests, folder permissions, cache cleanup, and source switching. A single accidental click should not break the current stable wallpaper state.

## Search Bar

The search bar is defined in [index.html](../../index.html), styled by [css/search.css](../../css/search.css), and controlled mainly by [js/newtab.js](../../js/newtab.js) plus the settings modules.

Supported behavior:

- visibility modes: always, hover, hidden;
- configurable position, width, radius, background opacity, and blur;
- optional search history;
- multiple search engines in web mode;
- extension mode hides engine switching where it does not fit the extension environment.

Search settings are stored in `ptab_ui.search`.

## Command Palette

The command palette is implemented in [js/command-palette.js](../../js/command-palette.js), with styles in [css/command-palette.css](../../css/command-palette.css).

It is lazy-loaded. If the user never opens the palette, the full palette logic should not enter the startup path.

Main capabilities:

- add, edit, and delete shortcuts;
- separate normal and hidden spaces;
- recent visits;
- bookmark HTML import;
- shortcut export;
- list and icon views;
- configurable hotkeys.

The command palette owns shortcuts only. Full configuration import/export belongs to the data tab in the settings panel. Keep those boundaries separate.

## Data Backup

The data tab supports:

- plain JSON export;
- encrypted backup export;
- configuration import.

Backups mainly include user configuration: UI preferences, wallpaper configuration, shortcuts, hotkeys, and search settings.

They do not fully include:

- large image blobs in IndexedDB;
- local folder permissions;
- original files on the user's disk.

That boundary is intentional. Local resources should be re-selected by the user after cross-device restore; otherwise backups become heavy and fragile.

## Internationalization

PlainTab has two i18n systems:

| Location | Use |
|----------|-----|
| [_locales/](../../_locales/) | Chrome extension manifest strings, such as extension name and description |
| [js/languages.js](../../js/languages.js) | page UI strings |

When adding UI text, do not update only one language. At minimum, make sure an English fallback exists so unknown language environments do not show raw keys.

## Runtime Modes

PlainTab can run in two modes:

| Mode | Entry | Notes |
|------|-------|-------|
| Extension mode | Chrome / Edge new tab | uses `manifest.json`; browser overrides the new tab page |
| Web mode | open `index.html` directly | can be used as an online start page or local web page |

Code should account for environment differences:

- `chrome.runtime` may not exist;
- extension APIs are not available in normal web pages;
- folder access depends on browser support;
- optional host permissions only matter in extension mode.

## Directory Structure

```text
PlainTab/
├── index.html              # page entry; script order matters
├── manifest.json           # Manifest V3 extension config
├── 404.html                # static deployment fallback
├── css/
│   ├── base.css            # global base styles and variables
│   ├── wallpaper.css       # wallpaper layers, gallery, RSS caption
│   ├── search.css          # search bar and history suggestions
│   ├── settings.css        # settings panel
│   └── command-palette.css # command palette
├── js/
│   ├── preload.js          # startup preview hot path
│   ├── languages.js        # UI i18n
│   ├── newtab.js           # main runtime
│   ├── settings-bootstrap.js
│   ├── settings-panel.js
│   ├── command-palette.js
│   └── wallpaper/
│       ├── data.js         # storage and data model
│       ├── show.js         # wallpaper display and thumbnails
│       ├── fetch.js        # network wallpaper sources
│       ├── folder.js       # local folder source
│       ├── theme.js        # wallpaper theme color logic
│       └── theme_engine.wasm # C++/WASM theme analysis runtime
├── wasm/
│   ├── theme_engine.cpp    # WASM theme engine source
│   ├── build.bat           # Windows build script
│   └── build.sh            # shell build script
├── _locales/               # extension manifest i18n
├── docs/                   # docs, release notes, AI task notes
├── icon/                   # icons
├── imgs/                   # screenshots and store assets
```

## Development Constraints

When changing the project, keep these constraints in mind:

- do not add npm, `package.json`, or build tooling;
- do not add React, Vue, Tailwind, or other runtime-heavy dependencies;
- do not expand extension permissions casually;
- do not put network, IndexedDB, Canvas, or folder scanning work into `preload.js`;
- do not change the critical order of wallpaper layers and `preload.js` in `index.html`;
- do not clear both wallpaper layers during a transition;
- write large data and references in the correct order;
- new settings should consider import/export, defaults, and i18n;
- the command palette should not enter the synchronous startup path;
- keep the visible page quiet; do not turn it into a feed or widget dashboard.

If you are unsure about a module, read the matching file under [.claude/rules/](../../.claude/rules/). Those files document the current implementation constraints.

## AI Collaboration

PlainTab has been developed with heavy AI collaboration. The interesting part is not just the code, but the workflow:

- documentation constrains AI changes;
- rule files preserve module invariants;
- task notes capture design and verification for complex work;
- AI participates in implementation, refactoring, documentation, test scripts, and release preparation.

Related files:

- [AGENTS.md](../../AGENTS.md): shared AI entry point.
- [.claude/rules/](../../.claude/rules/): module rules.
- [docs/ai-tasks/](../ai-tasks/): AI task notes and verification scripts.

If you want to study AI-assisted development on a real project rather than a one-off demo, PlainTab is a good project to inspect.

## Quick Start

Extension mode:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose "Load unpacked".
4. Select the PlainTab project directory.

Web mode:

Open [index.html](../../index.html) directly in a browser.

Live demo:

[plaintab.kaininx.workers.dev](https://plaintab.kaininx.workers.dev)

## Related Links

- [中文技术说明](README_zh-CN.md)
- [Project README](../../README.md)
- [中文介绍](../README_zh-CN.md)
- [Release Notes](../RELEASE_NOTES.md)
- [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo)
- [GitHub repository](https://github.com/kaininx/PlainTab)

## License

PlainTab is open source under the [MIT License](../../LICENSE).
