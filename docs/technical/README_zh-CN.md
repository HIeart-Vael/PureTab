<p align="center">
  <img src="../../icon/icon2048.png" alt="PlainTab Logo" width="88">
</p>

<h1 align="center">PlainTab 技术说明</h1>

<p align="center">
  给想读代码、改功能、学习浏览器扩展和 AI 协作开发的人。
</p>

<p align="center">
  <a href="README_en.md">English</a>
  ·
  <a href="../README_zh-CN.md">中文介绍</a>
  ·
  <a href="../../README.md">Project README</a>
  ·
  <a href="../RELEASE_NOTES.md">详细更新说明</a>
  ·
  <a href="https://plaintab.kaininx.workers.dev">在线体验</a>
</p>

<div align="center">
  <img src="../../imgs/chrome_01.jpg" width="45%" alt="PlainTab screenshot 1" />
  <img src="../../imgs/chrome_02.jpg" width="45%" alt="PlainTab screenshot 2" />
</div>

## 读这份文档前

这份文档不是商店介绍，也不是完整 API 手册。它主要回答几个问题：

- PlainTab 的核心体验是怎么实现的。
- 代码从哪里开始读。
- 哪些模块负责哪些事情。
- 哪些地方改动时要格外小心。
- 为什么项目坚持静态、轻量、少依赖。

如果你只是想知道 PlainTab 好不好用，可以先看 [中文介绍](../README_zh-CN.md)。如果你想学习、二次开发或参与维护，这份文档更合适。

## 项目定位

PlainTab 是一个 Chrome / Edge Manifest V3 新标签页扩展，同时也能作为普通网页直接打开 `index.html` 运行。

项目的基本约束：

- 不依赖 npm。
- 不引入前端框架。
- 不需要打包构建。
- 主体代码使用原生 JavaScript、CSS 和浏览器 API。
- 扩展模式和网页模式共用同一套页面。
- 新标签页的打开体验优先于抽象和“架构洁癖”。

这意味着 PlainTab 的代码看起来会比现代框架项目更直接：HTML 里按顺序加载脚本，CSS 按功能拆文件，运行时模块挂在 `window` 上协作。它不追求形式上的优雅，优先保证页面打开快、行为稳定、容易定位问题。

## 启动链路

PlainTab 最重要的链路是页面刚打开时的壁纸显示。相关顺序在 [index.html](../../index.html) 里固定：

1. `#wallpaperBack` 先进入 DOM。
2. [js/preload.js](../../js/preload.js) 同步执行。
3. `#wallpaperFront` 再进入 DOM。
4. 语言、壁纸、设置和主运行时脚本依次加载。

[js/preload.js](../../js/preload.js) 只做一件事：读取 `localStorage` 里的 `ptab_wallpaper_preview`，如果存在且大小合理，就写入 `#wallpaperBack.style.backgroundImage`。

它不能做这些事：

- 不能访问 IndexedDB。
- 不能请求网络。
- 不能生成缩略图。
- 不能扫描文件夹。
- 不能等待异步回调。
- 不能依赖主运行时模块。

原因很简单：它在最早显示路径上。只要它变重，用户打开新标签页时就更容易看到空白等待。

## 壁纸渲染

壁纸渲染由 [js/wallpaper/show.js](../../js/wallpaper/show.js) 负责。页面里有两层壁纸：

| 层 | 作用 |
|----|------|
| `#wallpaperBack` | 稳定显示当前画面，启动时也由 `preload.js` 写入预览 |
| `#wallpaperFront` | 新图准备好后淡入，过渡完成后再把画面交回 back 层 |

这样做的目的不是追求复杂，而是避免切换壁纸时把背景清空。新图加载、解码和应用过程中，旧画面仍然留在 back 层。

相关能力集中在 `WallpaperShow`：

- `apply(url, transitionMs, sourceId)`：加载并淡入新图。
- `applyAndSavePreview(url, sourceId)`：应用新图并生成下次启动用的预览。
- `thumbnail(source)`：生成普通缩略图。
- `blurredThumbnail(source, blur)`：生成模糊缩略图。
- `showPreparedPreview(preview)`：直接显示已准备好的预览图。
- `showPreparedUrl(url, id)`：直接显示已准备好的图片 URL。

如果你要改壁纸切换动画，优先看 `show.js` 和 [css/wallpaper.css](../../css/wallpaper.css)。不要在其他 UI 模块里直接操作两层壁纸的生命周期。

## WASM 主题色引擎

壁纸主题色由 [js/wallpaper/theme.js](../../js/wallpaper/theme.js) 负责。它不在首屏路径上运行，而是在壁纸切换完成后，由 [js/wallpaper/show.js](../../js/wallpaper/show.js) 放到动画帧和空闲阶段再执行。

主题色提取现在有两条路径：

| 路径 | 文件 | 作用 |
|------|------|------|
| WASM | [js/wallpaper/theme_engine.wasm](../../js/wallpaper/theme_engine.wasm) | 默认优先使用，负责像素分析和调色板提取 |
| JS fallback | [js/wallpaper/theme.js](../../js/wallpaper/theme.js) | WASM 不可用时回退，保证网页模式和异常环境仍可用 |

C++ 源码在 [wasm/theme_engine.cpp](../../wasm/theme_engine.cpp)，构建脚本在 [wasm/build.bat](../../wasm/build.bat) 和 [wasm/build.sh](../../wasm/build.sh)。运行：

```powershell
.\wasm\build.bat
```

会生成 `js/wallpaper/theme_engine.wasm`。这个 wasm 文件是扩展运行时实际加载的产物，源码和构建脚本留在 `wasm/` 目录里。

运行链路：

1. `theme.js` 把当前壁纸画到 `96x96` Canvas。
2. 通过 `getImageData()` 取得 RGBA 像素。
3. JS 把像素写入 WASM 线性内存。
4. C++ 做空间权重、颜色质量权重、颜色量化、Top 色统计和候选色选择。
5. `decodeWasmPalette()` 把 WASM result buffer 解码成 JS palette。
6. `themeFromPalette()` 生成最终 CSS 主题色变量。

C++ 输出的 palette 包括：

- `dominant`：最高权重主色。
- `mood`：Top 色加权得到的氛围色。
- `vibrant`：高饱和、适合强调色的候选。
- `muted`：中等饱和、柔和的候选。
- `dark` / `light`：深色和浅色候选。
- `top`：前 32 个高权重色。

WASM 不是把旧 JS 原样翻译成 C++。它增加了更适合壁纸主题的分析逻辑：

- 中心区域轻微加权，减少边缘纯色、暗角或边框干扰。
- 过黑、过白、低饱和灰色会被降权。
- 每个量化色桶输出真实加权平均 RGB，而不是色桶中心值。
- 平均亮度也按权重计算。

扩展模式下，`manifest.json` 需要保留：

```text
script-src 'self' 'wasm-unsafe-eval'
```

这是 Chrome MV3 扩展页加载 WebAssembly 的要求。普通网页或 `file://` 环境中，如果浏览器拒绝 fetch 本地 wasm，主题色系统会自动回退到 JS 路径。

### 实测性能

以下数据来自扩展模式、本地壁纸 `少女-绿感.png`、50 轮 benchmark。当前 WASM/JS 对比使用同样的 `96x96` 采样，也就是 9216 个像素。

| 项目 | 耗时 |
|------|------|
| Canvas `getImageData`，96x96 | 0.638 ms |
| WASM 首次分析/初始化 | 0.600 ms |
| WASM 分析，96x96 | 0.210 ms |
| WASM 总耗时，取像素 + 分析 | 0.848 ms |
| JS 分析，96x96 | 0.376 ms |
| JS 总耗时，取像素 + 分析 | 1.014 ms |
| 旧版 JS 36x36 总耗时 | 0.138 ms |

结论：

- 同样 `96x96` 输入下，WASM 分析约为 JS 的 `1.79x`。
- 算上 Canvas 取像素后，整体约为 `1.20x`。
- 旧版 `36x36` 仍然更快，因为只处理 1296 个像素；当前方案处理 9216 个像素，是旧版的 7.1 倍。
- 当前设计的价值不是单纯追求比旧版更省时，而是用不到 1 ms 的总成本换来更高分辨率、更稳定的调色板。

## 壁纸数据

壁纸数据和存储入口在 [js/wallpaper/data.js](../../js/wallpaper/data.js)。

项目同时使用 `localStorage` 和 IndexedDB，两者分工不同：

| 存储 | 主要用途 |
|------|----------|
| `localStorage` | 小配置、UI 偏好、预览图、缩略图、当前来源状态 |
| IndexedDB | Bing / API / 上传 / RSS 等较大的图片 Blob、文件夹句柄 |

首屏预览必须在 `localStorage`，因为它需要同步读取。大图不能塞进 `localStorage`，所以放 IndexedDB。

常见数据包括：

- `ptab_wallpaper_preview`：启动时同步使用的预览图。
- `ptab_wallpaper`：壁纸 provider 模型。
- `ptab_wallpaper_thumbs`：缩略图缓存。
- `ptab_wallpaper_blur_thumbs`：模糊缩略图缓存。
- `ptab_ui`：搜索栏、外观、壁纸显示等界面偏好。
- `ptab_shortcuts`：命令面板快捷链接和设置。
- `ptab_shortcut_icons`：快捷链接图标缓存。

写入大图时要遵守一个原则：先写大数据，再写引用；删除时先断引用，再删大数据。否则页面崩溃或浏览器中断时，容易留下指向不存在数据的状态。

## 壁纸来源

PlainTab 当前有五类壁纸来源：

| 来源 | 文件/模块 | 说明 |
|------|-----------|------|
| Bing | [js/wallpaper/fetch.js](../../js/wallpaper/fetch.js) | 默认来源，按日期缓存 |
| 本地上传 | 设置模块 + `WallpaperData` | 用户选择图片，保存 Blob 和缩略图 |
| 本地文件夹 | [js/wallpaper/folder.js](../../js/wallpaper/folder.js) | 使用 File System Access API 读取目录 |
| RSS | 设置模块 + fetch/data | 拉取图片 feed，缓存可用图片 |
| API | 设置模块 + fetch/data | 支持图片直链或 JSON 图片字段 |

这些来源共享同一套显示层。无论图片来自网络、本地上传、文件夹、RSS 还是 API，最终都应该进入 `WallpaperShow`，由它负责展示、预览和过渡。

失败时的基本策略：

- 当前来源失败，不立即清空画面。
- 能用旧缓存就用旧缓存。
- Bing 缓存尽量保留，作为通用兜底。
- 切换来源可能丢缓存时，让用户确认。
- 应用新来源失败时，不覆盖旧的稳定状态。

## 设置系统

设置系统分两层：

| 层级 | 文件 | 作用 |
|------|------|------|
| 一级面板 | [js/settings-bootstrap.js](../../js/settings-bootstrap.js) | 轻量入口、上传按钮、当前壁纸来源、版本/GitHub |
| 完整设置 | [js/settings-panel.js](../../js/settings-panel.js) | 界面、壁纸、快捷键、数据、关于 |

一级面板必须轻。它在主页面里很常用，不应该把完整设置逻辑全部提前加载。

完整设置里有两种保存方式：

- 界面偏好：即时保存，例如搜索栏位置、透明度、圆角、壁纸适配。
- 壁纸来源：草稿模型，修改后必须点“应用配置”才写入存储。

壁纸来源使用草稿模型，是因为它可能涉及网络测试、文件夹授权、缓存清理和来源切换。一个误点不应该破坏当前可用的壁纸状态。

## 搜索栏

搜索栏结构在 [index.html](../../index.html)，样式在 [css/search.css](../../css/search.css)，运行时主要在 [js/newtab.js](../../js/newtab.js) 和设置模块中。

支持能力：

- 显示模式：始终显示、悬停显示、隐藏。
- 位置、宽度、圆角、背景透明度和模糊可调。
- 搜索历史可关闭或保留最近记录。
- 网页模式支持多个搜索引擎。
- 扩展模式下隐藏不适合展示的引擎切换入口。

搜索栏相关设置保存在 `ptab_ui.search`。

## 命令面板

命令面板由 [js/command-palette.js](../../js/command-palette.js) 实现，样式在 [css/command-palette.css](../../css/command-palette.css)。

它是懒加载模块：用户不打开命令面板时，不应该把完整逻辑放进首屏关键路径。

主要能力：

- 添加、编辑、删除快捷链接。
- 普通空间和隐藏空间分离。
- 最近访问记录。
- 书签 HTML 导入。
- 快捷链接导出。
- 列表视图和图标视图。
- 自定义快捷键。

命令面板只负责快捷链接。全局配置导入导出在设置面板的数据页里，不要把两个边界混在一起。

## 数据备份

数据页支持：

- 明文 JSON 导出。
- 加密备份导出。
- 配置导入。

备份主要覆盖用户配置，例如界面偏好、壁纸配置、快捷链接、快捷键、搜索设置等。

不会完整带走：

- IndexedDB 里的大图 Blob。
- 本地文件夹授权。
- 用户磁盘上的原始图片。

这是刻意的边界。跨设备恢复时，本地资源应该由用户重新选择；否则备份会变重，也更容易失效。

## 国际化

PlainTab 有两套国际化：

| 位置 | 用途 |
|------|------|
| [_locales/](../../_locales/) | Chrome 扩展清单文案，例如扩展名称和描述 |
| [js/languages.js](../../js/languages.js) | 页面 UI 文案 |

新增 UI 文案时，不要只改当前语言。至少要保证英文兜底存在，否则语言切换或未知语言环境下容易显示 key。

## 运行模式

PlainTab 有两种运行方式：

| 模式 | 入口 | 特点 |
|------|------|------|
| 扩展模式 | Chrome / Edge 新标签页 | 使用 `manifest.json`，由浏览器接管新标签页 |
| 网页模式 | 直接打开 `index.html` | 可作为在线起始页或本地网页 |

代码中需要注意环境差异：

- `chrome.runtime` 不一定存在。
- 扩展 API 不能在普通网页里直接使用。
- 文件夹 API 取决于浏览器能力。
- 可选 host 权限只在扩展环境有意义。

## 目录结构

```text
PlainTab/
├── index.html              # 页面入口，脚本顺序很重要
├── manifest.json           # Manifest V3 扩展配置
├── 404.html                # 静态部署回退
├── css/
│   ├── base.css            # 全局基础样式和变量
│   ├── wallpaper.css       # 壁纸层、画廊、RSS 摘要
│   ├── search.css          # 搜索栏和历史候选
│   ├── settings.css        # 设置面板
│   └── command-palette.css # 命令面板
├── js/
│   ├── preload.js          # 启动预览热路径
│   ├── languages.js        # UI 多语言
│   ├── newtab.js           # 主运行时
│   ├── settings-bootstrap.js
│   ├── settings-panel.js
│   ├── command-palette.js
│   └── wallpaper/
│       ├── data.js         # 存储和数据模型
│       ├── show.js         # 壁纸显示和缩略图
│       ├── fetch.js        # 网络壁纸来源
│       ├── folder.js       # 本地文件夹来源
│       ├── theme.js        # 壁纸主题色相关逻辑
│       └── theme_engine.wasm # C++/WASM 主题色分析运行时
├── wasm/
│   ├── theme_engine.cpp    # WASM 主题色引擎源码
│   ├── build.bat           # Windows 构建脚本
│   └── build.sh            # shell 构建脚本
├── _locales/               # 扩展清单多语言
├── docs/                   # 文档、发布记录、AI 任务记录
├── icon/                   # 图标
├── imgs/                   # 截图和商店素材
```

## 开发约束

改代码时请尽量遵守这些约束：

- 不引入 npm、package.json 或构建工具。
- 不引入 React、Vue、Tailwind 等运行时依赖。
- 不随意扩大扩展权限。
- 不把网络、IndexedDB、Canvas 或文件夹扫描放进 `preload.js`。
- 不改变 `index.html` 中壁纸层和 `preload.js` 的关键顺序。
- 壁纸切换时不要同时清空 back/front 两层。
- 大数据写入和引用写入要注意顺序。
- 新增设置要考虑导入导出、默认值和语言文案。
- 命令面板不要进入首屏同步路径。
- 展示页面保持安静，不要把主页变成信息流或组件墙。

如果你不确定某个模块的规则，先看 [.claude/rules/](../../.claude/rules/) 下的对应说明。那些文件记录了项目当前实现的维护约束。

## AI 协作说明

PlainTab 是一个大量使用 AI 协作推进的项目。适合学习的不只是代码本身，还有这种工作方式：

- 用文档约束 AI 的修改边界。
- 用规则文件记录模块不变量。
- 用任务记录保存复杂改动的设计和验证过程。
- 让 AI 参与功能实现、重构、文档、测试脚本和发布准备。

相关文件：

- [AGENTS.md](../../AGENTS.md)：共享 AI 工作入口。
- [.claude/rules/](../../.claude/rules/)：模块规则。
- [docs/ai-tasks/](../ai-tasks/)：AI 任务记录和验证脚本。

如果你想学习 AI 如何参与真实项目，而不是只看一次性 demo，这个项目会比较适合拆开看。

## 快速开始

扩展模式：

1. 打开 `chrome://extensions`
2. 启用开发者模式
3. 选择“加载已解压的扩展程序”
4. 选择 PlainTab 项目目录

网页模式：

直接用浏览器打开 [index.html](../../index.html)。

在线体验：

[plaintab.kaininx.workers.dev](https://plaintab.kaininx.workers.dev)

## 相关链接

- [中文介绍](../README_zh-CN.md)
- [English technical documentation](README_en.md)
- [英文 README](../../README.md)
- [详细更新说明](../RELEASE_NOTES.md)
- [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo)
- [GitHub 项目主页](https://github.com/kaininx/PlainTab)

## 许可

PlainTab 使用 [MIT License](../../LICENSE) 开源。
