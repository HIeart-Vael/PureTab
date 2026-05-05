# Changelog · 更新日志

## v1.2.0
从单页 HTML 起步，演化为完整扩展：引入 newtab.js 壁纸系统、16 语言界面与 Chrome i18n 清单、MIT 许可证。
Evolved from a single HTML page into a full extension with newtab.js wallpaper system, 16-language UI and Chrome i18n locales, MIT license.

## v2.2.3
新增本地壁纸上传功能，优化搜索引擎切换体验。
Added local wallpaper upload and improved search engine switching UX.

## v2.2.4
迁移至 IndexedDB 存储壁纸，替换原有 localStorage 方案。
Migrated wallpaper storage from localStorage to IndexedDB.

## v2.2.5
引入壁纸预加载与首帧优化，消灭新标签页白屏闪烁。
Wallpaper preloading and first-frame optimization to eliminate the blank flash on new tab open.

## v2.2.6
优化壁纸加载逻辑与缩略图缓存，格式化必应 API 常量。
Optimized wallpaper loading, thumbnail caching, and Bing API constant cleanup.

## v2.2.7
新增英/日/韩/俄/简中五语 README，默认搜索模式改为「始终显示」。
Added 5-language READMEs, set default search mode to always-on.

## v3.0.0
全面重写：双图层架构实现零闪烁壁纸渲染，添加保底灰色背景。（详见 [V3_NOTE.md](./V3_NOTE.md)）
Complete rewrite: dual-layer architecture for zero-flicker wallpaper rendering with fallback background. (See [V3_NOTE.md](./V3_NOTE.md))

## v3.0.1
接入 Chrome Search API，通过 Chrome Web Store 单一用途合规审核。
Switched to Chrome Search API for CWS single-purpose compliance.

## v3.0.2
深色模式自适应背景、重构代码结构、多语言底部说明栏。
Dark mode adaptive background, restructured codebase, multilingual footer bar.

## v3.0.3
关键路径绕样式表加速首帧、CSP 安全加固、清理死代码、SVG 图标、推广位素材。
Bypassed CSSOM on critical preload path, tightened CSP, removed dead code, added SVG icons and promotion assets.
