<p align="center">
  <img src="icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Minimal Start Page</h1>
<p align="center">
  <a href="README.md">简体中文</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.2.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="License">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<p align="center">
  <strong>A clean, fast, and non-intrusive start page and new tab solution.</strong><br>
  Live at <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · Browser extension coming soon to Edge/Chrome Web Stores<br>
  Bing Daily Wallpaper · Local Images · 16 Languages · Flexible Search Bar · <strong>Privacy-First</strong>
</p>

<div align="center">
  <img src="imgs/chrome_01.jpg" width="45%" />
  <img src="imgs/chrome_02.jpg" width="45%" /> 
  <img src="imgs/chrome_03.jpg" width="45%" />
  <img src="imgs/chrome_04.jpg" width="45%" /> 
  <img src="imgs/chrome_05.jpg" width="45%" />
  <img src="imgs/chrome_06.jpg" width="45%" /> 
  <img src="imgs/chrome_07.jpg" width="45%" />
  <img src="imgs/chrome_08.jpg" width="45%" /> 
</div>

---

## ✨ Why PlainTab?

- 🔒 **Absolutely Clean Privacy**  
  No personal data is collected, and no sensitive permissions are requested. All wallpapers are stored only on your local device. Your browsing habits are yours alone.

- 🚀 **A Unified Browsing Start in One Minute**  
  Set `plaintab.netlify.app` as your browser's homepage, then install the extension to take over the new tab page. Your homepage, start page, and new tab page will all share the same minimalist style—the extension **will not forcibly modify your homepage settings**. You are free to use any start page URL you like.

- 🧩 **So Light You Barely Feel It**  
  Zero external dependencies, pure vanilla JavaScript. It loads instantly and never slows down any of your clicks.

- 🌍 **Works Out of the Box but Understands You**  
  Automatically detects your browser language (16 in total) and supports Google, Bing, Baidu, and DuckDuckGo. The search bar can be set to "Hover," "Always," or "Never" to match your habits.

---

## 🚀 Two Ways to Experience It

| Method | Description | Best For |
|--------|-------------|----------|
| 🌐 **Online Start Page** | Visit [plaintab.netlify.app](https://plaintab.netlify.app) and set it as your browser's homepage/start page | Those who just want a clean homepage without installing an extension |
| 🧩 **Browser Extension** | Load the extension manually (coming soon to Edge/Chrome Web Stores). New tabs will automatically become PlainTab | Those who want the same minimalist experience on every new tab page |

> 💡 We recommend using both: the online version for your homepage and the extension for new tabs, so every start point feels clean and familiar.

### Browser Extension · Manual Installation (Developer Mode)
1. Clone the repository  
   `git clone https://github.com/kaininx/PlainTab.git`
2. Open Chrome or Edge and go to `chrome://extensions`
3. Enable **Developer mode** in the top right corner
4. Click **Load unpacked** and select the project folder
5. Done! Open a new tab to see PlainTab in action.

---

## 🛠️ How to Use

| Action | Effect |
|--------|--------|
| Move the mouse to the top-right corner | Show language/settings icons |
| Move the mouse near the center of the page | The search bar fades in (in "Hover" mode) |
| Click the gear icon | Open the wallpaper and advanced options panel |
| Click the globe icon | Switch the interface language |
| Click the search engine icon | Cycle through Google → Bing → Baidu → DuckDuckGo |
| Press `Enter` in the search bar | Search using the currently selected engine |
| Press `Esc` | Close all panels |

### Wallpaper
PlainTab's wallpaper storage is intentionally restrained and **won't bloat your cache**:

- **Bing Daily Wallpaper**: Automatically pulls once a day, caching only **the one for the current day**. The old cache is automatically replaced, ensuring you can see yesterday's image offline the next day while preventing storage bloat.
- **Local Wallpaper**: You can upload your own picture (stored via IndexedDB). The system always keeps only **the most recent** uploaded wallpaper; a new upload replaces the old one. A single click on "Reset to Bing daily" removes the local image and returns to automatic daily updates.

### Advanced Options
| Option | Description |
|--------|-------------|
| Search bar mode | Hover / Always / Never |
| Icon opacity | 0 – 1 (default 0.45) |
| Default search engine | Google / Bing / Baidu / DuckDuckGo |

> All settings are automatically saved in `localStorage`. No account needed, no cloud sync.

---

## 🌐 Multilingual Support

16 built-in languages that switch automatically based on your browser language, or can be selected manually at any time:  
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

Want to contribute a new language? Just edit `languages.js` and submit a Pull Request.

---

## 🤝 Contributing

Any issues and pull requests are welcome.  
But before you start, please keep our shared goal in mind:

- **PlainTab's style is "minimal"**. Every line of code and every feature is carefully weighed to ensure it doesn't become bloated. If some seemingly brilliant proposals are ultimately not adopted, it is not a denial of their value, but a commitment to guarding this principle of restraint.
- Please follow the existing code style—vanilla JS, no build steps, no third-party dependencies.

Basic workflow:
1. Fork the repository  
2. Create a new branch (`feat/your-feature`)  
3. Commit your changes  
4. Push to the branch  
5. Open a Pull Request

---

## 📄 License

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Acknowledgements

- The Bing wallpaper API is from [bing.img.run](https://bing.img.run) and [bing.biturl.top](https://bing.biturl.top). Thank you for providing a stable service.
- Some wallpapers used in the screenshots are from the internet. **Thanks to every talented creator**. As this project is purely a non-commercial passion project, I was unable to trace all sources. If you are the copyright owner of any work and believe its display infringes upon your rights, please contact me—I will work with you immediately to obtain authorization or replace the image. I deeply respect every creator's rights.

---

<p align="center">
  <sub>Clean · Fast · No Ads · Only Yours</sub>
</p>