# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

PlainTab 是一个 Chrome/Edge 浏览器扩展（Manifest V3），用来替换浏览器的新标签页。核心体验是零闪白的极简壁纸页面。同时也能作为独立网页运行。零外部依赖，无构建步骤——纯原生 JS + CSS。

## 开发命令

没有构建、没有 lint、没有测试、没有 `package.json`。

- **加载为扩展**：打开 `chrome://extensions` → 开启「开发者模式」→「加载已解压的扩展程序」→ 选择此目录 → 打开新标签页测试
- **作为网页测试**：直接在浏览器中打开 `index.html`

## 架构

### 模块总览（8 个独立逻辑单元）

每个模块的详细功能需求见 [.claude/rules/](.claude/rules/) 目录。改动某个模块前，先读对应的需求文档。

| 模块 | 需求文档 | 一句话职责 |
|------|---------|-----------|
| 数据存储 | [data-storage-spec.md](.claude/rules/data-storage-spec.md) | 21 个 localStorage key + 2 个 IndexedDB key，崩溃安全的读写顺序，版本迁移 |
| 语言系统 | [language-system-spec.md](.claude/rules/language-system-spec.md) | 16 种语言翻译，两级匹配检测，`t()` 四级回退链 |
| 壁纸系统 | [wallpaper-system-spec.md](.claude/rules/wallpaper-system-spec.md) | 双层零闪白显示，Bing 双端点竞速 + 缓存，本地最多 12 张轮换 |
| 搜索栏 | [search-bar-spec.md](.claude/rules/search-bar-spec.md) | 三种显隐模式，四种搜索引擎，扩展/网页双模式 |
| 设置面板 | [settings-panel-spec.md](.claude/rules/settings-panel-spec.md) | 壁纸/搜索/透明度/快捷键的配置 UI，面板互斥 |
| 本地图库 | [local-gallery-spec.md](.claude/rules/local-gallery-spec.md) | 上传/删除/拖拽排序，崩溃安全的写入顺序，Blob URL 生命周期 |
| 命令面板 | [command-palette-spec.md](.claude/rules/command-palette-spec.md) | Normal/Hidden 双面板快捷链接管理，10 个命令，列表/图标视图 |
| 全局交互 | [global-interaction-spec.md](.claude/rules/global-interaction-spec.md) | 启动流程、键盘优先级路由、鼠标热区追踪、面板协调 |

跨模块依赖、时序流程、数据流向图：[module-interactions.md](.claude/rules/module-interactions.md)。

### 文件加载顺序（绝对不可变）

```
index.html:
  1. <div id="wallpaperBack">         ← 必须在 preload.js 之前存在于 DOM
  2. <script src="js/preload.js">    ← 同步 IIFE，浏览器首帧绘制前写入缩略图
  3. <div id="wallpaperFront">
  4. ...其余所有 DOM 元素...
  5. <script src="js/languages.js">  ← 设置 window.I18N + window.LanguageList
  6. <script src="js/newtab.js">     ← 主程序 IIFE：检测环境 → 检测语言 → 加载设置 → 加载壁纸 → 绑定事件
```

顺序不可调换。`preload.js` 在 `#wallpaperBack` 之后、首帧绘制之前执行，是零闪白的前提。

### 双层壁纸系统（零闪白原理）

- `#wallpaperBack`（z-index:0）— 始终持有一张可见图片。`preload.js` 在浏览器首次绘制前同步把缩略图写到这里。
- `#wallpaperFront`（z-index:1，`opacity:0`）— 只做淡入过渡。新图先预加载（`img.decode()` 确保解码完成），设到 front 层，然后 CSS opacity 过渡淡入。550ms 后把新图「稳定」到 back 层（`back.style.backgroundImage = url`），front 清空归零。

任何时候至少有一层持有已渲染的图片——永远不会出现空白帧。

### 两种运行模式

启动时通过 `typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id` 判定：

- **扩展模式**：使用 `chrome.search.query()` 满足 Chrome 商店单一用途政策。引擎选择器隐藏，图标变为静态放大镜。`Ctrl+Shift+W` 切换设置面板。
- **网页模式**：完整引擎选择器（Google→Bing→Baidu→DuckDuckGo）。搜索用 `window.open(url, '_self')` 跳转。

### 存储

- **IndexedDB**（`PlainTab`，版本 1，store `wallpaper`）：存图片原图 Blob。Key：`ptab_bing_blob`（单张 Bing）、`ptab_img_<id>`（每张本地图 `{blob, mime, name}`）。
- **localStorage**：存其余所有——设置、缩略图（base64 data URL）、元数据、快捷链接数据。完整 21 key 清单见 [data-storage-spec.md](.claude/rules/data-storage-spec.md)。

### 崩溃安全（黄金法则）

**先落重数据，再写轻引用。先断引用，再删重数据。**

- 保存：`idbPut(blob)` → `saveOrder(order)` + `saveThumbs(thumbs)`
- 删除：`saveOrder(newOrder)` → `delete thumbs/meta` → `idbDelete(blob)`
- 保存中途崩溃：blob 已入库但 order 不引用 → 孤儿 blob，安全忽略
- 删除中途崩溃：blob 还在但 order 已移除引用 → 不可达，安全忽略

### 已知坑点

- **IDB 取回 Blob 时 MIME 丢失**：从 IndexedDB 取出的 Blob 可能丢失 MIME 类型。务必检查 `blob.type`，为空则用存的 `mime` 重建：`new Blob([blob], {type: storedMime})`。
- **preview_thumb 竞态**：本地轮换模式下，`ptab_local_index` 递增后必须在异步的 `applyWallpaper()` 调用之前**同步**写入 `ptab_preview_thumb`。若异步写入，快速连续开新标签页会读到过期的预览数据。
- **图库 Blob URL 生命周期**：`renderLocalGallery()` 在缩略图缺失时会创建 Blob URL 做回退。所有创建的 URL 必须追踪，图库关闭时通过 `revokeGalleryUrls()` 全部释放。务必在清空图库 DOM 前调用 `revokeGalleryUrls()`。
- **`_uploadKeepOpen` 竞态**：批量上传时，`_uploadKeepOpen` 在 `fileInput.click()` 前设置、在 Promise 链完成后读取。多次快速点击图库「＋」按钮理论上可能竞态，但 UI 上很难触发。
- **面板互斥**：设置面板 ↔ 语言面板互斥（打开一个自动关闭另一个）。命令面板是覆盖层，叠在两者之上。关闭函数是幂等的——对已关闭的面板再调一次关闭也安全。

### CSP 约束

来自 [manifest.json](manifest.json)：
```
script-src 'self'; object-src 'self';
img-src 'self' https://www.bing.com https://cn.bing.com https://icons.duckduckgo.com data: blob:;
style-src 'self'
```

**禁止**：HTML 内联 `style="..."`、内联 `onclick`/`onerror`、`<style>` 标签、`eval()`。
**允许**：CSS class + JS 中 `element.style.xxx` 动态样式、`addEventListener` 绑定事件、从 `icons.duckduckgo.com` 加载网站图标。

### 提交规范

约定式提交（Conventional Commits）：`feat:`、`fix:`、`chore:`、`docs:`、`refactor:`、`style:`、`perf:`。

### 文件清单

| 文件 | 作用 |
|------|------|
| `manifest.json` | 扩展清单（MV3），权限：`search` |
| `index.html` | 唯一 HTML 页面——即新标签页 |
| `css/newtab.css` | 全部样式（~1267 行） |
| `js/preload.js` | 同步写入缩略图（~27 行） |
| `js/languages.js` | 16 语言翻译表 + 语言列表（~503 行） |
| `js/newtab.js` | 全部应用逻辑（~3127 行） |
| `404.html` | SPA 回退页（纯 HTML，无 JS） |
| `_locales/*/messages.json` | Chrome 扩展清单元数据翻译（16 种语言） |
| `icon/` | 扩展图标（16/48/128px） |
| `imgs/` | README 截图 |
| `docs/` | 文档：翻译版 README、更新日志、发布说明、架构说明 |
| `.claude/rules/` | 详细功能需求文档（8 个模块 + 模块联动总览） |
