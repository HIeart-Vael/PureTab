<p align="center">
  <img src="icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab V3 · 极简起始页</h1>

> **新标签页只该做好一件事：**
> 被打开 → 展示一张令你赏心悦目的壁纸 → 送你前往它该去的网页。
> 你真的需要看时间、问候语，或是满屏的快捷链接吗？
> **PlainTab 的答案：极致的减法，从零重写的双层壁纸架构，零闪烁——让你的新标签页回归「PLAIN」。**

<p align="center">
  <a href="docs/README_en.md">English</a> · <a href="docs/README_ja.md">日本語</a> · <a href="docs/README_ru.md">Русский</a> · <a href="docs/README_ko.md">한국어</a> · <a href="docs/README_es.md">Español</a> · <a href="docs/README_hi.md">हिन्दी</a> · <a href="docs/README_ar.md">العربية</a> · <a href="docs/README_pt.md">Português</a> · <a href="docs/README_de.md">Deutsch</a> · <a href="docs/README_fr.md">Français</a> · <a href="docs/README_it.md">Italiano</a> · <a href="docs/README_tr.md">Türkçe</a> · <a href="docs/README_pl.md">Polski</a> · <a href="docs/README_vi.md">Tiếng Việt</a> · <a href="docs/README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.4-blue?style=flat-square" alt="版本">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="许可证">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/在线体验-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<p align="center">
  <strong>纯净、极速、无侵入的起始页与新标签页方案。</strong><br>
  在线即用 <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · 零闪烁 · 无文件大小限制<br>
  Bing 每日壁纸 · 本地图片 · 16 种语言 · 灵活搜索栏 · <strong>不涉及隐私</strong>
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

## 🆕 v3 全新特性

v3 是一次**从零开始的架构重写**，核心突破：**零闪烁双层壁纸系统**。

<details>
<summary><b>💡 为什么 v2 会闪烁？</b></summary>

旧版使用单层 `<div>` 切换 CSS `background-image`。从缩略图（stylesheet 规则）切换到高清图（inline style）时，浏览器需要做级联源切换——过程中至少有一帧没有任何背景渲染，露出灰底。

</details>

**v3 的解决方案 — 双层合成：**
1. `#wallpaperBack` — 始终持有可见图片，`preload.js` 在浏览器首帧绘制前同步写入缩略图
2. `#wallpaperFront` — 初始透明，新图解码完成后淡入覆盖背层
3. 任何时刻至少有一层持有可见图片 → **绝无灰色闪烁**

详见 [V3_NOTE.md](./docs/V3_NOTE.md)

---

## ✨ 为什么选择 PlainTab？

- 🔒 **绝对干净的隐私**
  不收集任何个人信息，不申请任何敏感权限。所有壁纸只保存在您的本地，浏览习惯完全属于您自己。

- 🚀 **一分钟拥有统一的浏览起点**
  将 `plaintab.netlify.app` 设为浏览器起始页，再安装扩展接管新标签页。扩展**不会强制修改您的主页设置**。

- 🧩 **轻得几乎感觉不到**
  零外部依赖，纯原生 JavaScript，启动瞬间完成。

- 🌍 **开箱即用，足够懂你**
  自动检测浏览器语言（16 种），支持 Google / Bing / 百度 / DuckDuckGo 四种搜索引擎。

---

## 🚀 两种方式，即刻体验

| 方式 | 说明 | 适合场景 |
|------|------|----------|
| 🌐 **在线起始页** | 访问 [plaintab.netlify.app](https://plaintab.netlify.app)，在浏览器设置中设为主页 | 只想换一个清爽的主页 |
| 🧩 **浏览器扩展** | 从 Chrome 或 Edge 商店安装扩展，新标签页自动变为 PlainTab | 希望每次打开新标签页都有极简体验 |

### 浏览器扩展 · 商店安装
- **Chrome Web Store**: [即将上架]()
- **Edge Add-ons**: [即将上架]()

> 💡 暂未上架？可通过开发者模式手动加载：进入 `chrome://extensions` → 开启**开发者模式** → **加载已解压的扩展程序** → 选择本项目文件夹

---

## 💡 开发者推荐：三张壁纸，三重入口

装了扩展，你的新标签页已经很好看了。但你可能不知道——PlainTab 还部署在两个地方：

| 入口 | 设置项 | 推荐地址 |
|------|--------|----------|
| 🧩 **新标签页** | 浏览器扩展 | 加载本扩展 |
| 🌐 **起始页** | 浏览器启动时打开 | `plaintab.netlify.app` |
| 🏠 **主页** | 点击主页按钮时打开 | `kaininx.github.io/PlainTab` |

把 `plaintab.netlify.app` 设为浏览器的起始页，让它跟着 Bing 每日更新——每次打开浏览器，这就是你的**第二张壁纸**。

没错，还没完。再找到浏览器外观设置里的"主页按钮"，填入 `kaininx.github.io/PlainTab`，换上你喜欢的另一张壁纸——现在你有了**第三张壁纸**。

三个入口彼此隔离，互不干扰。给它们分别塞一张不同的本地壁纸，或者让它们各自跟着 Bing 每日刷新。打开浏览器是一张，点主页按钮是一张，开新标签页又是一张——换着看，不重样。

**Setup：**
1. 装好扩展 → 新标签页 ✓
2. 浏览器设置 → 启动时 → 打开特定网页 → 填入 `https://plaintab.netlify.app`
3. 浏览器设置 → 外观 → 显示主页按钮 → 填入 `https://kaininx.github.io/PlainTab`

---

## 🛠️ 使用方式

| 操作 | 效果 |
|------|------|
| 鼠标移入右上角 | 显示语言 / 设置图标 |
| 鼠标移近页面中心 | 搜索栏渐现（"鼠标触发"模式时） |
| 点击齿轮图标 | 打开壁纸与高级选项面板 |
| 点击地球图标 | 切换界面语言 |
| 点击搜索引擎图标 | 循环切换 Google → Bing → 百度 → DuckDuckGo |
| 在搜索栏按 `Enter` | 使用当前搜索引擎搜索 |
| 按 `Esc` | 关闭所有面板 |

### 壁纸
- **Bing 每日壁纸**：每天自动拉取一次，仅缓存当天一张壁纸。旧缓存自动替换。
- **本地壁纸**：上传任意大小的图片（IndexedDB 存储，**无文件大小限制**）。始终只保留最后一张上传的壁纸。一键恢复 Bing 每日壁纸。

### 高级选项
| 选项 | 说明 |
|------|------|
| 搜索栏模式 | 鼠标触发 / 常驻 / 始终隐藏 |
| 图标不透明度 | 0 – 1（默认 0.45） |
| 默认搜索引擎 | Google / Bing / Baidu / DuckDuckGo |

> **Chrome 扩展 vs Web 版的搜索差异：** 为遵循 Chrome Web Store 的「单一用途」政策，扩展版使用 Chrome Search API 进行搜索，直接调用用户在浏览器设置中选定的默认搜索引擎，不再提供引擎切换功能。Web 版（Netlify / GitHub Pages）不受此限制，保留完整的搜索引擎选择器。除搜索实现外，两个版本功能完全一致。
>
> 所有设置自动保存在 `localStorage`，无需登录，无云端同步。

---

## 🔧 新标签页底部灰条

安装扩展后，Chrome / Edge 新标签页右下角会显示页脚（标明当前扩展名称）。这是浏览器行为，并非 PlainTab 添加。

**关闭方法（来自 [Chrome 官方帮助](https://support.google.com/chrome/answer/11032183?hl=zh-Hans)）：**

打开新标签页 → 点击右下角「自定义 Chrome」✏️ 图标 → 页脚 → 关闭「在"新标签页"页面上显示页脚」。

---

## 🌐 多语言支持

内置 16 种语言，随浏览器语言自动切换，也可随时手动选择：
`简体中文` `繁體中文` `English` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

想贡献新语言？编辑 `languages.js` 并提交 Pull Request 即可。

---

## 🤝 参与贡献

欢迎任何 Issue 和 Pull Request。请保持 PlainTab 的极简风格——原生 JS，无构建步骤，无三方依赖。

---

## 📄 许可证

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 致谢

- Bing 壁纸接口来自 [bing.img.run](https://bing.img.run) 和 [bing.biturl.top](https://bing.biturl.top)
- 展示截图中使用的部分壁纸来自网络，谢谢每一位才华横溢的创作者。

---

<p align="center">
  <sub>干净 · 快速 · 无页面广告 · 只属于你</sub>
</p>
