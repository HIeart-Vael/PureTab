<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab 標誌" width="80">
</p>

<h1 align="center">PlainTab V3 · 簡約起始頁面</h1>

> **一個新分頁應該只做一件事：**
> 開啟 → 向你展示你喜歡的桌布 → 將你帶到需要的頁面。
> 你真的需要時間、問候語或一螢幕的捷徑嗎？
> **PlainTab 的答案：極簡減法。從零開始重寫，採用雙層桌布架構。零閃爍 — 讓你的新分頁回歸純粹的「PLAIN」。**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.4-blue?style=flat-square" alt="版本">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="授權條款">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="線上展示">
  </a>
</p>

<p align="center">
  <strong>一個乾淨、快速且不擾人的起始頁面與新分頁解決方案。</strong><br>
  前往 <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · 零閃爍 · 無檔案大小限制<br>
  Bing 每日桌布 · 本機圖片 · 16 種語言 · 彈性搜尋列 · <strong>隱私優先</strong>
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

## 🆕 v3 的新功能

v3 是**從零開始的完全重寫**，並有一項重大突破：**零閃爍雙層桌布系統**。

<details>
<summary><b>💡 為什麼 v2 會閃爍？</b></summary>

舊版本使用單一的 `<div>` 搭配 CSS `background-image` 切換。從縮圖（樣式表規則）切換到完整圖片（行內樣式）需要一次級聯變更 — 在此過程中，瀏覽器至少會有一幀放棄已渲染的背景，露出灰色底色。

</details>

**v3 的解決方案 — 雙層合成：**
1. `#wallpaperBack` — 始終保持可見圖片。`preload.js` 在瀏覽器首次繪製前同步寫入 640px 縮圖
2. `#wallpaperFront` — 以透明開始。在完整圖片解碼完成後，淡入顯示在上層
3. 至少有一層始終顯示可見圖片 → **無灰色閃爍**

完整技術細節請參閱 [V3_NOTE.md](./V3_NOTE.md)。

---

## ✨ 為什麼選擇 PlainTab？

- 🔒 **絕對乾淨的隱私** — 不收集任何個人資料。所有桌布均儲存於本地。
- 🚀 **一分鐘內完成統一瀏覽起點** — 設為首頁 + 安裝擴充功能。擴充功能絕不強制更改首頁。
- 🧩 **輕巧到幾乎無感** — 零相依性、純 JavaScript、即時啟動。
- 🌍 **開箱即用** — 自動偵測瀏覽器語言（16 種），支援 Google / Bing / Baidu / DuckDuckGo。

---

## 🚀 兩種體驗方式

| 方式 | 說明 | 最適合 |
|------|------|--------|
| 🌐 **線上起始頁面** | 前往 [plaintab.netlify.app](https://plaintab.netlify.app)，設為瀏覽器首頁 | 不須安裝任何東西的乾淨首頁 |
| 🧩 **瀏覽器擴充功能** | 從 Chrome 或 Edge 商店安裝擴充功能 | 每個新分頁都能享受極簡體驗 |

### 瀏覽器擴充功能 · 商店安裝
- **Chrome Web Store**: [即將上架]()
- **Edge Add-ons**: [即將上架]()

> 💡 尚未上架？可透過開發者模式手動載入：前往 `chrome://extensions` → 啟用**開發者模式** → **載入未封裝項目** → 選擇專案資料夾

---

## 💡 開發者推薦：三張壁紙，三重入口

你已經安裝了擴充功能——你的新分頁已經很好看。但你可能不知道——PlainTab 還部署在另外兩個地方：

| 入口 | 設定項 | 推薦地址 |
|------|--------|----------|
| 🧩 **新分頁** | 瀏覽器擴充功能 | 載入本擴充功能 |
| 🌐 **起始頁** | 瀏覽器啟動時開啟 | `plaintab.netlify.app` |
| 🏠 **首頁** | 點擊首頁按鈕時開啟 | `kaininx.github.io/PlainTab` |

把 `plaintab.netlify.app` 設為瀏覽器的起始頁，讓它跟著 Bing 每日更新——每次開啟瀏覽器，這就是你的**第二張壁紙**。

沒錯，還沒完。再到瀏覽器外觀設定中找到「首頁按鈕」，填入 `kaininx.github.io/PlainTab`，換上你喜歡的另一張壁紙——現在你有了**第三張壁紙**。

三個入口彼此隔離，互不干擾。給它們分別放一張不同的本地壁紙，或者讓它們各自跟著 Bing 每日刷新。打開瀏覽器是一張，點首頁按鈕是一張，開新分頁又是一張——換著看，不重樣。

**設定步驟：**
1. 裝好擴充功能 → 新分頁 ✓
2. 瀏覽器設定 → 啟動時 → 開啟特定網頁 → 填入 `https://plaintab.netlify.app`
3. 瀏覽器設定 → 外觀 → 顯示首頁按鈕 → 填入 `https://kaininx.github.io/PlainTab`

---

## 🛠️ 使用方法

| 操作 | 效果 |
|------|------|
| 將滑鼠移至右上角 | 顯示語言 / 設定圖示 |
| 將滑鼠移至中央附近 | 搜尋列淡入（懸停模式） |
| 點選齒輪圖示 | 開啟桌布與進階選項面板 |
| 點選地球圖示 | 切換介面語言 |
| 點選搜尋引擎圖示 | 循環切換 Google → Bing → Baidu → DuckDuckGo |
| 在搜尋列中按 `Enter` | 使用目前引擎搜尋 |
| 按 `Esc` | 關閉所有面板 |

### 桌布
- **Bing 每日**：每天自動抓取一次。僅快取今天的圖片於本地。
- **本機桌布**：上傳任意大小的圖片（IndexedDB，**無檔案大小限制**）。僅保留最後一張上傳的圖片。一鍵重設為 Bing 每日。

### 進階選項
| 選項 | 說明 |
|------|------|
| 搜尋列模式 | 懸停 / 永遠顯示 / 隱藏 |
| 圖示透明度 | 0 – 1（預設 0.45） |
| 搜尋引擎 | Google / Bing / Baidu / DuckDuckGo |

> **Chrome 擴充功能 vs Web 版的搜尋差異：** 為遵循 Chrome Web Store 的「單一用途」政策，擴充功能版使用 Chrome Search API 進行搜尋，直接呼叫使用者在瀏覽器設定中選定的預設搜尋引擎，不再提供引擎切換功能。Web 版（Netlify / GitHub Pages）不受此限制，保留完整的搜尋引擎選擇器。除搜尋實作外，兩個版本功能完全一致。

> 所有設定儲存在 `localStorage` 中。無需帳號，無雲端同步。

---

## 🔧 新分頁底部灰條

安裝擴充功能後，Chrome / Edge 新分頁右下角會顯示頁尾（標明目前擴充功能名稱）。這是瀏覽器行為，並非 PlainTab 添加。

**關閉方法（來自 [Chrome 官方說明](https://support.google.com/chrome/answer/11032183?hl=zh-TW)）：**

開啟新分頁 → 點選右下角「自訂 Chrome」✏️ 圖示 → 頁尾 → 關閉「在新分頁頁面上顯示頁尾」。

---

## 🌐 多語言支援

內建 16 種語言，自動從瀏覽器偵測，可隨時手動選擇：
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 貢獻方式

歡迎提出 Issue 和 Pull Request。請保持 PlainTab 的極簡風格 — 純 JavaScript，無建置步驟，無相依性。

---

## 📄 授權條款

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 致謝

- Bing 桌布 API：[bing.img.run](https://bing.img.run) 與 [bing.biturl.top](https://bing.biturl.top)
- 截圖中的部分桌布來自網路 — 感謝每一位才華洋溢的創作者。

---

<p align="center">
  <sub>乾淨 · 快速 · 無廣告 · 唯你專屬</sub>
</p>
