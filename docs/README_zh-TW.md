<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab 標誌" width="80">
</p>

<h1 align="center">PlainTab · 極簡起始頁</h1>


> 新分頁只該做好一件事——被打開，展示一張好看的桌布，送你前往下一個網頁。你真的需要時鐘、問候語，或是滿滿的捷徑連結嗎？
>
> PlainTab 的答案：極致的減法，極快的速度——讓你的新分頁回歸她原本的樣子，美麗而乾淨。

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt_BR.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.1-blue?style=flat-square" alt="版本">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="授權條款">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/線上體驗-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 查看更多截圖</b></summary>
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
打開新分頁是一個瞬間動作——`Ctrl+T` 按下去，你期望你的桌布已經在那裡了。為了做好這件事，PlainTab 的全部設計都圍繞一個目標：**讓桌布盡可能快地出現在螢幕上**，沒有任何可見的載入過程。雙層桌布架構、同步預載入、Canvas 縮圖管線、混合儲存策略——所有技術決策的終點都是同一件事：更快、更流暢、更無感。


PlainTab 專案同時是一個 Manifest V3 瀏覽器擴充功能與一個獨立的 Web 頁面。零外部依賴，無建置步驟，純 vanilla JS + CSS。擴充模式與 Web 模式共用同一套程式碼，執行時自動偵測環境切換行為。[線上即用](https://plaintab.netlify.app)。

---

## 快速上手

**瀏覽器擴充功能**：[Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) 安裝。

**線上起始頁**：造訪 [plaintab.netlify.app](https://plaintab.netlify.app)，在瀏覽器設定中將其設為啟動頁面。

**本機執行**：

```bash
git clone https://github.com/kaininx/PlainTab.git
```

在 `chrome://extensions` 中以「載入未封裝項目」載入該目錄。無需建置步驟，無需 `npm install`。

<details>
<summary><b>🔧 新分頁底部灰條怎麼去掉？</b></summary>

安裝擴充功能後，Chrome / Edge 新分頁右下角會顯示頁尾（標註目前擴充功能名稱）。這是瀏覽器行為，PlainTab 無法在程式碼中控制。

關閉方法：新分頁 → 右下角「自訂 Chrome」✏️ → 頁尾 → 關閉「在「新分頁」頁面上顯示頁尾」。詳見 [Chrome 官方說明](https://support.google.com/chrome/answer/11032183?hl=zh-TW)。

</details>

---

## 桌布有多快？

PlainTab 的桌布展示不是「載入一張圖」，而是**分三個時間刻度遞進**，每一級都在上一級的基礎上讓體驗更完整：

| 時間點 | 發生了什麼 | 使用者看到什麼 |
|--------|-----------|-------------|
| **0ms（首個影格之前）** | `preload.js` 同步讀取 localStorage 中的 base64 縮圖，直接寫入 `#wallpaperBack.style.backgroundImage` | 一張已經在那裡的桌布——雖然不是高畫質，但**絕無白屏或灰底** |
| **~300ms** | `loadWallpaper()` 從 IndexedDB 讀取快取的 Blob，透過 Blob URL 展示 | 高畫質桌布出現，透過 CSS opacity 過渡平滑取代縮圖 |
| **僅在快取失效時** | 網路請求 Bing API → 下載 Blob → 展示 → 非同步快取到 IDB | 使用者感受不到——上一張桌布一直在 back 層兜底 |

下面每一項技術都在為這三個時刻服務——要嘛縮短時間，要嘛消除可見的過渡痕跡。

---

## 技術亮點

### 首個影格零白屏：雙層桌布 + 同步預載入

這是 PlainTab 最核心的設計。新分頁在圖片載入完成前會暴露瀏覽器的預設背景色——通常是白屏或灰底。兩層 `<div>` 徹底解決這個問題：

- **[`#wallpaperBack`](../index.html#L14)**（z-index: 0）——始終持有一張可見影像。[`preload.js`](../js/preload.js) 放在 `<head>` 中同步執行，在瀏覽器首個影格繪製之前就把縮圖 `data: URL` 寫進去。這一步是同步的——不經過任何非同步 API、不等待任何網路。對於多圖輪播模式，它甚至知道目前該用哪張縮圖的索引。
- **[`#wallpaperFront`](../index.html#L16)**（z-index: 1, `opacity: 0`）——用於淡入過渡。新圖透過 [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) 在記憶體中預先解碼 → 設為前層背景 → CSS [`opacity` transition](https://developer.mozilla.org/docs/Web/CSS/transition) 淡入 → 過渡完成後穩定到 back 層 → front 復位透明。

核心原則：**任何時刻至少有一層持有已渲染影像**。back 層永遠有東西可顯示，front 層只在過渡期間短暫上場。使用者即使盯著螢幕逐幀觀看，也看不到一個空白的瞬間。

### 從輸入到像素：為什麼是縮圖而不是原圖？

`preload.js` 不能等非同步載入——那會錯過首個影格。但原圖存 IndexedDB 是非同步的，高達數 MB 的 base64 字串塞不進 localStorage（quota 有限）。所以 PlainTab 在上一張桌布展示完畢後，**多走一步**：用 Canvas 把圖片縮成 640px 寬的 JPEG，0.55 品質，壓縮率通常在 30KB–60KB，安全存入 localStorage。下一輪新分頁開啟時，`preload.js` 拿出來直接用。

640px 在 2K 螢幕上足夠銳利到看不出是縮圖——而為了控制這十幾 KB 的體積，背後是 [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) 的精確縮放 + [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL) 的品質調參。這個縮圖也是畫廊 3×4 網格的渲染資料來源——一次產生，兩處複用。

### 雙層 `requestAnimationFrame` 驅動 CSS 過渡

從縮圖切換到高畫質圖的那一步，必須觸發 CSS transition。但瀏覽器的樣式計算和渲染是非同步的——如果在設定 `backgroundImage` 之後立即添加 class，瀏覽器可能在同一幀渲染中同時處理兩個狀態，過渡動畫不會觸發。

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

第一個 [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) 確保 `backgroundImage` 已被計算；第二個確保樣式已提交到渲染管線。此時再添加 class，瀏覽器看到的才是「舊樣式 → 新樣式」的變化，才能觸發正確的過渡。少一步，過渡直接跳過——使用者看到的是硬切換而非淡入。

### IndexedDB + localStorage 為什麼並存？

兩種儲存不是二選一，而是分工：

| 儲存 | 放什麼 | 為什麼放在這裡 |
|------|--------|---------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | 原始 Blob（Bing 每日桌布、使用者上傳的本機圖片） | 大檔案需要大配額，非同步讀寫在非首個影格路徑上完全可以接受 |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | 縮圖 `data: URL`、UI 偏好、中繼資料、輪播索引 | **同步讀取**——這是關鍵。`preload.js` 在首個影格前執行，不能等任何非同步回呼 |

IDB 連線被快取為單例，`onclose` 時自動重建。IDB 取出的 Blob 可能遺失 MIME type——儲存時始終記錄 `mime` 欄位，取出時用 `new Blob([blob], {type: img.mime})` 重建，確保 Blob URL 能正確渲染。

### 縮圖自癒

`saveLocalImage()` 先寫 IDB（blob），再寫 localStorage（縮圖）。兩步不是原子交易——如果恰好在這之間頁面崩潰，縮圖陣列會比圖片陣列少一項。PlainTab 不在啟動時做全域自檢（那會掩蓋更嚴重的資料不一致），而是在**輪播到缺少縮圖的圖片時**即場重新產生。只在兩個陣列長度一致時修復——長度不一致表示出現了未知的寫入異常，跳過是更安全的選擇。

### Blob URL 生命週期

畫廊中所有透過 [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) 建立的 Blob URL 被跟蹤在陣列中，畫廊關閉時透過 [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) 批次清理。但這條路徑是 fallback——**優先使用預先產生的 base64 縮圖**，因為 base64 不需要建立/撤銷 Blob URL，渲染也更快。

### CSS 自訂屬性做執行時期主題

圖示透明度（`--icon-opacity`）透過 JS 修改一個 [CSS 自訂屬性](https://developer.mozilla.org/docs/Web/CSS/--*) 統一控制所有角落按鈕和面板——一次 setProperty，瀏覽器自動重繪所有參考該變數的元素。設計 token（`--glass-bg`、`--glass-border`、`--text-primary` 等）全部定義在 [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root) 上，深色/亮色主題透過 [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme) 媒體查詢切換。

### 毛玻璃面板

設定與語言面板使用 [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) 模糊面板**後方**的桌布內容——不是半透明遮罩的廉價方案。搭配 `--glass-bg: rgba(18, 18, 22, 0.82)` 產生真正的景深感。

### 滑鼠位置感知 UI

角落按鈕和搜尋欄只在需要時出現——`isNearTopRight()` 和 `isInCenter()` 兩個數學函式判斷滑鼠位置，無需給全螢幕背景層繫結 `mouseenter`/`mouseleave`。隱藏帶延遲（按鈕 400ms，搜尋欄 150ms），面板開啟或輸入框聚焦時跳過隱藏。每次互動路徑都是最短的：**出現要快，消失要穩**，不能因為誤觸發而打斷使用者。

### 串行 Promise 鏈處理批次上傳

使用者可以一次選取多張本機桌布。每個 `saveLocalImage()` 都會讀寫 IDB——並行執行會導致資料競爭。批次上傳用 Promise 鏈串行化所有儲存操作，每次只寫一張，第一張成功儲存的圖展示為桌布，其餘僅入庫。這樣使用者不會看到圖片反覆切換造成的閃爍。

### `chrome.search.query()` 實現 CWS 合規

擴充模式下使用 [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) 將搜尋委託給瀏覽器預設搜尋引擎——Chrome Web Store 單一用途政策的合規要求。引擎選擇器從 DOM 中隱藏，圖示變為靜態放大鏡。

---

## 為消除延遲使用的技術

PlainTab 沒有使用任何框架和函式庫。以下每個 API 都是為了**省下一步非同步等待、消除一次可見閃爍、縮減一幀延遲**而被選用的：

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — 在設定 `backgroundImage` 之前非同步解碼，省掉首幀繪製時的解碼暫停。`<img>` 載入完成不代表解碼完成，不呼叫 `decode()` 可能在第一次繪製時看到短暫的空白影格
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — 用 GPU 合成的模糊取代多餘的 DOM 層和遮罩圖片，零額外佈局開銷
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — 鎖定 Dark Reader，防止它用濾鏡反轉桌布色彩——桌布本身就是視覺內容，被濾鏡處理會白費 Canvas 縮圖管線的保真努力
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — 一次宣告讓瀏覽器自動適配表單、捲軸、系統控制項的顏色，無需手寫兩套樣式覆蓋
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — 統一的緩動曲線，所有淡入和彈出動畫共用。不是 `ease` 或 `ease-in-out`——這條曲線在起始段更快到達目標，在末尾段有更柔和的衰減，對於毫秒級的 UI 響應差異，體感區別明顯
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — 擴充模式下取得瀏覽器 UI 語言，比 `navigator.language` 更準確地反映使用者真實意圖
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — 不依賴 `setTimeout` 猜測渲染時機，而是精確對齊瀏覽器的幀節奏。兩次連續使用確保樣式計算與提交之間有明確的幀邊界
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — 同時發出兩個 Bing API 請求，採用最先回應的結果，消除不必要的等待
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — 為每個 Bing API 請求設定 8 秒超時，乾淨地中止落後的連線，不讓它掛在 OS 層級的 TCP 超時上

**不使用的技術同樣重要**：零外部依賴。沒有 React、Tailwind 或建置工具。`manifest.json` 中 CSP 限制 `script-src 'self'`——瀏覽器強制執行了純 vanilla JS。每一個沒引入的函式庫都意味著更少的解析時間、更小的網路開銷、更早的首幀。

**字型堆疊**：`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`——作業系統原生字型，零網路請求，零佈局偏移。字型檔案通常是頁面最大的阻塞資源之一，PlainTab 繞過了整個問題。

---

## 兩種執行模式

同一套程式碼，執行時自動偵測環境：

| 特性 | 擴充模式 | Web 模式 |
|------|----------|----------|
| 環境偵測 | `chrome.runtime.id` 存在 | 其他所有情況 |
| 搜尋引擎 | 瀏覽器預設（`chrome.search.query`） | Google / Bing / Baidu / DuckDuckGo 可選 |
| 引擎切換 | 不可切換（靜態放大鏡） | 點擊圖示輪換 |
| 部署方式 | Chrome Web Store / 開發者載入 | Netlify / GitHub Pages 直接託管 |
| CSP | `manifest.json` 宣告 | 無需 CSP |

---

## 桌布載入優先級

每次新分頁開啟時，按以下順序尋找可用的最快桌布來源：

1. **本機桌布輪播**——使用者自己的圖片（最多 12 張），IDB 內已有 Blob，直接取用。縮圖已預先產生。零網路開銷。
2. **今日 Bing 快取**——當天已經取得的那張 Bing 桌布，Blob 在 IDB 裡，直接轉 Blob URL 展示。零網路開銷。
3. **Bing 網路取得**——只有前兩級都不可用時才走網路。取得 URL 後立即展示，同時非同步下載 Blob 存 IDB，為下一次省去網路等待。

在本機桌布模式下，Bing 桌布也會在背景靜默更新——使用者隨時切回 Bing 模式，不用等網路。

Bing API 通過 `Promise.any` 同時請求兩個端點，以 8 秒 `AbortController` 超時控制——競賽，誰快用誰。JSON 響應體量極小，多發一個請求幾乎零代價，換來的卻是全球任意位置的最優延遲體驗。語言代碼（如 `zh-CN`）映射到 Bing 市場代碼，部分語言回退到 `en-US`。

---

## 國際化

支援 16 種語言：简体中文、繁體中文、English、日本語、한국어、Español、Русский、Deutsch、Français、Italiano、Português、हिन्दी、العربية、Türkçe、Polski、Tiếng Việt。

兩套 i18n 系統並行：Chrome `_locales/` 負責擴充清單後設資料（僅 `extName`、`extDesc` 兩個 key），[`languages.js`](../js/languages.js) 負責所有 UI 字串。語言偵測優先級：Chrome UI 語言（擴充模式）→ `navigator.language`（Web 模式）→ 主要語言匹配 → English 回退。

翻譯有瑕疵或想加新語言？語言檔案只有 [`js/languages.js`](../js/languages.js) 一個，純 key-value 對應。改完提 PR 即可。

---

## 專案結構

```
PlainTab/
├── manifest.json            # Chrome/Edge 擴充清單 (Manifest V3)
├── index.html               # 唯一 HTML 頁面（擴充的新分頁 / Web 首頁）
├── 404.html                 # Netlify SPA 回退頁面
├── LICENSE                  # MIT 授權條款
│
├── css/
│   └── newtab.css           # 所有樣式：雙層桌布、毛玻璃面板、搜尋欄、響應式
│
├── js/
│   ├── preload.js           # 同步 IIFE：首個影格前注入縮圖到 back 層
│   ├── languages.js         # 16 種語言的 UI 字串表 + 語言列表
│   └── newtab.js            # 主程式：桌布管理、i18n、儲存、UI、搜尋引擎
│
├── _locales/                # Chrome i18n（16 個語言目錄，僅擴充清單用）
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # 擴充圖示（16/48/128/2048 px）
│
├── imgs/                    # 截圖與宣傳圖
│   ├── chrome_01.jpg ~ chrome_08.jpg  # 功能截圖
│   └── small_promo.png      # Chrome Web Store 宣傳小圖
│
├── docs/                    # 多語言 README（16 種語言）+ CHANGELOG
│
└── changelog/               # 各語言版本更新日誌
```

- **[`css/`](../css/)** — 單檔案 ~617 行，深色/亮色主題、玻璃擬態設計 token、480px 響應式斷點
- **[`js/`](../js/)** — 三個檔案依序載入：`preload.js` → `languages.js` → `newtab.js`（順序不可顛倒）
- **[`_locales/`](../_locales/)** — 僅含擴充清單用 `extName` 和 `extDesc`；所有 UI 字串由 [`languages.js`](../js/languages.js) 管理
- **[`imgs/`](../imgs/)** — Chrome Web Store 所需截圖和宣傳圖
- **[`docs/`](../docs/)** 與 **[`changelog/`](../changelog/)** — 多語言文件，16 種語言各自獨立檔案

---

## 貢獻 & 授權

MIT 協議開源。遇到 bug 或想法 → [提交 Issue](https://github.com/kaininx/PlainTab/issues)；改程式碼 → Fork + PR。

幾點約定：
- **保持零依賴**——不引入 npm 套件、CDN 腳本或框架
- **不要加建置步驟**——`index.html` 直接在瀏覽器裡執行
- **不要擴充權限**——`manifest.json` 只保留 `search` 這一個權限

📋 [更新日誌](CHANGELOG.md)

---

## 致謝

- Bing 每日桌布圖片來自 [Bing](https://www.bing.com)，感謝微軟 Bing 團隊常年提供高品質的每日一圖
- API 代理：[bing.biturl.top](https://bing.biturl.top)（公用代理）和 [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev)（Cloudflare Worker 備用）
- 截圖中出現的桌布來自網路上各位創作者

MIT · [Kaelri](https://github.com/kaininx)
