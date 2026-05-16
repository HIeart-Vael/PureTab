# 存储格式版本变迁

本文档记录 PlainTab 各发布版本中 localStorage 和 IndexedDB 的完整数据格式及变更，为迁移逻辑提供依据。

## 版本总览

| 产品版本 | LS_VERSION | DB | localStorage key 数 |
|---------|-----------|-----|-------------------|
| v3.0.4 | 无（通过 `pt3_` 前缀检测） | PlainTabV3 (v1) | 8 |
| v3.1.4 | 2 | PlainTab (v1) | 11 |
| v3.2.0 | 3 | PlainTab (v1) | 8 |

---

## v3.0.4（tag: v3.0.4）

**无 `ptab_version` key。启动时 `parseInt(localStorage.getItem('ptab_version')) || 0` → 0。**

### localStorage（8 个 key）

| Key | 类型 | 内容 |
|-----|------|------|
| `__pt3_thumb` | String | 壁纸缩略图，格式 `url(data:image/jpeg;base64,...)` |
| `pt3_lang` | String | 语言代码 |
| `pt3_source` | String | 壁纸模式：`'bing'` / `'local'` |
| `pt3_search_mode` | String | 搜索栏模式：`'always'` / `'hover'` / `'never'` |
| `pt3_opacity` | Number | 图标透明度 0~1 |
| `pt3_engine` | String | 搜索引擎：`'google'` / `'bing'` / `'baidu'` / `'duckduckgo'` |
| `pt3_bing_url` | String | Bing 壁纸 URL 缓存 |
| `pt3_bing_date` | String | Bing 缓存日期 |

### IndexedDB（PlainTabV3，v1，store: wallpaper）

| Key | 类型 | 内容 |
|-----|------|------|
| `bing_blob` | Blob | Bing 每日壁纸原图（仅 1 张） |
| `bing_date` | String | Bing 缓存日期 |
| `local_blob` | Blob | 本地壁纸原图（仅 1 张） |
| `local_mime` | String | 本地壁纸 MIME 类型 |

特点：本地只存 1 张图，Bing 也是单 blob，无数组概念，无缩略图缓存体系。

---

## v3.1.4（tag: v3.1.4）

**LS_VERSION = 2，DB_VERSION = 1。通过 MIGRATIONS[1] 从 v3.0.4 迁移而来。**

### 变更汇总

| 状态 | 数量 | Keys |
|------|------|------|
| 🟢 新增 | 5 | `ptab_version`、`ptab_bing_meta`（合并旧 `pt3_bing_url` + `pt3_bing_date`）、`ptab_img_order`、`ptab_img_thumbs`、`ptab_local_index` |
| 🟡 重命名 | 6 | `pt3_source` → `ptab_mode`、`__pt3_thumb` → `ptab_bing_thumb`（去除 `url()` 包裹）、`pt3_lang` → `ptab_lang`、`pt3_search_mode` → `ptab_search_mode`、`pt3_opacity` → `ptab_icon_opacity`、`pt3_engine` → `ptab_search_engine` |
| 🔴 删除 | 2 | `pt3_bing_url`、`pt3_bing_date`（值合并入 `ptab_bing_meta`） |

净效果：8 → 11（删 2 旧，增 5 新，6 重命名）。

### localStorage（11 个 key）

| Key | 类型 | 内容 | 变更 |
|-----|------|------|------|
| `ptab_version` | Number | `2` | 🟢 新增 |
| `ptab_mode` | String | `'bing'` / `'local'` | 🟡 重命名（原 `pt3_source`） |
| `ptab_bing_thumb` | String | Bing 缩略图 base64 | 🟡 重命名 + 去除 `url()` 包裹 |
| `ptab_bing_meta` | JSON | `{src, date, provider}` | 🟢 新增（合并 `pt3_bing_url` + `pt3_bing_date`） |
| `ptab_img_order` | JSON Array | 本地图片 ID 列表 | 🟢 新增 |
| `ptab_img_thumbs` | JSON | `{id: "base64"}` | 🟢 新增 |
| `ptab_local_index` | Number | 本地轮换索引 | 🟢 新增 |
| `ptab_lang` | String | 语言代码 | 🟡 重命名（原 `pt3_lang`） |
| `ptab_search_mode` | String | 搜索栏模式 | 🟡 重命名（原 `pt3_search_mode`） |
| `ptab_icon_opacity` | Number | 图标透明度 0~1 | 🟡 重命名（原 `pt3_opacity`） |
| `ptab_search_engine` | String | 搜索引擎 | 🟡 重命名（原 `pt3_engine`） |

### IndexedDB（PlainTab，v1，store: wallpaper）

| Key | 类型 | 内容 | 变更 |
|-----|------|------|------|
| `ptab_bing_blob` | `{blob, mime, name}` | Bing 壁纸 | 🟡 重命名 + 值升级（原 `bing_blob` 裸 Blob → 对象） |
| `ptab_img_<id>` | `{blob, mime, name}` | 单张本地壁纸（≤12） | 🟡 拆分（原 `local_blob`+`local_mime` 单图 → 多图独立 key） |

**删除的旧 IDB key：** `bing_blob`、`bing_date`、`local_blob`、`local_mime`

---

## v3.2.0（当前版本，tag: 未发布）

**LS_VERSION = 3，DB_VERSION = 1。**

### 变更动因

v3.1.4 壁纸系统只有两模式（Bing / 本地上传），且壁纸、界面、语言等 key 混在同一层命名空间中。扩展 RSS、API、本地文件夹和快捷方式后，如果继续新增零散 key，会很难区分「用户配置」「运行状态」「图片缓存」和「界面偏好」。

v3.2.0 改为 **按领域打包存储**：

- 首屏热路径单独保留 1 个 preview key，`preload.js` 只做一次 `getItem`，不解析 JSON。
- 壁纸主模型打包为一个对象，区分 provider 配置、provider 运行状态、当前活跃缓存索引。
- 大体积缩略图和快捷方式图标缓存单独存，避免每次读取小配置时解析大字符串。
- UI 偏好和快捷方式模型各自打包，减少 key 数量并让语义更清楚。

### 变更汇总（v3.1.4 → v3.2.0）

| 状态 | 内容 |
|------|------|
| 🟢 新增 / 打包 | `ptab_schema_version`、`ptab_locale`、`ptab_wallpaper`、`ptab_wallpaper_thumbs`、`ptab_wallpaper_preview`、`ptab_ui`、`ptab_shortcuts`、`ptab_shortcut_icons` |
| 🔴 清理旧 LS key | `ptab_version`、`ptab_mode`、`ptab_bing_thumb`、`ptab_bing_meta`、`ptab_img_order`、`ptab_img_thumbs`、`ptab_img_meta`、`ptab_local_index`、`ptab_preview_thumb`、`ptab_lang`、`ptab_search_mode`、`ptab_icon_opacity`、`ptab_search_engine` |
| 🟡 DB 重命名 | `ptab_bing_blob` → `ptab_wallpaper_blob_bing`，`ptab_img_<id>` → `ptab_wallpaper_blob_upload_<id>` |
| ⬜ DB 版本 | 仍为 `PlainTab` v1，不新增 object store |

净效果：11 → 8。v3.2.0 的 8 个 localStorage key 中，壁纸 preview 是首屏热路径专用，其他 key 都按领域打包。

### localStorage（8 个 key）

| Key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `ptab_schema_version` | Number | `3` | 存储结构版本。v3.2.0 起替代旧 `ptab_version` |
| `ptab_locale` | String | 自动检测 | 用户选择的界面语言。替代旧 `ptab_lang` |
| `ptab_wallpaper` | JSON Object | 见下方结构 | 壁纸主模型：当前源、各源配置、各源运行状态、当前活跃缓存索引 |
| `ptab_wallpaper_thumbs` | JSON Object | `{}` | 当前活跃壁纸源的缩略图字典。值必须是 CSS-ready 字符串：`url(data:image/jpeg;base64,...)` |
| `ptab_wallpaper_preview` | String | `null` | 首屏预览图。preload.js 优先读取，必须是 CSS-ready 字符串 |
| `ptab_ui` | JSON Object | 见下方结构 | 搜索栏、遮罩、图标等界面偏好 |
| `ptab_shortcuts` | JSON Object | 见下方结构 | 快捷方式模型：条目、最近访问、隐藏列表、面板设置 |
| `ptab_shortcut_icons` | JSON Object | `{}` | 快捷方式图标缓存，key 为快捷方式 ID |

#### `ptab_wallpaper`

```json
{
  "activeSource": "bing",
  "providers": {
    "bing": {
      "config": { "mkt": "auto" },
      "state": { "src": "", "date": "", "provider": "" }
    },
    "upload": {
      "config": { "rotation": "sequential" },
      "state": {}
    },
    "folder": {
      "config": { "pathLabel": "", "strategy": "random" },
      "state": {}
    },
    "rss": {
      "config": { "url": "", "strategy": "latest", "refreshIntervalMs": 300000 },
      "state": { "lastCheckedAt": 0, "lastSuccessAt": 0, "lastImageUrl": "", "lastError": "" }
    },
    "api": {
      "config": { "url": "", "jsonPath": "", "refreshIntervalMs": 300000 },
      "state": { "lastCheckedAt": 0, "lastSuccessAt": 0, "lastImageUrl": "", "lastError": "" }
    }
  },
  "cache": {
    "order": ["bing"],
    "index": 0,
    "meta": { "bing": {} }
  }
}
```

字段语义：

- `activeSource`：当前真正生效的壁纸源。允许值：`bing` / `upload` / `folder` / `rss` / `api`。
- `providers.*.config`：用户配置，切源不删除。例如 RSS URL、API URL、文件夹策略。
- `providers.*.state`：运行状态，失败和刷新信息存这里，不属于用户配置。
- `cache`：当前活跃源的缓存窗口。切源成功后重建；切源失败时不覆盖旧缓存。
- `cache.order` 使用逻辑 ID。Bing 恒为 `["bing"]`，API 恒为 `["api"]`，上传使用 `upload_<id>`，RSS 使用 `rss_<id>`，文件夹使用 `folder:<fileName>`。
- `cache.index` 替代旧 `ptab_local_index`，所有需要轮换的源共用。
- `cache.meta` 存轻量元数据，不存 Blob。

切换源时采用两阶段提交：

1. 用户在设置面板里修改草稿配置。
2. 面板关闭或用户提交时，目标 provider 先尝试准备一张可显示壁纸。
3. 成功后写入 `ptab_wallpaper`、`ptab_wallpaper_thumbs`、`ptab_wallpaper_preview`，再清理旧源大文件。
4. 首次启用 RSS/API/文件夹失败时，写入或保持 `activeSource = "bing"`，加载 Bing 兜底并轻提示用户。
5. 已经启用的 RSS/API 到期刷新失败时，只更新 `state.lastCheckedAt/lastError`，保持当前缓存，不自动切 Bing。

#### `ptab_ui`

```json
{
  "search": {
    "visibility": "always",
    "engine": "google",
    "position": "center",
    "radius": "capsule"
  },
  "wallpaper": {
    "overlayOpacity": 0,
    "themeEnabled": false
  },
  "icon": {
    "opacity": 0.45
  },
  "panel": {
    "opacity": 0.88
  }
}
```

#### `ptab_shortcuts`

```json
{
  "items": [],
  "recents": [],
  "hidden": [],
  "settings": {
    "primaryHotkey": "ctrl+k",
    "hiddenHotkey": "ctrl+shift+k",
    "recommendEnabled": true,
    "viewMode": "list"
  }
}
```

### IndexedDB（PlainTab，v1，store: wallpaper）

所有图片值统一为对象，最低字段为 `{blob: Blob, mime: String, name: String}`。允许附带 `source`、`id`、`src`、`createdAt` 等元数据，但业务逻辑不得依赖额外字段一定存在。

| Key | 数量 | 说明 |
|-----|------|------|
| `ptab_wallpaper_blob_bing` | 1 | Bing 兜底和 Bing 当前图 |
| `ptab_wallpaper_blob_api` | 1 | API 固定单图槽，URL 不变时复用 |
| `ptab_wallpaper_blob_upload_<id>` | ≤12 | 本地上传图片 |
| `ptab_wallpaper_blob_rss_<id>` | ≤12 | RSS 下载图片，超出窗口后按引用清理 |
| `ptab_wallpaper_folder_handle` | 1 | `FileSystemDirectoryHandle`，跨会话持久化 |
| `ptab_wallpaper_folder_files` | 1 | 排序后的文件名数组，单值一次 `put` |

删除旧 IDB key：

- `ptab_bing_blob`
- `ptab_img_<id>`（迁移为 `ptab_wallpaper_blob_upload_<id>` 后删除）

---

## 迁移链

```js
MIGRATIONS = {
    1: migrate_1_to_2,   // v3.0.4 → v3.1.4
    2: migrate_2_to_3    // v3.1.4 → v3.2.0
};
```

### MIGRATIONS[1]：v3.0.4 → v3.1.4

```
ls:  pt3_source           → ptab_mode              （值不变）
     __pt3_thumb          → ptab_bing_thumb        （去除 url() 包裹）
     pt3_search_mode      → ptab_search_mode
     pt3_lang             → ptab_lang
     pt3_opacity          → ptab_icon_opacity
     pt3_engine           → ptab_search_engine
     pt3_bing_url + date  → ptab_bing_meta         （合并）
新增: ptab_version、ptab_img_order、ptab_img_thumbs、ptab_local_index

IDB: PlainTabV3  bing_blob     → PlainTab  ptab_bing_blob
                 local_blob+mime → ptab_img_<id>[]
```

### MIGRATIONS[2]：v3.1.4 → v3.2.0

```
ls:
  ptab_version        → ptab_schema_version = 3
  ptab_lang           → ptab_locale

  ptab_mode           → ptab_wallpaper.activeSource
                         ('local' → 'upload')
  ptab_bing_meta      → ptab_wallpaper.providers.bing.state
  ptab_img_order      → ptab_wallpaper.cache.order
                         (local IDs → upload_<id>)
  ptab_local_index    → ptab_wallpaper.cache.index
  ptab_img_meta       → ptab_wallpaper.cache.meta
  ptab_img_thumbs     → ptab_wallpaper_thumbs
                         (local IDs → upload_<id>)
  ptab_bing_thumb     → ptab_wallpaper_thumbs["bing"]
                         (仅 activeSource 为 bing 时作为活跃缩略图)
  ptab_preview_thumb  → ptab_wallpaper_preview

  ptab_search_mode    → ptab_ui.search.visibility
  ptab_search_engine  → ptab_ui.search.engine
  ptab_icon_opacity   → ptab_ui.icon.opacity

新增默认:
  ptab_wallpaper.providers.folder/rss/api
  ptab_ui.search.position = "center"
  ptab_ui.search.radius = "capsule"
  ptab_ui.wallpaper.overlayOpacity = 0
  ptab_ui.wallpaper.themeEnabled = false
  ptab_ui.panel.opacity = 0.88
  ptab_shortcuts = {items: [], recents: [], hidden: [], settings: {...}}
  ptab_shortcut_icons = {}

清理旧 LS:
  ptab_version、ptab_mode、ptab_bing_thumb、ptab_bing_meta、
  ptab_img_order、ptab_img_thumbs、ptab_img_meta、ptab_local_index、
  ptab_preview_thumb、ptab_lang、ptab_search_mode、
  ptab_icon_opacity、ptab_search_engine

IDB:
  ptab_bing_blob      → ptab_wallpaper_blob_bing
  ptab_img_<id>       → ptab_wallpaper_blob_upload_<id>
```

迁移 preview 选择规则：

1. 如果 activeSource 是 `upload`，优先使用旧 `ptab_img_thumbs[oldOrder[index]]`。
2. 如果 activeSource 是 `bing`，优先使用旧 `ptab_preview_thumb`，再退回 `ptab_bing_thumb`。
3. 若没有可用缩略图，不写 `ptab_wallpaper_preview`，启动后由 Bing 兜底或当前源重新生成。

### 迁移链总结

| 产品版本 | stored | LS_VERSION | DB | 关键特征 |
|---------|--------|-----------|-----|---------|
| v3.0.4 | 0（无 key） | 无 | PlainTabV3 (v1) | `pt3_` 前缀，单图本地，8 ls key，8→6 映射 |
| v3.1.4 | 2 | 2 | PlainTab (v1) | `ptab_` 前缀，多图本地轮换，11 ls key，+5 新增 |
| v3.2.0 | 3 | 3 | PlainTab (v1) | 领域打包存储，Provider 框架，8 ls key，Bing/upload 先落地，folder/RSS/API 预留 |

v3.2.0 起优先读取 `ptab_schema_version`。如果不存在，则回退读取旧 `ptab_version`；v3.0.4 用户无版本 key 时，通过 `pt3_source` 指纹检测并设定 stored=1，然后依次执行 MIGRATIONS[1] + MIGRATIONS[2]。
