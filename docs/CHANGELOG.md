# Changelog · 更新日志

## v3.1.3

存储版本迁移：实现 localStorage 与 IndexedDB 的 schema 版本化迁移机制，统一键名风格，修复缩略图在本地模式下的有条件持久化逻辑。

- `feat`: 实现了 localStorage 与 IndexedDB 存储版本迁移机制
- `fix`: 更新 localStorage 键名以保持代码库一致性
- `fix`: 缩略图生成根据当前模式有条件地持久化到 localStorage
- `docs`: 简化了 Chrome Web Store 和手动安装说明

Storage version migration: implemented schema versioned migration for localStorage and IndexedDB, unified key naming conventions, fixed conditional thumbnail persistence in local mode.

- `feat`: Implemented storage version migration for localStorage and IndexedDB
- `fix`: Updated localStorage key naming for consistency across the codebase
- `fix`: Updated thumbnail generation to conditionally persist to localStorage based on current mode
- `docs`: Simplified installation instructions for Chrome Web Store and manual installation

## v3.1.2

- `fix`: 将 `_locales/pt` 重命名为 `pt_BR` 以符合 Chrome Web Store 规范——Chrome 只识别 `pt_BR`/`pt_PT`，不识别裸 `pt`
- `style`: 统一全部 16 语言 changelog 格式为紧凑单行 `• vX.Y.Z · ...` 风格
- `chore`: 葡萄牙语 README 和 changelog 文件同步重命名为 `pt_BR`

- `fix`: renamed `_locales/pt` to `pt_BR` for Chrome Web Store compliance — Chrome only recognizes `pt_BR`/`pt_PT`, not bare `pt`
- `style`: unified all 16-language changelog format to compact single-line `• vX.Y.Z · ...` style
- `chore`: renamed Portuguese README and changelog files to `pt_BR` for consistency

## v3.1.1
并发 Bing API 请求：通过 `Promise.any` 同时发起两个端点请求，最快响应胜出；添加 8 秒 `AbortController` 超时机制，确保连接安全关闭；更新全部 16 语言 README，反映并发竞速模式并新增 `Promise.any` / `AbortController` 延迟优化技术说明。
Concurrent Bing API requests: both endpoints fired simultaneously via `Promise.any`, fastest response wins; added 8-second `AbortController` timeout for clean connection teardown; updated all 16 READMEs to reflect concurrent race pattern and add `Promise.any`/`AbortController` latency techniques.

## v3.1.0
本地壁纸画廊：支持上传/删除/轮播多张本地壁纸，批量选择文件；代码重构（语义化命名、拆分长函数、设计注释）；优化设置与语言面板标题样式；完善多语言本地化文本；修复 CSP 移除 JSON API 域名。
Local wallpaper gallery: upload, delete, rotate multiple wallpapers with batch file selection; code refactoring (semantic naming, split functions, design comments); improved panel title styling; enhanced multi-language localization; fixed CSP to remove JSON API domains.

## v3.0.5
升级必应 API 代理（区域化请求 + 图片去重）；优化壁纸缓存逻辑（下载前检查 IDB）；统一 localStorage 键名；新增 16 语言 changelog 文件；改进日志信息与代码语义。
Upgraded Bing API proxy (region support + image dedup); optimized wallpaper caching (check IDB before download); unified localStorage keys; added 16-language changelog files; improved logging and code semantics.

## v3.0.4
修复壁纸加载失败：CSP `img-src` 白名单缺少 Bing CDN 域名（`www.bing.com` / `cn.bing.com`），代理 API 重定向后的图片被浏览器拦截。
Fixed wallpaper loading: CSP `img-src` allowlist was missing Bing CDN origins (`www.bing.com`, `cn.bing.com`), so images redirected from proxy APIs were blocked.

## v3.0.3
绕开 CSSOM 加速关键路径首帧渲染、CSP 安全加固、清理死代码、新增 SVG 图标与推广素材。
Bypassed CSSOM on critical preload path for faster first paint; tightened CSP; removed dead code; added SVG icons and promotion assets.

## v3.0.2
深色模式自适应背景、重构代码结构、底部多语言说明栏。
Dark mode adaptive background, restructured codebase, multilingual footer bar.

## v3.0.1
接入 Chrome Search API，通过 Chrome Web Store 单一用途合规审核。
Switched to Chrome Search API for CWS single-purpose compliance.

## v3.0.0
全面重写：双图层架构实现零闪烁壁纸渲染，添加保底灰色背景。
Complete rewrite: dual-layer architecture for zero-flicker wallpaper rendering with fallback background.

## v2.2.7
新增英/日/韩/俄/简中五语 README，默认搜索模式改为「始终显示」。
Added 5-language READMEs, set default search mode to always-on.

## v2.2.6
优化壁纸加载逻辑与缩略图缓存，整理必应 API 常量。
Optimized wallpaper loading and thumbnail caching; cleaned up Bing API constants.

## v2.2.5
引入壁纸预加载与首帧优化，消灭新标签页白屏闪烁。
Added wallpaper preloading and first-frame optimization to eliminate the blank flash on new tab open.

## v2.2.4
将壁纸存储方案从 localStorage 迁移至 IndexedDB。
Migrated wallpaper storage from localStorage to IndexedDB.

## v2.2.3
新增本地壁纸上传功能，优化搜索引擎切换体验。
Added local wallpaper upload and improved search engine switching UX.

## v1.2.0
项目首次成型：从单页 HTML 演化为完整扩展，引入壁纸系统、16 语言界面、Chrome i18n 本地化与 MIT 许可证。
Initial release: evolved from a single HTML page into a full extension with wallpaper system, 16-language UI, Chrome i18n locales, and MIT license.
