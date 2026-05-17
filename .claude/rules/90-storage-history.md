# 存储格式版本变迁

本文记录 PlainTab localStorage 和 IndexedDB 结构历史，为迁移和兼容判断提供参考。新代码应优先遵守 `10-storage.md` 和 `js/wallpaper/data.js`。

## 版本总览

| 产品阶段 | 存储版本 | DB | localStorage key 数 | 说明 |
|---------|----------|----|---------------------|------|
| v3.0.4 | 无明确 schema；旧代码读 `ptab_version` 得 0 | `PlainTabV3` v1 | 8 | `pt3_` 分散 key，本地壁纸单图 |
| v3.1.4 | `ptab_version = 2` | `PlainTab` v1 | 11 | 多图本地上传，仍是分散 key |
| v3.2.0 baseline | `ptab_schema_version = 3` | `PlainTab` v1 | 9 | 领域打包模型，五种壁纸来源 |

当前 `data.js` 中的 `migrate()` 只确保 baseline schema version；历史迁移映射保留在本文中作参考，不代表当前存在完整 `MIGRATIONS` 对象。

---

## v3.0.4（历史）

### localStorage

| Key | 内容 |
|-----|------|
| `__pt3_thumb` | Bing 缩略图，`url(data:image/...)` |
| `pt3_lang` | 语言代码 |
| `pt3_source` | `'bing'` / `'local'` |
| `pt3_search_mode` | `'always'` / `'hover'` / `'never'` |
| `pt3_opacity` | 图标透明度 |
| `pt3_engine` | 搜索引擎 |
| `pt3_bing_url` | Bing 图片 URL |
| `pt3_bing_date` | Bing 缓存日期 |

### IndexedDB

DB：`PlainTabV3` v1，store：`wallpaper`

| Key | 内容 |
|-----|------|
| `bing_blob` | Bing 原图 Blob |
| `bing_date` | Bing 日期 |
| `local_blob` | 本地单图 Blob |
| `local_mime` | 本地图 MIME |

---

## v3.1.4（历史）

### localStorage

| Key | 内容 |
|-----|------|
| `ptab_version` | `2` |
| `ptab_mode` | `'bing'` / `'local'` |
| `ptab_bing_thumb` | Bing 缩略图 |
| `ptab_bing_meta` | `{ src, date, provider }` |
| `ptab_img_order` | 本地图片 ID 列表 |
| `ptab_img_thumbs` | 本地图片缩略图字典 |
| `ptab_local_index` | 本地轮换索引 |
| `ptab_lang` | 语言代码 |
| `ptab_search_mode` | 搜索栏显示模式 |
| `ptab_icon_opacity` | 图标透明度 |
| `ptab_search_engine` | 搜索引擎 |

不同历史构建中可能额外存在 `ptab_img_meta` 和 `ptab_preview_thumb`；迁移兼容时应按实际用户数据容错读取。

### IndexedDB

DB：`PlainTab` v1，store：`wallpaper`

| Key | 内容 |
|-----|------|
| `ptab_bing_blob` | `{ blob, mime, name }` |
| `ptab_img_<id>` | 本地上传图片 `{ blob, mime, name }` |

---

## v3.2.0 baseline（当前实现）

### 变更动因

v3.2 将分散 key 改为领域打包：

- `ptab_wallpaper_preview` 单独作为首屏热路径 key。
- `ptab_wallpaper` 保存 provider 配置、运行态和缓存索引。
- 缩略图、模糊缩略图、快捷方式图标单独存，避免小配置读取时解析大对象。
- UI 偏好和快捷方式模型各自打包。

### localStorage（9 个 key）

| Key | 类型 | 说明 |
|-----|------|------|
| `ptab_schema_version` | Number | 当前为 `3` |
| `ptab_locale` | String | 用户界面语言 |
| `ptab_wallpaper` | JSON Object | 壁纸主模型 |
| `ptab_wallpaper_thumbs` | JSON Object | 普通缩略图池 |
| `ptab_wallpaper_blur_thumbs` | JSON Object | 模糊缩略图池 |
| `ptab_wallpaper_preview` | String | 首屏预览图，CSS-ready |
| `ptab_ui` | JSON Object | 界面偏好 |
| `ptab_shortcuts` | JSON Object | 快捷方式模型 |
| `ptab_shortcut_icons` | JSON Object | 快捷方式图标缓存 |

### `ptab_wallpaper`

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
      "config": { "pathLabel": "", "strategy": "shuffle" },
      "state": {
        "status": "idle",
        "indexedCount": 0,
        "completed": false,
        "lastScanAt": 0,
        "lastError": "",
        "shuffleBag": [],
        "currentName": ""
      }
    },
    "rss": {
      "config": {
        "sources": [
          { "id": "nasa-apod", "name": "NASA APOD", "url": "https://apod.nasa.gov/apod.rss", "builtIn": true },
          { "id": "bing-rsshub", "name": "Bing", "url": "https://rsshub.app/bing", "builtIn": true }
        ],
        "activeSourceId": "nasa-apod",
        "refreshIntervalMs": 86400000,
        "showSummary": true,
        "showLink": true,
        "summaryPosition": "bottom",
        "summaryMode": "expanded"
      },
      "state": {
        "lastCheckedAt": 0,
        "lastSuccessAt": 0,
        "lastImageUrl": "",
        "lastError": "",
        "lastTestAt": 0,
        "lastTestMessage": ""
      }
    },
    "api": {
      "config": {
        "apiType": "image",
        "activeImageSourceId": "",
        "activeJsonSourceId": "",
        "refreshIntervalMs": 86400000,
        "imageSources": [],
        "jsonSources": []
      },
      "state": {
        "lastCheckedAt": 0,
        "lastSuccessAt": 0,
        "lastError": "",
        "lastSourceId": "",
        "lastImageUrl": ""
      }
    }
  },
  "cache": {
    "order": ["bing"],
    "index": 0,
    "meta": { "bing": {} }
  }
}
```

#### Source test 结构

RSS/API source 都使用相同测试结构：

```json
{
  "test": {
    "status": "untested",
    "fieldHash": "",
    "testedAt": 0,
    "imageUrl": "",
    "error": ""
  }
}
```

只有 `status = "passed"` 且 `fieldHash` 等于当前字段 hash，UI 才显示绿点。

#### cache ID 约定

| 来源 | cache/order/meta ID |
|------|---------------------|
| Bing | `bing` |
| API | `api` |
| Upload | `upload_<id>` |
| RSS | `rss_<hash>` |
| Folder | `folder:<encodeURIComponent(fileName)>` |

`cache.order` 是当前活跃缓存窗口。Bing 常见为 `["bing"]`；API 常见为 `["api"]`；RSS 为 active source 的 `rss_<id>` 列表；Upload 为上传图 ID；Folder 运行时主要依赖 `providers.folder.state` 和 `ptab_wallpaper_folder_files`，但缩略图/meta 使用 `folder:<encodedName>`。

### `ptab_ui`

```json
{
  "search": {
    "visibility": "always",
    "engine": "google",
    "position": "center",
    "align": "center",
    "iconPosition": "right",
    "radius": "capsule",
    "width": 560,
    "backgroundOpacity": 0.1,
    "blur": 24
  },
  "wallpaper": {
    "overlayOpacity": 0,
    "themeEnabled": false,
    "fit": "cover",
    "position": "center",
    "blur": 0
  },
  "appearance": {
    "radius": "soft"
  },
  "icon": {
    "opacity": 0.45
  },
  "panel": {
    "opacity": 0.88
  }
}
```

### `ptab_shortcuts`

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

### IndexedDB（当前）

DB：`PlainTab` v1，store：`wallpaper`

| Key | 数量 | 说明 |
|-----|------|------|
| `ptab_wallpaper_blob_bing` | 1 | Bing 兜底和当前 Bing 图 |
| `ptab_wallpaper_blob_api` | 1 | API 固定单图槽 |
| `ptab_wallpaper_blob_upload_<id>` | ≤12 | 本地上传图片 |
| `ptab_wallpaper_blob_rss_<id>` | ≤12 活跃缓存 | RSS 下载图片 |
| `ptab_wallpaper_folder_handle` | 1 | `FileSystemDirectoryHandle` |
| `ptab_wallpaper_folder_files` | 1 | `[{ name, size, lastModified }, ...]` |

所有图片值最低兼容 `{ blob, mime, name }`；可附带 `source/id/src/createdAt` 等元数据，但业务逻辑不得依赖这些额外字段一定存在。

---

## 历史迁移参考

如果未来重新实现完整旧版本迁移，可参考以下映射。

### v3.0.4 → v3.1.4

```text
pt3_source            → ptab_mode
__pt3_thumb           → ptab_bing_thumb
pt3_lang              → ptab_lang
pt3_search_mode       → ptab_search_mode
pt3_opacity           → ptab_icon_opacity
pt3_engine            → ptab_search_engine
pt3_bing_url/date     → ptab_bing_meta

PlainTabV3/bing_blob  → PlainTab/ptab_bing_blob
PlainTabV3/local_blob → PlainTab/ptab_img_<id>
```

### v3.1.4 → v3.2.0

```text
ptab_version       → ptab_schema_version = 3
ptab_lang          → ptab_locale
ptab_mode          → ptab_wallpaper.activeSource
                      local → upload
ptab_bing_meta     → ptab_wallpaper.providers.bing.state
ptab_img_order     → ptab_wallpaper.cache.order
                      local IDs → upload_<id>
ptab_local_index   → ptab_wallpaper.cache.index
ptab_img_meta      → ptab_wallpaper.cache.meta
ptab_img_thumbs    → ptab_wallpaper_thumbs
ptab_preview_thumb → ptab_wallpaper_preview
ptab_search_mode   → ptab_ui.search.visibility
ptab_search_engine → ptab_ui.search.engine
ptab_icon_opacity  → ptab_ui.icon.opacity

ptab_bing_blob     → ptab_wallpaper_blob_bing
ptab_img_<id>      → ptab_wallpaper_blob_upload_<id>
```

迁移 preview 选择建议：

1. activeSource 为 upload 时，优先使用旧 order 当前索引对应缩略图。
2. activeSource 为 Bing 时，优先使用旧 preview，再退回 Bing 缩略图。
3. 没有可用缩略图时不写 preview，由启动流程回退 Bing 或渐变。
