# PlainTab 需求文档

## 一、项目定位

Chrome/Edge 浏览器新标签页扩展（Manifest V3），同时支持 Netlify/GitHub Pages 独立网页部署。零依赖、无构建、纯 vanilla JS + CSS。

**核心体验目标**：打开新标签页的瞬间永远不出现白屏或灰底，始终有壁纸占据全屏。

---

## 二、已实现功能

### 2.1 壁纸系统

| 功能 | 状态 | 说明 |
|------|------|------|
| Bing 每日壁纸 | ✅ | 双 API 并发竞速（`Promise.any` + 8s `AbortController` 超时），按语言区域获取 |
| Bing 去重缓存 | ✅ | URL + 日期双重判断，同一天同 URL 不重复下载 blob，IDB 丢数据时回退下载 |
| 本地上传壁纸 | ✅ | 支持单张/批量（input multiple），同名+同大小去重，上限 12 张 |
| 本地壁纸轮播 | ✅ | 每次新标签页递增 `ptab_local_index`，取对应壁纸，循环 |
| 双层零闪切换 | ✅ | `#wallpaperBack` 始终有图，`#wallpaperFront` 做 CSS opacity 淡入过渡，过渡完成后稳定到 back 层 |
| 首帧缩略图 | ✅ | `preload.js` 同步读取 localStorage 缩略图写入 back 层，浏览器首帧前完成 |
| 缩略图持久化 | ✅ | Bing 存为 `bing_thumb`，本地存为 `local_thumbs` 数组，索引与 IDB blob 数组对齐 |
| 本地画廊 | ✅ | 3×4 网格，使用 base64 缩略图（非 blob URL），满 12 张隐藏 ➕ 按钮 |

### 2.2 搜索

| 功能 | 状态 | 说明 |
|------|------|------|
| 多引擎搜索 | ✅ | Google / Bing / Baidu / DuckDuckGo，仅网页模式可用 |
| 搜索栏显隐 | ✅ | 悬停显示 / 始终显示 / 隐藏 |
| CWS 合规 | ✅ | 扩展模式下使用 `chrome.search.query()`，隐藏引擎选择，遵循 Chrome Web Store 单一用途政策 |

### 2.3 国际化

| 功能 | 状态 | 说明 |
|------|------|------|
| 16 语言支持 | ✅ | `js/languages.js` + Chrome `_locales/` 双系统 |
| 语言自动检测 | ✅ | 扩展模式读 `chrome.i18n.getUILanguage()`，网页模式读 `navigator.language` |

### 2.4 UI

| 功能 | 状态 | 说明 |
|------|------|------|
| 右上角角落按钮 | ✅ | 设置/语言切换，鼠标移入显示，移出延迟隐藏 |
| 设置面板 | ✅ | 壁纸模式、本地上传/画廊、重置 Bing、高级搜索设置 |
| 图标不透明度 | ✅ | 滑块 + 数字输入联动 |
| 暗色模式 | ✅ | `prefers-color-scheme` 自适应 |

---

## 三、存储设计

### 3.1 localStorage

| 键 | 类型 | 用途 |
|----|------|------|
| `bing_thumb` | string | Bing 当前壁纸缩略图，CSS 格式 `url(data:image/jpeg;base64,...)` |
| `local_thumbs` | JSON array | 本地壁纸缩略图数组，索引与 IDB `local_images` 对齐 |
| `ptab_local_index` | string→int | 本地壁纸轮播指针，每次新标签页递增 |
| `ptab_wallpaper_source` | `'bing'` / `'local'` | 当前壁纸模式 |
| `ptab_bing_meta` | JSON | `{src, date, provider}`，Bing 去重 + 新鲜度 |
| `ptab_lang` | string | 语言代码 |
| `ptab_search_visibility` | `'always'` / `'hover'` / `'never'` | 搜索栏显隐模式 |
| `ptab_icon_opacity` | float string | 图标不透明度 |
| `ptab_search_engine` | string | 搜索引擎 |

### 3.2 IndexedDB

数据库 `PlainTab` v1，store `wallpaper`。

| 键 | 类型 | 用途 |
|----|------|------|
| `bing` | Blob | Bing 今日壁纸原图 |
| `local_images` | Array of `{id, blob, mime, name}` | 本地壁纸集合，最多 12 个 |

### 3.3 数据一致性约束

- `local_images[i].blob` ←→ `local_thumbs[i]` 索引严格对齐
- 上传时 blob 写入 IDB 和缩略图写入 localStorage 在同一个 Promise 链中，但分属两个存储系统无法原子操作。写 IDB 在前，写 localStorage 在后，崩溃时缩略图可能缺失，下次轮播触发自愈补充
- 删除时同步 `splice` 两端数组，最后一个元素删除时清空两个数组

---

## 四、架构约束

- **文件加载顺序**：`preload.js` → `languages.js` → `newtab.js`，不可改变
- **双运行时**：`typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id` 判断扩展/网页模式
- **CORS**：Bing 图片下载需 CORS 模式才能存入 IDB
- **Blob MIME**：IDB 取出的 blob 可能丢失 MIME type，存时记录 `mime` 字段恢复
- **扩展权限**：仅 `search` 一个权限

---

## 五、已知局限（待决策）

| 编号 | 问题 | 影响 | 可能的方案 |
|------|------|------|-----------|
| L-01 | 缩略图与 blob 不原子存储 | 崩溃时 `local_thumbs` 可能少一项，轮播到该位置回退 `bing_thumb` | 把缩略图也存入 IDB 同一对象（但 preload.js 拿不到） |
| L-02 | 单张缩略图 `bing_thumb` 问题 | Bing 和本地共用 `bing_thumb` 作为 fallback，含义不纯粹 | 可以接受，preload.js 主路径已经按模式区分 |
| L-03 | 画廊 blob URL 降级路径 | 旧数据没有 `local_thumbs` 时回退 blob URL | 自愈会逐步补齐，属于过渡期问题 |
| L-04 | 12 张限制仅 UI 控制 | 如果绕过 UI 直接调函数可能超限 | 实际无法触发（file input 是唯一入口，按钮隐藏后点不到） |

---

## 六、迭代历史

### 2026-05（v3.1.2）

- **葡萄牙语 locale 修正**：`_locales/pt` → `pt_BR`，Chrome 只识别带地区后缀的 locale 目录名
- **changelog 格式统一**：16 语言全面改为紧凑单行 `• vX.Y.Z · ...` 风格
- **文档结构重组**：全部文档迁入 `docs/`，`changelog/` → `docs/changelog-i18n/`，CWS 描述拆分为 `docs/store-listing/` 各语言独立文件
- **文件重命名**：`REQUIREMENTS.md` → `docs/requirements.md`，`技术文档.md` → `docs/architecture.md`，`RELEASE_NOTE.md` → `docs/release-note.md`，`CHANGELOG.md` → `docs/changelog.md`

### 2026-05（v3.1.1）

- **Bing API 并发竞速**：从串行主备回退改为 `Promise.any` 同时请求两个端点，谁快用谁，消除不可达端点的等待
- **AbortController 超时**：每个 API 请求 8 秒上限，干净中止落后连接，不再依赖 OS 层 TCP 超时
- **16 语言 README 更新**：同步刷新竞速模式描述和技术条目列表

### 2026-05（v3.1.0）

- **多图本地上传 + 轮播**：从单张本地壁纸重构为最多 12 张，支持批量导入（多选 / 去重 / 12-N 上限）
- **N 张缩略图持久化**：`local_thumbs` 数组与 `local_images` 索引对齐，画廊优先使用 base64 缩略图（不再创建 blob URL）
- **存储键重命名**：`ptab_thumb` → `bing_thumb`，`ptab_thumbs` → `local_thumbs`
- **12 张上限 UI 控制**：满 12 张画廊中隐藏 ➕ 按钮，无需 alert
- **Bing 缓存优化**：URL 不变时跳过 blob 下载，Blob 丢了才回退下载
- **Bug 修复**：缩略图生成 `resolve()` 漏传值导致入库静默失败；去重检查先于展示避免闪图
- **项目文档**：CLAUDE.md 函数索引 + CSS 架构 + 已知坑位、requirements.md 需求文档、architecture.md 技术文档、memory 系统记忆

### 下一步可选

- 缩略图与 blob 合并存入 IDB 同一对象（解决两套存储无法原子写入的问题）
- 本地壁纸的排序 / 拖拽重排
- 壁纸信息展示（文件名、尺寸、大小）
- 预加载优化（下张轮播壁纸提前生成缩略图）

### 已知坑位

- `saveLocalImage` 中 IDB 写入和 `local_thumbs` 写入不在同一个事务，崩溃可能导致缩略图少一项。自愈逻辑有长度校验，崩溃场景下不触发（长度不匹配），该缩略图永久缺失直到该位置被轮播到并重新生成
- 批量导入时 `_uploadKeepOpen` 是模块级变量，多次快速操作理论上可能竞态（实际很难触发）

---

## 七、提交规范

Conventional Commits：`feat:` / `fix:` / `chore:` / `docs:` / `refactor:` / `style:`

---

> 此文档由 Claude Code 与维护者协作维护，随项目演进持续更新。
