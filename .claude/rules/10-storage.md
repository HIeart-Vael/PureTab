# 数据存储需求规格

## 行为概述

PlainTab 使用两种存储方式：

- **localStorage**：轻量、同步、首屏可读。保存语言、界面偏好、壁纸轻量模型、缩略图、快捷链接模型等。
- **IndexedDB**：异步大文件存储。保存壁纸原图 Blob、文件夹目录句柄和文件夹索引。

当前存储入口集中在 `js/wallpaper/data.js` 的 `window.WallpaperData`。UI 和运行时代码不得绕过该模块直接操作壁纸 IDB 数据。

### 当前 localStorage key（LS_VERSION = 3）

| Key | 内容 |
|-----|------|
| `ptab_schema_version` | 存储结构版本号，当前为 `3` |
| `ptab_locale` | 用户选择的界面语言 |
| `ptab_wallpaper` | 壁纸主模型：当前源、各 provider 配置/状态、缓存 order/index/meta |
| `ptab_wallpaper_thumbs` | 普通缩略图池，值为 CSS-ready `url(data:image/...)` 字符串 |
| `ptab_wallpaper_blur_thumbs` | 模糊缩略图池，值为 `{ blur, thumb }` |
| `ptab_wallpaper_preview` | 首屏唯一同步读取的壁纸预览 |
| `ptab_ui` | 搜索栏、壁纸遮罩/模糊/主题、图标、面板等界面偏好 |
| `ptab_shortcuts` | 快捷链接、最近访问、隐藏列表、命令面板设置 |
| `ptab_shortcut_icons` | 快捷链接图标缓存 |

### 当前 IndexedDB key（DB = `PlainTab`, store = `wallpaper`）

| Key | 内容 |
|-----|------|
| `ptab_wallpaper_blob_bing` | Bing 当前/兜底图，值为 `{ blob, mime, name }` |
| `ptab_wallpaper_blob_api` | API 固定单图槽，值为 `{ blob, mime, name }` |
| `ptab_wallpaper_blob_upload_<id>` | 本地上传图片，最多 12 张 |
| `ptab_wallpaper_blob_rss_<id>` | RSS 下载图片，最多 12 张活跃缓存 |
| `ptab_wallpaper_folder_handle` | `FileSystemDirectoryHandle`，文件夹授权句柄 |
| `ptab_wallpaper_folder_files` | 非递归文件索引数组，元素为 `{ name, size, lastModified }` |

### 数据内容分类

**壁纸系统：** `ptab_wallpaper` 存 `activeSource`、`providers.*.config`、`providers.*.state` 和 `cache`。缩略图和预览图单独存，原图在 IDB。文件夹模式额外保存目录句柄和第一层文件索引。

**语言系统：** `ptab_locale` 保存用户选择。未保存时由运行时从浏览器语言检测。

**搜索与界面：** `ptab_ui` 保存搜索栏显示模式、位置、宽度、圆角、图标位置、搜索框背景/模糊、壁纸适配/焦点/遮罩/背景模糊/主题色、图标透明度、面板透明度和界面圆角。

**命令面板：** `ptab_shortcuts` 保存快捷链接、最近访问、隐藏列表、快捷键、推荐开关和视图模式；`ptab_shortcut_icons` 保存图标数据。

### 数据保存安全原则

大文件和小引用必须按崩溃安全顺序处理：

1. 新增图片时，先把原图写入 IDB。
2. 再把图片 ID 写入 `cache.order` 或对应 provider 状态。
3. 再写缩略图和 meta。
4. 删除图片时反过来：先移除引用，再删缩略图/meta，最后删 IDB 原图。

如果写入中途崩溃，最多留下孤立 Blob；没有引用的 Blob 不会被运行时选中。

### 模型归一化

读取模型时必须走 `WallpaperData` 的 normalize/merge 逻辑：

- `local` 会兼容为 `upload`。
- folder `strategy` 只归一为 `shuffle`，旧值 `random` 仅作为兼容别名。
- RSS/API 的 sources 会限制为最多 5 个，并校验 active source id。
- API 旧字段 `url/jsonPath` 会归并为 `imageSources/jsonSources`。
- 背景模糊只允许 `0` 或 `5-15`，`1-4` 归一为 `5`。

### 源切换时的数据清理

`clearWallpaperSourceCache(source)` 只清理被切换离开的旧源缓存，并保留用户配置，方便切回后继续编辑。

| 切换离开 | 当前实现 |
|---------|---------|
| Bing | 不清理。Bing 原图、缩略图和 meta 保留，作为全局兜底 |
| 本地上传 | 删除 `ptab_wallpaper_blob_upload_*`，清除 upload order/thumbs/blurThumbs/meta，保留 upload 配置 |
| 文件夹 | 删除 `ptab_wallpaper_folder_handle` 和 `ptab_wallpaper_folder_files`，清除 `folder:<encodedName>` 相关 order/thumbs/blurThumbs/meta/state，保留 `pathLabel/strategy` 配置 |
| RSS | 删除 `ptab_wallpaper_blob_rss_*`，清除 `rss_<id>` 相关 order/thumbs/blurThumbs/meta，清空 RSS 运行态的错误和最后图片 URL，保留 RSS sources、展示选项和测试状态 |
| API | 删除 `ptab_wallpaper_blob_api`，清除 `api` thumbs/blurThumbs/meta/order，并重置 API 运行态，保留 API sources、apiType、刷新频率和测试状态 |

切换离开非 Bing 源且该源存在缓存时，设置面板会先弹出确认；从 Bing 切换到其他来源不确认，因为 Bing 缓存被保留。

### 版本入口

当前 `migrate` 入口只确保 `ptab_schema_version = 3`，并依赖读取时归一化补齐缺失字段。旧版本迁移映射记录在 `90-storage-history.md`，仅作历史参考；新增真实迁移时必须同时更新 `data.js` 和该历史文档。

### 容量与失败策略

- 单个 localStorage 值应保持在浏览器可接受范围内；`ptab_wallpaper_preview` 由 `preload.js` 限制最大约 350KB，超限会被移除。
- 缩略图写入失败时应静默降级，不影响原图显示。
- IDB 读取失败或连接断开时跳过当前文件，并允许下次重建连接。
- 隐私模式或权限失效导致 IDB/文件夹句柄不可持久时视为正常失败路径。
- 不假设多个新标签页并发写入同一数据结构；如未来引入并发写入，需要增加冲突处理。
