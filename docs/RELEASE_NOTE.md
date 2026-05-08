# PlainTab Release Notes

---

**PlainTab v3.1.0**

- It is recommended to install online from the [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) – this enables automatic updates and is more hassle‑free.
- For manual installation: download the `Source code (zip)` archive below, unzip it, then go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the unzipped folder. We do not provide a `.crx` file (since Chrome M76+, external sideloading of `.crx` files is disallowed).

**Changelog (v3.1.0)**

- `feat`: add local wallpaper gallery — upload, delete, preview, and rotate up to 12 personal wallpapers stored in IndexedDB with base64 thumbnails cached in localStorage
- `feat`: support batch selection of multiple local wallpaper files via serialized Promise chain to prevent IDB write races
- `feat`: multi-language README overhaul — V3 technical deep-dive translated into 16 languages with unified inter-language navigation sorted by global speaker count
- `fix`: remove JSON API domains from `img-src` CSP to tighten extension security posture
- `refactor`: restructure `newtab.js` with semantic function naming, split oversized functions, and add design rationale comments throughout
- `style`: improve settings panel and language selector title styling for visual consistency
- `docs`: add `RELEASE_NOTE.md` with bilingual changelog for releases

**Summary (v3.1.0)**

v3.1.0 is a major feature release centered on two pillars: local wallpaper management and documentation overhaul. Users can now upload, preview, delete, and auto-rotate up to 12 personal wallpapers — stored entirely offline in IndexedDB with Canvas-generated base64 thumbnails for zero-network first-paint. The batch upload path uses a serialized Promise chain to eliminate IndexedDB write races. The README has been rewritten from the ground up as a technical deep-dive covering the dual-layer zero-flash architecture, Canvas thumbnail pipeline, hybrid storage strategy, and every Web API chosen to eliminate latency — then translated into 16 languages with a unified inter-language navigation system sorted by global speaker count. Along the way, CSP was tightened, `newtab.js` was refactored for clarity, and panel styling was refined.

---

**PlainTab v3.1.0**

- 建议前往 [Chrome 网上应用店](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) 在线安装，这样能自动更新，更省心。
- 如需本地安装：请下载下方的 `Source code (zip)` 压缩包，解压后进入 `chrome://extensions` 页面，开启「开发者模式」，然后点击「加载已解压的扩展程序」，选择解压后的文件夹即可。我们不提供 `.crx` 文件（自 Chrome M76 起，已禁止外部侧载 `.crx` 文件）。

**更新日志 (v3.1.0)**

- `feat`: 增加本地壁纸管理——支持上传、删除、预览及自动轮播最多 12 张个人壁纸，数据存储在 IndexedDB 中，缩略图以 base64 形式缓存于 localStorage
- `feat`: 支持通过串行 Promise 链批量选择多个本地壁纸文件，避免 IndexedDB 写入竞争
- `feat`: 多语言 README 重写——V3 技术深度解析文章已翻译为 16 种语言，并按全球使用人数排序构建统一的多语言互链导航
- `fix`: 从 CSP 的 `img-src` 中移除 JSON API 域名，收紧扩展安全策略
- `refactor`: 重构 `newtab.js`，使用语义化函数命名，拆分过大的函数，并补充设计理念注释
- `style`: 优化设置面板和语言选择器标题样式，提升视觉一致性
- `docs`: 新增 `RELEASE_NOTE.md`，提供中英双语更新日志

**总结 (v3.1.0)**

v3.1.0 是一次主要功能版本更新，围绕两条主线：本地壁纸管理和文档重写。用户现在可以上传、预览、删除和自动轮播最多 12 张本地壁纸——全部离线存储在 IndexedDB 中，配合 Canvas 生成的 base64 缩略图实现零网络首帧。批量上传通过串行化 Promise 链消除 IndexedDB 写入竞争。README 从头重写为技术深度文档，覆盖双层零白屏架构、Canvas 缩略图管线、混合存储策略以及每一个为消除延迟而选用的 Web API——并翻译为 16 种语言，按全球使用人数排序的互链导航系统。同时收紧了 CSP、重构了 `newtab.js`、优化了面板样式。

---