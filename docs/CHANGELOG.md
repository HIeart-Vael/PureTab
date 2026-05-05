# Changelog · 更新日志

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
全面重写：双图层架构实现零闪烁壁纸渲染，添加保底灰色背景。（详见 [V3_NOTE.md](./V3_NOTE.md)）
Complete rewrite: dual-layer architecture for zero-flicker wallpaper rendering with fallback background. (See [V3_NOTE.md](./V3_NOTE.md))

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
