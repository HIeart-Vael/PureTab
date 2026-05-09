# PlainTab Release Notes

---

**PlainTab v3.1.4**

- Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) for automatic updates.
- Or download the `.crx` file below and drag it into `chrome://extensions`.

**Changelog (v3.1.4)**

- `refactor`: Renamed storage constants (KEY_* → LS_KEY_*/DB_KEY_*) to distinguish localStorage vs IndexedDB keys
- `refactor`: Merged IDB migration into two-phase transaction — put new keys before deleting old ones, retry-safe if LS write fails
- `refactor`: New users skip migration by writing version directly, avoiding unnecessary IDB transactions
- `fix`: Batch upload now deduplicates by file name (within and across batches), auto-caps at 12 images

**Summary (v3.1.4)**

v3.1.4 refactors the storage layer with clearer constant naming that distinguishes localStorage from IndexedDB keys at a glance. The IDB migration has been restructured into a two-phase transaction: individual image keys are created first, and old array-based keys are only deleted after localStorage order/thumbs are safely persisted — making the migration retry-safe if interrupted mid-way. New users now skip the migration chain entirely, avoiding unnecessary IDB transactions on first install. Batch upload gains deduplication by file name, filtering duplicates both within the same batch and against already-saved images, with automatic capping at the 12-image limit.

---

**PlainTab v3.1.4**

- 前往 [Chrome 网上应用店](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) 安装，可自动更新。
- 或下载下方 `.crx` 文件，拖入 `chrome://extensions` 页面即可。

**更新日志 (v3.1.4)**

- `refactor`: 存储常量重命名（KEY_* → LS_KEY_*/DB_KEY_*），区分 localStorage 与 IndexedDB 键名
- `refactor`: 合并 IDB 迁移为两段事务，先 put 新键后删旧键，确保 LS 写入失败时重试可恢复
- `refactor`: 新用户直接写版本号跳过迁移，避免无效的 IDB 事务
- `fix`: 批量上传增加文件名去重（同批次内与跨批次），超出 12 张上限自动截断

**总结 (v3.1.4)**

v3.1.4 重构了存储层的常量命名，一眼即可区分 localStorage 与 IndexedDB 键名。IDB 迁移重构为两阶段事务：先创建单条图片 key，等 localStorage 的 order/thumbs 安全落地后再删除旧的数组格式 key——迁移中途中断也能安全重试。新用户直接写入版本号跳过迁移链，首次安装不再产生无效的 IDB 事务。批量上传新增文件名去重，同时过滤批次内重复和已入库图片，超过 12 张自动截断。
