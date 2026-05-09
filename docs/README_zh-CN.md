<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · 极简起始页</h1>


 > 新标签页只该做好一件事——被打开，展示一张好看的壁纸，送你前往下一个网页。你真的需要时钟、问候语，或是满屏的快捷链接吗？PlainTab 的答案：极致的减法，极快的速度——让你的新标签页回归她原本的样子，美丽而干净。

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt_BR.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.2-blue?style=flat-square" alt="版本">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="许可证">
  </a>
  <a href="https://plaintab.kaininx.workers.dev">
    <img src="https://img.shields.io/badge/在线体验-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 查看更多截图</b></summary>
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
打开新标签页是一个瞬间动作——`Ctrl+T` 按下去，你期望你的壁纸已经在那里了。为了做好这件事，PlainTab 的全部设计都围绕一个目标：**让壁纸尽可能快地出现在屏幕上**，没有任何可见的加载过程。双层壁纸架构、同步预加载、Canvas 缩略图管线、混合存储策略——所有技术决策的终点都是同一件事：更快、更丝滑、更无感。


PlainTab 项目同时是一个 Manifest V3 浏览器扩展和一个独立的 Web 页面。零外部依赖，无构建步骤，纯 vanilla JS + CSS。扩展模式与 Web 模式共用同一套代码，运行时自动检测环境切换行为。 [在线即用](https://plaintab.kaininx.workers.dev)。

---

## 快速上手

**浏览器扩展**：[Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) 安装。

**在线起始页**：访问 [plaintab.kaininx.workers.dev](https://plaintab.kaininx.workers.dev)，浏览器设置中将其设为启动页面。

**本地运行**：

```bash
git clone https://github.com/kaininx/PlainTab.git
```

在 `chrome://extensions` 中以「加载已解压的扩展程序」加载该目录。无构建步骤，无需 `npm install`。

<details>
<summary><b>🔧 新标签页底部灰条怎么去掉？</b></summary>

安装扩展后，Chrome / Edge 新标签页右下角会显示页脚（标注当前扩展名称）。这是浏览器行为，PlainTab 无法在代码中控制。

关闭方法：新标签页 → 右下角「自定义 Chrome」✏️ → 页脚 → 关闭「在"新标签页"页面上显示页脚」。详见 [Chrome 官方帮助](https://support.google.com/chrome/answer/11032183?hl=zh-Hans)。

</details>

---

## 壁纸有多快？

PlainTab 的壁纸展示不是「加载一张图」，而是**分三个时间刻度递进**，每一级都在上一级的基础上让体验更完整：

| 时刻 | 发生了什么 | 用户看到什么 |
|------|-----------|-------------|
| **0ms**（首帧之前） | `preload.js` 同步读取 localStorage 中的 base64 缩略图，直接写入 `#wallpaperBack.style.backgroundImage` | 一张已经在那里的壁纸——虽然不是高清，但**绝无白屏或灰底** |
| **~300ms** | `loadWallpaper()` 从 IndexedDB 读取缓存的 Blob，通过 Blob URL 展示 | 高清壁纸出现，通过 CSS opacity 过渡平滑替换掉缩略图 |
| **仅在缓存失效时** | 网络请求 Bing API → 下载 Blob → 展示 → 异步缓存到 IDB | 用户感知不到——上一张壁纸一直在 back 层兜底 |

下面每一项技术都在为这三个时刻服务——要么缩短时间，要么消除可见的过渡痕迹。

---

## 技术亮点

### 首帧零白屏：双层壁纸 + 同步预加载

这是 PlainTab 最核心的设计。新标签页在图片加载完成前会暴露浏览器的默认背景色——通常是白屏或灰底。两层 `<div>` 彻底解决这个问题：

- **[`#wallpaperBack`](../index.html#L14)**（z-index: 0）——始终持有一张可见图像。[`preload.js`](../js/preload.js) 放在 `<head>` 中同步执行，在浏览器首帧绘制之前就把缩略图 `data: URL` 写进去。这一步是同步的——不经过任何异步 API、不等待任何网络。对于多图轮播模式，它甚至知道当前该用哪张缩略图的索引。
- **[`#wallpaperFront`](../index.html#L16)**（z-index: 1, `opacity: 0`）——用于淡入过渡。新图通过 [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) 在内存中预解码 → 设为前层背景 → CSS [`opacity` transition](https://developer.mozilla.org/docs/Web/CSS/transition) 淡入 → 过渡完成后稳定到 back 层 → front 复位透明。

核心原则：**任何时刻至少有一层持有已渲染图像**。back 层永远有东西可显示，front 层只在过渡期间短暂上场。用户即使盯着屏幕逐帧看，也看不到一个空白的瞬间。

### 从输入到像素：为什么是缩略图而不是原图？

`preload.js` 不能等异步加载——那会错过首帧。但原图存 IndexedDB 是异步的，高达数 MB 的 base64 字符串塞不进 localStorage（quota 有限）。所以 PlainTab 在上一张壁纸展示完毕后，**多走一步**：用 Canvas 把图片缩成 640px 宽的 JPEG，0.55 质量，压缩率通常在 30KB–60KB，安全存入 localStorage。下一轮新标签页打开时，`preload.js` 拿出来直接用。

640px 在 2K 屏幕上足够锐利到看不出是缩略图——而为了控制这十几 KB 的体积，背后是 [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) 的精确缩放 + [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL) 的质量调参。这个缩略图也是画廊 3×4 网格的渲染数据源——一次生成，两处复用。

### 双 `requestAnimationFrame` 驱动 CSS 过渡

从缩略图切换到高清图的那一步，必须触发 CSS transition。但浏览器的样式计算和渲染是异步的——如果在设置 `backgroundImage` 之后立即添加 class，浏览器可能在同一次帧渲染中同时处理两个状态，过渡动画不会触发。

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

第一个 [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) 确保 `backgroundImage` 已被计算；第二个确保样式已提交到渲染管线。此时再添加 class，浏览器看到的才是「旧样式 → 新样式」的变化，才能触发正确的过渡。少一步，过渡直接跳过——用户看到的是硬切换而非淡入。

### IndexedDB + localStorage 为什么并存？

两种存储不是二选一，而是分工：

| 存储 | 放什么 | 为什么放在这里 |
|------|--------|---------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | 原始 Blob（Bing 每日壁纸、用户上传的本地图片） | 大文件需要大配额，异步读写在非首帧路径上完全可接受 |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | 缩略图 `data: URL`、UI 偏好、元数据、轮播索引 | **同步读取**——这是关键。`preload.js` 在首帧前运行，不能等任何异步回调 |

IDB 连接被缓存为单例，`onclose` 时自动重建。IDB 取出的 Blob 可能丢失 MIME type——存储时始终记录 `mime` 字段，取出时用 `new Blob([blob], {type: img.mime})` 重建，确保 Blob URL 能正确渲染。

### 缩略图自愈

`saveLocalImage()` 先写 IDB（blob），再写 localStorage（缩略图）。两步不是原子事务——如果恰好在这之间页面崩溃，缩略图数组会比图片数组少一项。PlainTab 不在启动时做全局自检（那会掩盖更严重的数据不一致），而是在**轮播到缺失缩略图的图片时**即场重新生成。只在两个数组长度一致时修复——长度不一致说明出现了未知的写入异常，跳过是更安全的选择。

### Blob URL 生命周期

画廊中所有通过 [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) 创建的 Blob URL 被跟踪在数组中，画廊关闭时通过 [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) 批量清理。但这条路径是 fallback——**优先使用预生成的 base64 缩略图**，因为 base64 不需要创建/撤销 Blob URL，渲染也更快。

### CSS 自定义属性做运行时主题

图标透明度（`--icon-opacity`）通过 JS 修改一个 [CSS 自定义属性](https://developer.mozilla.org/docs/Web/CSS/--*) 统一控制所有角落按钮和面板——一次 setProperty，浏览器自动重绘所有引用该变量的元素。设计 token（`--glass-bg`、`--glass-border`、`--text-primary` 等）全部定义在 [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root) 上，暗色/亮色主题通过 [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme) 媒体查询切换。

### 毛玻璃面板

设置与语言面板使用 [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) 模糊面板**后方**的壁纸内容——不是半透明遮罩的廉价方案。配合 `--glass-bg: rgba(18, 18, 22, 0.82)` 产生真正的景深感。

### 鼠标位置感知 UI

角落按钮和搜索栏只在需要时出现——`isNearTopRight()` 和 `isInCenter()` 两个数学函数判断鼠标位置，无需给全屏背景层绑定 `mouseenter`/`mouseleave`。隐藏带延迟（按钮 400ms，搜索栏 150ms），面板打开或输入框聚焦时跳过隐藏。每次交互路径都是最短的：**出现要快，消失要稳**，不能因为误触发而打断用户。

### 串行 Promise 链处理批量上传

用户可一次选择多张本地壁纸。每个 `saveLocalImage()` 都会读写 IDB——并行执行会导致数据竞争。批量上传用 Promise 链串行化所有保存操作，每次只写一张，第一张成功保存的图展示为壁纸，其余仅入库。这样用户不会看到图片反复切换造成的闪烁。

### `chrome.search.query()` 实现 CWS 合规

扩展模式下使用 [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) 将搜索委托给浏览器默认搜索引擎——Chrome Web Store 单一用途政策的合规要求。引擎选择器从 DOM 中隐藏，图标变为静态放大镜。

---

## 为消除延迟用到的技术

PlainTab 没有用任何框架和库。以下每个 API 都是为了**省下一步异步等待、消除一次可见闪烁、缩减一帧延迟**而被选用的：

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — 在设置 `backgroundImage` 之前异步解码，省掉首帧绘制时的解码暂停。`<img>` 加载完成不代表解码完成，不调 `decode()` 可能在第一次绘制时看到短暂的空白帧
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — 用 GPU 合成的模糊取代额外的 DOM 层和遮罩图片，零额外布局开销
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — 锁定 Dark Reader，防止它用滤镜反转壁纸色彩——壁纸本身就是视觉内容，被滤镜处理会白费 Canvas 缩略图管线的保真努力
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — 一次声明让浏览器自动适配表单、滚动条、系统控件的颜色，无需手写两套样式覆盖
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — 统一的缓动曲线，所有淡入和弹出动画共用。不是 `ease` 或 `ease-in-out`——这条曲线在起始段更快到达目标，在末尾段有更柔和的衰减，对于毫秒级的 UI 响应差，体感区别明显
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — 扩展模式下获取浏览器 UI 语言，比 `navigator.language` 更准确地反映用户真实意图
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — 不依赖 `setTimeout` 猜测渲染时机，而是精确对齐浏览器的帧节奏。两次连用确保样式计算与提交之间有明确的帧边界
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — 同时发射两个 Bing API 请求，采用最先响应的结果，消除不必要的等待
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — 为每个 Bing API 请求设定 8 秒超时，干净地中止落后连接，避免依赖 OS 层 TCP 超时

**不使用的技术同样重要**：零外部依赖。没有 React、Tailwind 或构建工具。`manifest.json` 中 CSP 限制 `script-src 'self'`——浏览器强制执行了纯 vanilla JS。每一个没引入的库都意味着更少的解析时间、更小的网络开销、更早的首帧。

**字体栈**：`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`——操作系统原生字体，零网络请求，零布局偏移。字体文件通常是页面最大的阻塞资源之一，PlainTab 绕过了整个问题。

---

## 两种运行模式

同一套代码，运行时自动检测环境：

| 特性 | 扩展模式 | Web 模式 |
|------|----------|----------|
| 环境检测 | `chrome.runtime.id` 存在 | 其他所有情况 |
| 搜索引擎 | 浏览器默认（`chrome.search.query`） | Google / Bing / Baidu / DuckDuckGo 可选 |
| 引擎切换 | 不可切换（静态放大镜） | 点击图标轮换 |
| 部署方式 | Chrome Web Store / 开发者加载 | Netlify / GitHub Pages 直接托管 |
| CSP | `manifest.json` 声明 | 无需 CSP |

---

## 壁纸加载优先级

每次新标签页打开时，按以下顺序寻找可用的最快壁纸来源：

1. **本地壁纸轮播**——用户自己的图片（最多 12 张），IDB 内已有 Blob，直接取。缩略图已预生成。零网络开销。
2. **今日 Bing 缓存**——当天已经获取过的那张 Bing 壁纸，Blob 在 IDB 里，直接转 Blob URL 展示。零网络开销。
3. **Bing 网络获取**——只有前两级都不可用时才走网络。获取到 URL 后立即展示，同时异步下载 Blob 存 IDB，为下一次省去网络等待。

在本地壁纸模式下，Bing 壁纸也会在后台静默更新——用户随时切回 Bing 模式，不用等网络。

Bing API 通过 `Promise.any` 同时请求两个端点，以 8 秒 `AbortController` 超时控制——竞赛，谁快用谁。JSON 响应体量极小，多发一个请求几乎零代价，换来的却是全球任意位置的最优延迟体验。语言代码（如 `zh-CN`）映射到 Bing 市场代码，部分语言回退到 `en-US`。

---

## 国际化

支持 16 种语言：简体中文、繁體中文、English、日本語、한국어、Español、Русский、Deutsch、Français、Italiano、Português、हिन्दी、العربية、Türkçe、Polski、Tiếng Việt。

两套 i18n 系统并行：Chrome `_locales/` 负责扩展清单元数据（仅 `extName`、`extDesc` 两个 key），[`languages.js`](../js/languages.js) 负责所有 UI 字符串。语言检测优先级：Chrome UI 语言（扩展模式）→ `navigator.language`（Web 模式）→ 主语言匹配 → English 回退。

翻译有瑕疵或想加新语言？语言文件只有 [`js/languages.js`](../js/languages.js) 一个，纯 key-value 映射。改完提 PR 即可。

---

## 项目结构

```
PlainTab/
├── manifest.json            # Chrome/Edge 扩展清单 (Manifest V3)
├── index.html               # 唯一 HTML 页面（扩展的新标签页 / Web 首页）
├── 404.html                 # Netlify SPA 回退页面
├── LICENSE                  # MIT 许可证
│
├── css/
│   └── newtab.css           # 所有样式：双层壁纸、毛玻璃面板、搜索栏、响应式
│
├── js/
│   ├── preload.js           # 同步 IIFE：首帧前注入缩略图到 back 层
│   ├── languages.js         # 16 种语言的 UI 字符串表 + 语言列表
│   └── newtab.js            # 主程序：壁纸管理、i18n、存储、UI、搜索引擎
│
├── _locales/                # Chrome i18n（16 个语言目录，仅扩展清单用）
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # 扩展图标（16/48/128/2048 px）
│
├── imgs/                    # 截图与宣传图
│   ├── chrome_01.jpg ~ chrome_08.jpg  # 功能截图
│   └── small_promo.png      # Chrome Web Store 宣传小图
│
├── docs/                    # 多语言 README（16 种语言）+ CHANGELOG
│
└── changelog/               # 各语言版本更新日志
```

- **[`css/`](../css/)** — 单文件 ~617 行，暗色/亮色主题、玻璃拟态设计 token、480px 响应式断点
- **[`js/`](../js/)** — 三个文件按顺序加载：`preload.js` → `languages.js` → `newtab.js`（顺序不可颠倒）
- **[`_locales/`](../_locales/)** — 仅含扩展清单用 `extName` 和 `extDesc`；所有 UI 字符串由 [`languages.js`](../js/languages.js) 管理
- **[`imgs/`](../imgs/)** — Chrome Web Store 所需截图和宣传图
- **[`docs/`](../docs/)** — 多语言文档，16 种语言各自独立文件

---

## 贡献 & 许可

MIT 协议开源。遇到 bug 或想法 → [提交 Issue](https://github.com/kaininx/PlainTab/issues)；改代码 → Fork + PR。

几点约定：
- **保持零依赖**——不引入 npm 包、CDN 脚本或框架
- **不要加构建步骤**——`index.html` 直接在浏览器里跑
- **不要扩权限**——`manifest.json` 只保留 `search` 这一个权限

📋 [更新日志](changelog.md)

---

## 致谢

- Bing 每日壁纸图片来自 [Bing](https://www.bing.com)，感谢微软 Bing 团队常年提供高质量的每日一图
- API 代理：[bing.biturl.top](https://bing.biturl.top)（公共代理）和 [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev)（Cloudflare Worker 备用）
- 截图中出镜的壁纸来自网络上各位创作者

MIT · [Kaelri](https://github.com/kaininx)
