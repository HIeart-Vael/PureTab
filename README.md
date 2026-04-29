<p align="center">
  <img src="icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · 极简起始页</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.2.0-blue?style=flat-square" alt="版本">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href = "LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square"
    alt="许可证">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/在线体验-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<p align="center">
  <strong>纯净、极速、无侵入的起始页与新标签页方案。</strong><br>
  在线即用 <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · 浏览器扩展即将上架 Edge / Chrome 商店<br>
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

## ✨ 为什么选择 PlainTab？

- 🔒 **绝对干净的隐私**  
  不收集任何个人信息，不申请任何敏感权限。所有壁纸只保存在您的本地，浏览习惯完全属于您自己。

- 🚀 **一分钟拥有统一的浏览起点**  
  将 `plaintab.netlify.app` 设为浏览器起始页，再安装扩展接管新标签页，主页、起始页、新标签页全部保持一致的极简风格——扩展 **不会强制修改您的主页设置**，您依然可以自由使用喜欢的任何起始页网址。

- 🧩 **轻得几乎感觉不到**  
  零外部依赖，纯原生 JavaScript，启动瞬间完成，不拖慢任何一次点击。

- 🌍 **开箱即用，但足够懂你**  
  自动检测浏览器语言（16 种），支持 Google / Bing / 百度 / DuckDuckGo 四种搜索引擎，搜索栏可按您的习惯设为“鼠标触发”、“常驻显示”或“始终隐藏”。

---

## 🚀 两种方式，即刻体验

| 方式 | 说明 | 适合场景 |
|------|------|----------|
| 🌐 **在线起始页** | 访问 [plaintab.netlify.app](https://plaintab.netlify.app)，然后在浏览器设置中将主页/起始页设为该网址 | 只想换一个清爽的主页，无需安装任何扩展 |
| 🧩 **浏览器扩展** | 手动加载扩展（计划上架 Edge / Chrome 商店），新标签页自动变为 PlainTab | 希望每次打开新标签页都拥有相同的极简体验，与起始页风格统一 |

> 💡 推荐两者搭配使用：主机用在线版，新标签用扩展，让每一次浏览都从一处干净的地方开始。

### 浏览器扩展 · 手动安装（开发者模式）
1. 克隆仓库  
   `git clone https://github.com/HIeart-Vael/PureTab.git`
2. 打开 Chrome 或 Edge，进入 `chrome://extensions`
3. 开启右上角的**开发者模式**
4. 点击**加载已解压的扩展程序**，选择本项目的文件夹
5. 完成，现在打开一个新标签页就能看到 PlainTab

---

## 🛠️ 使用方式

| 操作 | 效果 |
|------|------|
| 鼠标移入右上角 | 显示语言 / 设置图标 |
| 鼠标移近页面中心 | 搜索栏渐现（“鼠标触发”模式时） |
| 点击齿轮图标 | 打开壁纸与高级选项面板 |
| 点击地球图标 | 切换界面语言 |
| 点击搜索引擎图标 | 循环切换 Google → Bing → 百度 → DuckDuckGo |
| 在搜索栏按 `Enter` | 使用当前搜索引擎搜索 |
| 按 `Esc` | 关闭所有面板 |

### 壁纸
PlainTab 的壁纸存储非常克制，**不会无限制堆积缓存**：

- **Bing 每日壁纸**：每天自动拉取一次，仅缓存**当天的一张**壁纸到本地。旧缓存会自动被替换，既保证次日离线也能看到昨天缓存图，又杜绝缓存膨胀。
- **本地壁纸**：您可以上传自己的图片（通过 IndexedDB 存储）。系统始终只保留**最后一张**上传的壁纸，新上传会替代旧图。一键“恢复 Bing 每日壁纸”即可清除本地图片，回到每日自动更新。

### 高级选项
| 选项 | 说明 |
|------|------|
| 搜索栏模式 | 鼠标触发 / 常驻 / 始终隐藏 |
| 齿轮不透明度 | 0 – 1（默认 0.45），可根据需要自行设置
| 默认搜索引擎 | Google / Bing / Baidu / DuckDuckGo |

> 所有设置自动保存在 `localStorage`，无需登录，无云端同步。

---

## 🌐 多语言支持

内置 16 种语言，随浏览器语言自动切换，也可随时手动选择：  
`简体中文` `繁體中文` `English` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

想贡献新语言？编辑 `languages.js` 并提交 Pull Request 即可。

---

## 🤝 参与贡献

欢迎任何 Issue 和 Pull Request。  
但在开始之前，请保持我们的目的一致：

- **PlainTab 的风格是“极简”**。每一行代码、每一个功能都会经过慎重权衡，确保它不会变得臃肿。因此，如果某些看似很棒的提议最终没有被采纳，并非否定其价值，而是我想守护这份克制的初心。
- 请遵循现有代码风格——原生 JS，无构建步骤，无三方依赖。

基本流程：
1. Fork 本仓库  
2. 创建新分支 (`feat/你的功能`)  
3. 提交更改  
4. 推送到该分支  
5. 发起 Pull Request

---

## 📄 许可证

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 致谢

- Bing 壁纸接口来自 [bing.img.run](https://bing.img.run) 和 [bing.biturl.top](https://bing.biturl.top)，感谢他们提供的稳定服务。
- 展示截图中使用的部分壁纸来自网络，**谢谢每一位才华横溢的创作者**。由于本项目完全基于个人兴趣，不涉及任何商业收益，本人未能逐一追溯来源。如果您是相关作品的版权所有者，并且认为展示图片侵犯了您的权益，请务必联系我——我将第一时间与您协商获取授权，或立即替换相应的展示图。在这里诚挚的尊重每一位创作者的权利。

---

<p align="center">
  <sub>干净 · 快速 · 无页面广告 · 只属于你</sub>
</p>