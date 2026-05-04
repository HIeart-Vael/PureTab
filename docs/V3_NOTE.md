# PlainTab v3.0.0 Release Notes · 更新日志

## English

### 🏗️ Complete Architecture Rewrite — Zero-Flash Wallpaper System

v3 is a ground-up rewrite with a new **dual-layer compositing architecture** that guarantees zero visual flicker during wallpaper transitions.

**The Problem in v2:**
The old version used a single `<div>` with CSS `background-image` switching. Changing from thumbnail to full-resolution wallpaper required a cascade change (stylesheet → inline style), which caused the browser to discard the rendered background for at least one frame — resulting in a visible gray flash.

**The v3 Solution:**
Two stacked wallpaper layers (`#wallpaperBack` + `#wallpaperFront`) with opacity cross-fade:

1. `preload.js` synchronously writes a 640px thumbnail to the **back layer** before the browser's first paint — the user sees wallpaper instantly
2. `newtab.js` preloads the full-resolution image and decodes it in memory (`img.decode()`)
3. The full image is set on the **front layer** (initially `opacity: 0`, invisible)
4. After double `requestAnimationFrame` to ensure the compositor has processed the new image, the front layer fades in via CSS `opacity` transition
5. Once the fade completes, the image is stabilized to the back layer and the front layer resets

**Why this works:** The back layer always holds a visible image. The front layer only becomes visible after the new image is confirmed decoded. There is never a frame where no image is displayed.

### ✨ Key Improvements

| Area | v2 | v3 |
|------|----|----|
| Wallpaper layers | 1 layer, CSS `background-image` swap | 2 layers, opacity cross-fade |
| Cascade behavior | Stylesheet → inline style switch causes blank frame | Same stylesheet rule, value-only update |
| Thumbnail quality | 320px wide, JPEG q=0.5 | 640px wide, JPEG q=0.55 |
| File size limit | Limited by data URL conversion | **No limit** — raw blob storage in IndexedDB |
| IDB reads | Sequential (local → bing) | Parallel `Promise.all` |
| Transition method | `transition: background-image` (non-animatable) | `transition: opacity` (animatable) |
| Code size | ~700 lines single file | 637 lines, cleaner modular structure |

### 🔧 Technical Details

- **Storage:** IndexedDB stores raw image blobs (no base64 conversion for full images), `localStorage` for thumbnail and settings
- **Thumbnail:** Generated from File object directly (fast path for local uploads) or from loaded image URL
- **i18n:** Same 16 languages, streamlined key names
- **Search engines:** Google, Bing, Baidu, DuckDuckGo — click icon to cycle
- **Settings:** Search bar mode, icon opacity, search engine — all persisted in `localStorage`

### ⚠️ Breaking Changes

- Storage keys renamed (prefixed with `pt3_`) — v2 settings are not migrated
- Extension ID unchanged, compatible with existing installations after upgrade

---

## 中文

### 🏗️ 架构完全重写 — 零闪烁壁纸系统

v3 是从零开始的完全重写，采用全新的**双层合成架构**，保证壁纸切换过程零视觉闪烁。

**v2 的问题：**
旧版使用单个 `<div>` 配合 CSS `background-image` 切换。从缩略图切换到高清壁纸需要级联变更（stylesheet → inline style），浏览器在至少一帧内丢弃已渲染的背景——导致肉眼可见的灰色闪烁。

**v3 的解决方案：**
两个叠加的壁纸层（`#wallpaperBack` + `#wallpaperFront`）配合 opacity 交叉淡入淡出：

1. `preload.js` 在浏览器首帧绘制前，将 640px 缩略图同步写入**后层**——用户瞬间看到壁纸
2. `newtab.js` 在内存中预加载并解码完整分辨率图片（`img.decode()`）
3. 将完整图片设置到**前层**（初始 `opacity: 0`，不可见）
4. 双重 `requestAnimationFrame` 确保合成器已处理新图片后，前层通过 CSS `opacity` 过渡淡入
5. 淡入完成后，图片固化到后层，前层重置为透明

**为什么不会闪烁：** 后层始终持有可见图片。前层仅在新图片确认解码完成后才变为可见。任何时刻都不存在"无图片显示"的帧。

### ✨ 核心改进

| 方面 | v2 | v3 |
|------|----|----|
| 壁纸层级 | 1 层, CSS `background-image` 切换 | 2 层, opacity 交叉淡入 |
| 级联行为 | Stylesheet → inline style 切换导致空帧 | 同一 stylesheet 规则, 仅值更新 |
| 缩略图质量 | 320px 宽, JPEG q=0.5 | 640px 宽, JPEG q=0.55 |
| 文件大小限制 | 受 data URL 转换限制 | **无限制** — IDB 直存原始 blob |
| IDB 读取 | 串行 (本地 → Bing) | 并行 `Promise.all` |
| 过渡方式 | `transition: background-image` (不可动画) | `transition: opacity` (可动画) |
| 代码量 | ~700 行单文件 | 637 行, 更清晰的模块结构 |

### 🔧 技术细节

- **存储:** IndexedDB 存储原始图片 blob（全尺寸图片不做 base64 转换），`localStorage` 存缩略图和设置
- **缩略图:** 从 File 对象直接生成（本地上传快速通道）或从加载后的图片 URL 生成
- **国际化:** 相同 16 种语言, 精简的键名
- **搜索引擎:** Google, Bing, Baidu, DuckDuckGo — 点击图标循环切换
- **设置:** 搜索栏模式, 图标不透明度, 搜索引擎 — 全部持久化在 `localStorage`

### ⚠️ 不兼容变更

- 存储键名已重命名（前缀 `pt3_`）——v2 设置不会自动迁移
- 扩展 ID 不变, 升级后与现有安装兼容
