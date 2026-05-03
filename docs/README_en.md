<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab V3 · Minimal Start Page</h1>

> **A new tab should do only one thing:**
> Open → show you a wallpaper you enjoy → send you to the page you need.
> Do you really need the time, a greeting, or a screen full of shortcuts?
> **PlainTab's answer: radical subtraction. A ground-up rewrite with dual-layer wallpaper architecture. Zero flicker — let your new tab return to pure 「PLAIN」.**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.2-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="License">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<p align="center">
  <strong>A clean, fast, and non-intrusive start page and new tab solution.</strong><br>
  Live at <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · zero flicker · no file size limit<br>
  Bing Daily Wallpaper · Local Images · 16 Languages · Flexible Search Bar · <strong>Privacy-First</strong>
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

## 🆕 What's New in v3

v3 is a **complete rewrite from scratch** with a breakthrough: **zero-flicker dual-layer wallpaper system**.

<details>
<summary><b>💡 Why did v2 flicker?</b></summary>

The old version used a single `<div>` with CSS `background-image` switching. Going from thumbnail (stylesheet rule) to full image (inline style) required a cascade change — during which the browser dropped the rendered background for at least one frame, revealing the gray backdrop.

</details>

**v3's solution — Dual-Layer Compositing:**
1. `#wallpaperBack` — always holds a visible image. `preload.js` synchronously writes a 640px thumbnail before the browser's first paint
2. `#wallpaperFront` — starts transparent. After the full image is decoded, fades in on top
3. At least one layer always has a visible image → **zero gray flash**

See [CHANGELOG.md](./CHANGELOG.md) for full technical details.

---

## ✨ Why PlainTab?

- 🔒 **Absolutely Clean Privacy** — No personal data collected. All wallpapers stored locally.
- 🚀 **Unified Browsing Start in One Minute** — Set as homepage + install extension. Extension never forces homepage changes.
- 🧩 **So Light You Barely Feel It** — Zero dependencies, pure vanilla JavaScript, instant startup.
- 🌍 **Works Out of the Box** — Auto-detects browser language (16 total), supports Google / Bing / Baidu / DuckDuckGo.

---

## 🚀 Two Ways to Experience It

| Method | Description | Best For |
|--------|-------------|----------|
| 🌐 **Online Start Page** | Visit [plaintab.netlify.app](https://plaintab.netlify.app), set as browser homepage | A clean homepage without installing anything |
| 🧩 **Browser Extension** | Install from Chrome or Edge store; new tabs automatically become PlainTab | Minimalist experience on every new tab |

### Browser Extension · Store Installation
- **Chrome Web Store**: [Coming soon]()
- **Edge Add-ons**: [Coming soon]()

> 💡 Not live yet? Load manually in dev mode: go to `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the project folder

---

## 💡 Developer's Pick: Three Wallpapers, Three Entrances

You've installed the extension — your new tab already looks great. But here's something you might not know: PlainTab is also deployed in two more places:

| Entrance | Setting | URL |
|------|--------|----------|
| 🧩 **New Tab** | Browser extension | Load this extension |
| 🌐 **Start Page** | Browser launch | `plaintab.netlify.app` |
| 🏠 **Homepage** | Home button | `kaininx.github.io/PlainTab` |

Set `plaintab.netlify.app` as your browser's start page, let it follow Bing's daily update — every time you launch the browser, that's your **second wallpaper**.

Yes, there's more. Find the "Home button" in your browser's appearance settings, put in `kaininx.github.io/PlainTab`, pick another wallpaper you like — now you've got a **third wallpaper**.

The three entrances are completely isolated. Give each one a different local wallpaper, or let them each follow Bing's daily refresh. Launch the browser: one wallpaper. Click the home button: another. Open a new tab: a third one — rotation guaranteed.

**Setup:**
1. Install the extension → New Tab ✓
2. Browser settings → On startup → Open a specific page → `https://plaintab.netlify.app`
3. Browser settings → Appearance → Show home button → `https://kaininx.github.io/PlainTab`

---

## 🛠️ Usage

| Action | Effect |
|--------|--------|
| Move mouse to top-right | Show language / settings icons |
| Move mouse near center | Search bar fades in (Hover mode) |
| Click gear icon | Open wallpaper & advanced options panel |
| Click globe icon | Switch interface language |
| Click search engine icon | Cycle Google → Bing → Baidu → DuckDuckGo |
| Press `Enter` in search bar | Search with current engine |
| Press `Esc` | Close all panels |

### Wallpaper
- **Bing Daily**: Auto-fetched once per day. Only today's image cached locally.
- **Local Wallpaper**: Upload images of any size (IndexedDB, **no file size limit**). Only the last uploaded image is kept. One-click reset to Bing daily.

### Advanced Options
| Option | Description |
|--------|-------------|
| Search bar mode | Hover / Always / Hidden |
| Icon opacity | 0 – 1 (default 0.45) |
| Search engine | Google / Bing / Baidu / DuckDuckGo |

> **Chrome Extension vs. Web Version — Search Difference:** To comply with the Chrome Web Store's "Single Purpose" policy, the extension uses the Chrome Search API, which respects the default search engine set in the user's browser settings. The engine switching feature is not available in extension mode. The web version (Netlify / GitHub Pages) is not subject to this restriction and retains the full search engine selector. Other than the search implementation, both versions are functionally identical.

> All settings saved in `localStorage`. No account, no cloud sync.

---

## 🔧 New Tab Footer Bar

After installing the extension, Chrome / Edge shows a footer at the bottom-right of the new tab page (displaying the extension name). This is browser behavior, not something PlainTab adds.

**How to hide it (from [Chrome Help](https://support.google.com/chrome/answer/11032183?hl=en)):**

Open a new tab → click the "Customize Chrome" ✏️ icon in the bottom-right corner → Footer → turn off "Show footer on New Tab page".

---

## 🌐 Multilingual Support

16 built-in languages, auto-detected from browser, manually selectable at any time:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Contributing

Issues and Pull Requests welcome. Keep PlainTab minimal — vanilla JS, no build steps, no dependencies.

---

## 📄 License

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Acknowledgements

- Bing wallpaper APIs: [bing.img.run](https://bing.img.run) & [bing.biturl.top](https://bing.biturl.top)
- Some wallpapers in screenshots are from the web — thanks to every talented creator.

---

<p align="center">
  <sub>Clean · Fast · No Ads · Only Yours</sub>
</p>
