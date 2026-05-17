# 壁纸系统需求规格

## 行为概述

打开新标签页时，第一帧必须已有壁纸或内置渐变背景，不能出现白屏。实现方式是：`#wallpaperBack` 先出现在 DOM 中，随后同步执行 `js/preload.js`，只读取 `ptab_wallpaper_preview` 并写入背景；主运行时稍后再加载高清图和当前来源。

壁纸来源有五种：Bing 每日壁纸、本地上传、本地文件夹、RSS 订阅、API 端点。默认来源是 Bing。

### 来源切换交互

壁纸设置页不是“点选即生效”。当前实现采用草稿模型：

1. 用户在壁纸 tab 中选择来源或修改配置，只改变内存草稿。
2. 配置满足校验后，底部 `应用配置` 才可点击。
3. 点击 `应用配置` 成功后，才写入 `ptab_wallpaper` 并触发壁纸加载。
4. 关闭模态窗口会丢弃未应用草稿；不需要单独的“取消更改”按钮。

切换来源时，如果离开的旧来源不是 Bing 且存在缓存，应用前会确认“会丢弃当前来源已缓存的壁纸数据”。用户取消则不保存。Bing 缓存永远保留，作为所有来源失败时的兜底。

### 壁纸切换过程

高清图准备好后通过双层渲染切换：

- `#wallpaperBack` 保持当前可见图。
- `#wallpaperFront` 设置新图并淡入。
- 淡入完成后，front 的背景复制回 back，front 清空。
- 旧 Blob URL 在不再使用时释放。

过渡期间至少一层必须有内容。所有来源失败时回退内置深色渐变背景。

### 首次加载优先级

1. `preload.js` 同步读取 `ptab_wallpaper_preview`。
2. 主运行时读取当前 activeSource 的缓存或文件。
3. 当前来源失败时尝试当天 Bing 缓存。
4. Bing 缓存不可用时请求 Bing 网络图。
5. 以上都失败时保持现有背景或使用内置渐变。

`preload.js` 禁止访问 IndexedDB、fetch、canvas、`WallpaperData` 或 `showDirectoryPicker`。

## 各来源行为

### Bing 每日壁纸

Bing 通过两个镜像端点竞速获取 JSON，8 秒超时，先返回者胜出并取消另一路。图片 URL 变化时下载并写入 `ptab_wallpaper_blob_bing`；同一天 URL 不变时复用本地 Blob。

Bing 市场由当前界面语言映射决定，但只有在需要重新请求 Bing 时才使用新的语言市场；切换语言不会立即清空或强制刷新当天 Bing 缓存。

即使当前使用其他来源，运行时也会在后台尝试缓存当天 Bing，以保留兜底能力。

### 本地上传

用户通过一级面板的 `+` 上传图片，最多 12 张。上传成功时：

1. 原图写入 `ptab_wallpaper_blob_upload_<id>`。
2. ID 写入 `cache.order`。
3. 缩略图写入 `ptab_wallpaper_thumbs`。
4. 元数据写入 `cache.meta`。

上传图按 `cache.index` 顺序轮换，每打开新标签页推进一次。删除最后一张上传图时会切回 Bing。切换到 upload 来源并点击 `应用配置` 不会弹出文件选择器；用户仍需回到一级面板点 `+` 添加图片。

### 本地文件夹

文件夹模式使用 File System Access API 的 `showDirectoryPicker`。是否可用只按浏览器能力检测，不按操作系统判断；不支持时设置项置灰并提示。

支持格式：jpg、jpeg、png、webp、avif、gif、bmp。

文件夹只扫描所选目录第一层，不递归。文件名在该目录内唯一，因此逻辑 ID 为 `folder:<encodeURIComponent(fileName)>`。`pathLabel` 是浏览器提供的友好名称，不是完整真实路径。

轮换只支持随机洗牌袋：

- `strategy` 当前统一为 `shuffle`，旧值 `random` 只作为兼容别名。
- 从当前索引池生成 `shuffleBag`，一袋内每张最多出现一次。
- 袋子用完后基于当时的文件索引重新洗牌。

选择文件夹时只更新草稿和临时 mount，不立即保存。应用成功时必须按顺序完成：

1. 保存 `ptab_wallpaper_folder_handle`。
2. 保存首批 `ptab_wallpaper_folder_files`。
3. 写当前图缩略图、meta 和 `ptab_wallpaper_preview`。
4. 写 `providers.folder.config/state`，状态为 ready。
5. 写 `activeSource = "folder"` 并触发加载。

如果文件夹为空、无支持图片、权限被拒绝或首张可用图无法生成预览，应用按钮保持不可用或应用失败，旧壁纸保持不变。

每次打开新标签页：

- 先用 preview 首屏显示。
- 读取目录句柄和文件索引。
- 从 `shuffleBag` 取候选文件；读取成功并显示后才推进状态。
- 读取失败不推进；文件不存在则从索引、袋子和缩略图中移除再尝试下一张。
- 每个会话最多自动低频重扫一次；距离上次完整扫描超过 24 小时可在空闲阶段重扫。

文件夹图片不复制进浏览器存储，原图始终从磁盘读取。

### RSS 订阅

RSS 配置为 sources 列表，最多 5 个。默认内置 NASA APOD 和 Bing RSSHub。每个 source 包含 `id/name/url/builtIn/test`，新增 source 初始是未测试状态。RSS URL 只接受 HTTPS。

设置页显示红/绿连通性点：

- 未测试或测试失败为红点。
- 当前字段 hash 与最近一次成功测试一致时为绿点。
- 只有选中的 source 是绿点时，`应用配置` 才可用。

测试 RSS 只验证 feed 可拉取、可解析并能提取图片条目；它不下载并缓存整批壁纸。应用成功后，运行时按刷新节奏拉取 feed，下载最多 12 张图片，生成缩略图并写入 `ptab_wallpaper_blob_rss_<id>`。

提取来源包括 `enclosure`、`media:content/media:thumbnail`、`description`、`content:encoded`、`summary` 中的图片。缓存按发布时间倒序保留最多 12 张；旧 RSS Blob 按引用清理。

刷新间隔：关闭、1 天、3 天、7 天。关闭时不自动刷新；没有成功缓存时会强制尝试一次。

RSS 可显示图片摘要覆盖层，支持顶部/底部、展开条带/i 按钮，以及是否显示正文链接。

### API 端点

API 配置分为互斥的两类横向 tab：

- `image`：图片直链或会重定向到图片的 GET 接口。响应最终必须是 `image/*`。
- `json`：返回 JSON 的 GET 接口，再通过 JSON 路径或自动字段探测找到图片 URL。

每类最多保存 5 个 source，分别使用 `imageSources` 和 `jsonSources`，活跃项分别为 `activeImageSourceId` / `activeJsonSourceId`。当前实际生效类型是 `apiType: "image" | "json"`。

JSON 路径支持点号和数组索引，例如 `data.image.url` 或 `items[0].url`。如果路径为空或取值失败，会尝试常见字段：`url`、`imageUrl`、`image_url`、`src`、`image`、`wallpaper`。

API 只支持 HTTPS GET。当前版本没有 header/body/token 管理；401/403 会提示该接口可能需要鉴权，建议只能使用把 token 放在 URL 参数里的 GET 接口。

API 测试会真实请求接口并下载图片，成功后保存测试结果到草稿内存。点击 `应用配置` 时，如果仍有本次测试结果，会复用该 Blob 写入 `ptab_wallpaper_blob_api`，并更新缩略图、preview、meta 和运行态；不会立刻重新请求一次。没有本次测试 Blob 但 source 的测试状态仍为绿色时，应用保存配置，运行时按刷新节奏请求。

API 模式运行时只保留一张图，逻辑 ID 固定为 `api`，新结果会替换旧 `ptab_wallpaper_blob_api`。

刷新间隔：关闭、每次打开、1 天、3 天、7 天。默认 1 天。

## 数据与缓存

### 统一模型

`ptab_wallpaper` 使用 provider 模型：

```js
{
  activeSource: "bing|upload|folder|rss|api",
  providers: {
    bing: { config: { mkt: "auto" }, state: { src: "", date: "", provider: "" } },
    upload: { config: { rotation: "sequential" }, state: {} },
    folder: { config: { pathLabel: "", strategy: "shuffle" }, state: {} },
    rss: { config: { sources: [], activeSourceId: "", refreshIntervalMs: 86400000 }, state: {} },
    api: { config: { apiType: "image", imageSources: [], jsonSources: [] }, state: {} }
  },
  cache: { order: ["bing"], index: 0, meta: { bing: {} } }
}
```

### 常用逻辑 ID

| 来源 | 逻辑 ID |
|------|---------|
| Bing | `bing` |
| API | `api` |
| Upload | `upload_<id>` |
| RSS | `rss_<hash>` |
| Folder | `folder:<encodedName>` |

### 首屏与缩略图 key

| Key | 用途 |
|-----|------|
| `ptab_wallpaper_preview` | 首屏唯一同步读取的预览图 |
| `ptab_wallpaper_thumbs` | 普通缩略图池 |
| `ptab_wallpaper_blur_thumbs` | 指定 blur 强度的模糊缩略图池 |

背景模糊不使用全屏实时 CSS `filter: blur(...)` 作为热路径。强模糊必须优先使用预生成模糊缩略图；拖动滑块时要防止过期异步结果覆盖最新值。

### 主题色引擎

主题色提取属于非首屏任务，必须继续在壁纸显示后的运行时/空闲阶段执行。当前实现优先懒加载 `js/wallpaper/theme_engine.wasm`，由 `wasm/theme_engine.cpp` 编译生成；C++/WASM 只负责像素分析、空间/颜色质量加权、颜色量化、调色板候选与 Top 色统计，DOM、Canvas 读取、CSS 变量应用仍留在 `js/wallpaper/theme.js`。

WASM 加载、编译或执行失败时必须回退到 JS 路径，不得影响壁纸显示和新标签页可用性。扩展页 CSP 需要保留 `script-src 'self' 'wasm-unsafe-eval'`；独立 `file://` 打开时如果浏览器拒绝 fetch 本地 wasm，也必须继续使用 JS fallback。

## 约束清单

### 首屏与渲染

- `#wallpaperBack` 必须先于 `js/preload.js` 存在。
- `js/preload.js` 必须同步、短小，只读 `ptab_wallpaper_preview`。
- 壁纸切换只动画 `opacity`，不得在过渡中清空两层。
- 生成缩略图、模糊缩略图、主题色提取等非首屏任务应放在运行时或空闲阶段。

### 来源应用

- 壁纸 tab 的 source drawer 只修改草稿。
- `应用配置` 只有在有有效更改并通过当前来源校验时可点。
- 从 Bing 切到任何来源不提示清缓存；从其他有缓存来源切走必须提示。
- 应用失败不得覆盖旧 activeSource 或清空当前可见壁纸。
- 切换成功后清理旧来源缓存，但保留旧来源配置和测试状态。

### 网络失败

| 来源 | 失败行为 |
|------|----------|
| Bing | 保持当前图；可用时使用当天/昨日本地缓存 |
| Upload | 使用已缓存原图；完全离线可用 |
| Folder | 图片在本地磁盘，网络无关；权限或文件丢失时保留 preview 并提示 |
| RSS | 使用已下载缓存；刷新失败只写 state.lastError |
| API | 使用上次 `api` 缓存；刷新失败只写 state.lastError |

### 大文件 key

| Key | 值格式 | 来源 |
|-----|--------|------|
| `ptab_wallpaper_blob_bing` | `{ blob, mime, name }` | Bing |
| `ptab_wallpaper_blob_api` | `{ blob, mime, name }` | API |
| `ptab_wallpaper_blob_upload_<id>` | `{ blob, mime, name }` | Upload |
| `ptab_wallpaper_blob_rss_<id>` | `{ blob, mime, name }` | RSS |
| `ptab_wallpaper_folder_handle` | `FileSystemDirectoryHandle` | Folder |
| `ptab_wallpaper_folder_files` | `[{ name, size, lastModified }, ...]` | Folder |
