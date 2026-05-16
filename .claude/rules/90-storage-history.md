# 存储格式版本变迁

本文档记录 PlainTab 各发布版本中 localStorage 和 IndexedDB 的完整数据格式及变更，为迁移逻辑提供依据。

## 版本总览

| 产品版本 | LS_VERSION | DB | localStorage key 数 |
|---------|-----------|-----|-------------------|
| v3.0.4 | 无（通过 `pt3_` 前缀检测） | PlainTabV3 (v1) | 8 |
| v3.1.4 | 2 | PlainTab (v1) | 11 |
| v3.2.0 | 3 | PlainTab (v1) | 23 |

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

v3.1.4 壁纸系统只有两模式（Bing / 本地），各自有独立 key（`ptab_bing_*` / `ptab_img_*`）。扩展新壁纸源（RSS / API / 文件夹）必须新增更多独立 key，存储碎片化。

v3.2.0 引入 **统一 Provider 架构**——五种壁纸源（Bing / 上传 / 文件夹 / RSS / API）共用同一套 key，切源时清空数据区但保留配置。同时新增了命令面板、3 个界面微调设置。

### 变更汇总（v3.1.4 → v3.2.0）

| 状态 | 数量 | Keys |
|------|------|------|
| 🟢 新增 | 15 | `ptab_wp_source`、`ptab_wp_config`、`ptab_preview_thumb`、`ptab_img_meta`、`ptab_search_position`、`ptab_overlay_opacity`、`ptab_search_radius`、`ptab_shortcuts`、`ptab_shortcut_icons`、`ptab_shortcut_recents`、`ptab_shortcut_hidden`、`ptab_shortcut_hotkey`、`ptab_shortcut_hidden_hotkey`、`ptab_shortcut_recommend`、`ptab_shortcut_view` |
| 🔴 删除 | 3 | `ptab_mode`（值映射入 `ptab_wp_source`，`'local'`→`'upload'`）、`ptab_bing_thumb`（合并入 `ptab_img_thumbs["bing"]`）、`ptab_bing_meta`（合并入 `ptab_img_meta["bing"]`） |
| 🟡 语义扩展 | 4 | `ptab_img_order`（仅本地 → 所有源）、`ptab_img_thumbs`（仅本地 → 所有源）、`ptab_img_meta`（仅本地 → 所有源）、`ptab_local_index`（仅本地 → 所有源） |
| ⬜ 不变 | 7 | `ptab_version`（值 2→3）、`ptab_lang`、`ptab_search_mode`、`ptab_icon_opacity`、`ptab_search_engine` |

净效果：11 → 23（删 3 旧，增 15 新，扩展 4 语义，7 不动）。

### localStorage（23 个 key）

#### 一、壁纸系统（8 个 key）

| Key | 类型 | 默认值 | 变更 | 说明 |
|-----|------|--------|------|------|
| `ptab_wp_source` | String | `'bing'` | 🟢 新增 | 当前壁纸源：`bing` / `upload` / `folder` / `rss` / `api` |
| `ptab_wp_config` | JSON | `{}` | 🟢 新增 | 各源配置快照，切源不丢：`{bing:{mkt}, upload:{}, folder:{path,strategy}, rss:{url,strategy}, api:{url,jsonPath}}` |
| `ptab_img_order` | JSON Array | `[]` | 🟡 语义扩展 | 所有源共用。bing/api 恒为 `["bing"]`/`["api"]`，upload/rss ≤12，folder 12 个文件名（滑动窗口） |
| `ptab_img_thumbs` | JSON | `{}` | 🟡 语义扩展 | `{id: "data:image/jpeg;base64,..."}`。原先仅本地，现所有源共用。folder 模式 ≤12（key=文件名） |
| `ptab_img_meta` | JSON | `{}` | 🟢 新增 | `{id: {name, size, ...}}`。所有源共用 |
| `ptab_local_index` | Number | `0` | 🟡 语义扩展 | 原先仅本地轮换，现所有源共用。bing/api 恒为 0 |
| `ptab_preview_thumb` | String | `null` | 🟢 新增 | 下一张壁纸预计算缩略图，preload.js 优先读取 |
| `ptab_version` | Number | `3` | 🟡 值变更 | `2` → `3` |

#### 二、语言（1 个 key）— 不变

| Key | 类型 | 默认值 | 变更 |
|-----|------|--------|------|
| `ptab_lang` | String | 自动检测 | ⬜ 不变 |

#### 三、搜索 & 界面（6 个 key）

| Key | 类型 | 默认值 | 变更 | 说明 |
|-----|------|--------|------|------|
| `ptab_search_mode` | String | `'always'` | ⬜ 不变 | `'always'` / `'hover'` / `'never'` |
| `ptab_icon_opacity` | Number | `0.45` | ⬜ 不变 | 图标透明度 0~1 |
| `ptab_search_engine` | String | `'google'` | ⬜ 不变 | 扩展模式强制浏览器默认引擎 |
| `ptab_search_position` | String | `'center'` | 🟢 新增 | `'top'` / `'upper'` / `'center'` / `'lower'` / `'bottom'` |
| `ptab_overlay_opacity` | Number | `0` | 🟢 新增 | 壁纸遮罩不透明度 0~0.6 |
| `ptab_search_radius` | String | `'capsule'` | 🟢 新增 | `'capsule'`(28px) / `'rounded'`(12px) / `'sharp'`(4px) |

#### 四、命令面板（8 个 key）— 全部新增

| Key | 类型 | 默认值 | 变更 |
|-----|------|--------|------|
| `ptab_shortcuts` | JSON Array | `[]` | 🟢 新增 |
| `ptab_shortcut_icons` | JSON | `{}` | 🟢 新增 |
| `ptab_shortcut_recents` | JSON Array | `[]` | 🟢 新增 |
| `ptab_shortcut_hidden` | JSON Array | `[]` | 🟢 新增 |
| `ptab_shortcut_hotkey` | String | `'ctrl+k'` | 🟢 新增 |
| `ptab_shortcut_hidden_hotkey` | String | `'ctrl+shift+k'` | 🟢 新增 |
| `ptab_shortcut_recommend` | String | `'true'` | 🟢 新增 |
| `ptab_shortcut_view` | String | `'list'` | 🟢 新增 |

### IndexedDB（PlainTab，v1，store: wallpaper）

所有源统一值格式 `{blob: Blob, mime: String, name: String}`。

| Key | 数量 | 变更 | 说明 |
|-----|------|------|------|
| `ptab_img_bing` | 1 | 🟡 重命名 + 值升级 | 旧 `ptab_bing_blob` 重命名。旧值可能是裸 Blob，迁移时升级为 `{blob, mime, name}` |
| `ptab_img_api` | 1 | 🟢 新增 | API 模式壁纸 |
| `ptab_img_<id>` | ≤12 张 | ⬜ 保留 | upload 模式 ≤12 张，rss 模式 ≤12 张 |
| `ptab_bing_blob` | — | 🔴 删除 | 重命名为 `ptab_img_bing` 后删除旧 key |
| `ptab_folder_handle` | 1 | 🟢 新增 | 文件夹目录句柄（`FileSystemDirectoryHandle`），跨会话持久化 |
| `ptab_folder_files` | 1 | 🟢 新增 | 排序后全量文件名数组（`["a.jpg","b.png",...]`），单值一次 `put` |

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
ls:  ptab_mode             → ptab_wp_source        （'local'→'upload'）
     ptab_bing_thumb       → ptab_img_thumbs["bing"]（合并入统一池）
     ptab_bing_meta        → ptab_img_meta["bing"]  （合并入统一池）
新增: ptab_wp_config       = {}                    （空壳初始化）
新增: ptab_preview_thumb、ptab_img_meta
新增: ptab_search_position = 'center'              （默认值）
新增: ptab_overlay_opacity = 0
新增: ptab_search_radius   = 'capsule'
新增: 8 个命令面板 key（ptab_shortcuts 等，默认值写入）
清理: ptab_mode、ptab_bing_thumb、ptab_bing_meta

IDB: ptab_bing_blob        → ptab_img_bing         （重命名 + 值升级）
新增: ptab_img_api (按需，迁移时不创建)
```

### 迁移链总结

| 产品版本 | stored | LS_VERSION | DB | 关键特征 |
|---------|--------|-----------|-----|---------|
| v3.0.4 | 0（无 key） | 无 | PlainTabV3 (v1) | `pt3_` 前缀，单图本地，8 ls key，8→6 映射 |
| v3.1.4 | 2 | 2 | PlainTab (v1) | `ptab_` 前缀，多图本地轮换，11 ls key，+5 新增 |
| v3.2.0 | 3 | 3 | PlainTab (v1) | 统一 Provider，五壁纸源 + 命令面板，23 ls key，+15 新增 -3 废弃 |

v3.0.4 用户无 `ptab_version` key → `migrateStorage()` 通过 `pt3_source` 指纹检测 → 设定 stored=1 → 依次执行 MIGRATIONS[1] + MIGRATIONS[2]。
