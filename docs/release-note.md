# PlainTab Release Notes

---

**PlainTab v3.1.3**

- Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) for automatic updates.
- Or download the `.crx` file below and drag it into `chrome://extensions`.

**Changelog (v3.1.3)**

- `feat`: Implemented storage version migration for localStorage and IndexedDB
- `fix`: Updated localStorage key naming for consistency across the codebase
- `fix`: Updated thumbnail generation to conditionally persist to localStorage based on current mode
- `docs`: Simplified installation instructions for Chrome Web Store and manual installation

**Summary (v3.1.3)**

v3.1.3 introduces a storage version migration system for both localStorage and IndexedDB, enabling safe schema evolution as PlainTab grows. All localStorage keys have been unified to a consistent naming convention across the codebase. Thumbnail generation logic has been fixed to conditionally persist based on the current wallpaper mode — thumbnails are now only persisted when relevant, preventing stale data in local rotation mode. Installation instructions in the release note have been simplified for better clarity.

---

**PlainTab v3.1.3**

- 前往 [Chrome 网上应用店](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) 安装，可自动更新。
- 或下载下方 `.crx` 文件，拖入 `chrome://extensions` 页面即可。

**更新日志 (v3.1.3)**

- `feat`: 实现了 localStorage 与 IndexedDB 存储版本迁移机制
- `fix`: 更新 localStorage 键名以保持代码库一致性
- `fix`: 缩略图生成根据当前模式有条件地持久化到 localStorage
- `docs`: 简化了 Chrome Web Store 和手动安装说明

**总结 (v3.1.3)**

v3.1.3 引入了 localStorage 与 IndexedDB 的存储版本迁移系统，支持随着 PlainTab 发展安全地演进存储结构。所有 localStorage 键名已统一为一致的命名规范。缩略图生成逻辑已修复为根据当前壁纸模式有条件地持久化——缩略图仅在相关时保存，避免本地轮播模式下的过期数据残留。发布说明中的安装指引已简化，更加清晰明了。
