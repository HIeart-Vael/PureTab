# PlainTab JS 架构分析

> 自动生成，仅用于代码解读参考。不参与构建、不参与运行时。

---

## 文件总览

| 文件 | 行数 | 挂载 | 角色 |
|------|------|------|------|
| `js/preload.js` | 26 | — | 首帧壁纸渲染，零白屏核心 |
| `js/languages.js` | 524 | `window.I18N`, `window.LanguageList` | 翻译表 + 语言列表 |
| `js/wallpaper/data.js` | 309 | `window.WallpaperData` | 存储层，所有 LS + IDB 读写入口 |
| `js/wallpaper/fetch.js` | 111 | `window.WallpaperFetch` | Bing 壁纸获取 + Blob 缓存 |
| `js/wallpaper/show.js` | 146 | `window.WallpaperShow` | 双图层淡入渲染 + 缩略图生成 |
| `js/palette.js` | 1413 | `window.Palette` | 命令面板，完全独立模块 |
| `js/newtab.js` | 1067 | — | 主控中心，编排所有模块 |

---

## 各文件逐函数说明

### 1. `preload.js` — 首帧壁纸

整个 IIFE，无具名函数。

1. 优先读 `ptab_preview_thumb`（跨会话预计算缓存）
2. 未命中 → 回退读 `ptab_bing_thumb`
3. 本地模式 → 根据 `ptab_local_index` + `ptab_img_order` + `ptab_img_thumbs` 取缩略图
4. 写入 `#wallpaperBack.style.backgroundImage`

### 2. `languages.js` — 翻译表

- `window.I18N`：16 语言 × 45 基础 key 字典
- 末尾 IIFE：将命令面板 ~50 个新增 key 合并进每种语言
- `window.LanguageList`：`[{code, name}, ...]` 数组

### 3. `wallpaper/data.js` — 存储层

| 函数 | 功能 |
|------|------|
| `openDB()` | 打开 PlainTab DB，连接缓存，断线自愈 |
| `idbPut(key, value)` | IndexedDB 写入 |
| `idbGet(key)` | IndexedDB 读取 |
| `idbDelete(key)` | IndexedDB 单条删除 |
| `idbDeleteMany(keys)` | IndexedDB 批量删除（单事务） |
| `imgKey(id)` | 拼出 `ptab_img_<id>` key |
| `loadOrder()` / `saveOrder()` | 读写 `ptab_img_order` |
| `loadThumbs()` / `saveThumbs()` | 读写 `ptab_img_thumbs`，带内存缓存 |
| `loadMeta()` / `saveMeta()` | 读写 `ptab_img_meta`，带内存缓存 |
| `loadBingMeta()` / `saveBingMeta()` | 读写 `ptab_bing_meta` |
| `migrateStorage()` | 版本迁移入口，链式执行 MIGRATIONS |
| `migrate_1_to_2()` | v3.0.4 → v3.1.4 数据迁移（键重命名 + 数据结构升级） |
| `clearCaches()` | 清内存缓存（源切换时调用） |

### 4. `wallpaper/fetch.js` — 壁纸获取

| 函数 | 功能 |
|------|------|
| `bingMkt(lang)` | 语言代码 → Bing 市场参数 |
| `fetchBingUrl(lang)` | 双端点 `Promise.any` 竞速获取图片 URL，8s 超时 |
| `downloadBingBlob(url)` | 下载图片为 Blob |
| `cacheBingBlob(url, provider, today)` | 判断缓存命中/重新下载 → 写 IDB → 更新元数据 |
| `generateId()` | 时间戳+随机数生成唯一 ID |

### 5. `wallpaper/show.js` — 壁纸渲染

| 函数 | 功能 |
|------|------|
| `preloadImage(url)` | 预加载 + `img.decode()`，返回 Image |
| `applyWallpaper(url, ms)` | 写入 `#wallpaperFront` → CSS 淡入 → `transitionend` 后同步到 `#wallpaperBack` → revoke 旧 Blob URL |
| `generateThumbnail(source)` | Canvas 缩略图，640px 宽，JPEG 55% 质量 |
| `applyAndSavePreview(url)` | 应用壁纸 + 生成缩略图 → 写入 `ptab_preview_thumb` |
| `revokeBlobUrls()` | 释放所有 Blob URL |

### 6. `newtab.js` — 主控中心

**国际化（§5）**

| 函数 | 功能 |
|------|------|
| `t(key)` | 翻译查找：chrome.i18n → I18N[currentLang] → I18N['en'] → key |
| `detectLang()` | 浏览器语言自动检测（精确 → 前缀 → en） |
| `updateLangUI()` | 刷新全页文字、placeholder、title、data-i18n 元素 |
| `renderLangPanel()` | 懒创建语言按钮（首次），后续只更新文字和高亮 |

**壁纸主流程（§6）**

| 函数 | 功能 |
|------|------|
| `loadWallpaper()` | 启动入口：本地优先 → Bing 缓存 → Bing 网络 |
| `tryLoadLocalWallpaper(order)` | 读 index → 读 IDB 原图 → 恢复 MIME → 推进 index → 写 preview |
| `tryLoadCachedBing(blob, meta, today)` | Bing 缓存命中，跳过下载 |
| `loadBingFromNetwork(meta, today)` | 先展示旧图 → 拉新图 → 替换 |
| `cacheBingInBackground()` | 后台静默缓存当日 Bing（非 Bing 模式时也执行） |

**本地上传与画廊（§7/§9）**

| 函数 | 功能 |
|------|------|
| `saveLocalImage(file, show)` | 上传：缩略图 → 写 IDB → 写 order/thumbs/meta → 更新 preview |
| `deleteLocalImage(id)` | 删除：断引用 → 删缩略图/元数据 → 删 IDB → 最后一张切回 Bing |
| `resetToBing()` | 清空本地 → 恢复 Bing |
| `refreshLocalGallery()` | 刷新画廊（缓存命中则立即渲染，否则读 IDB） |
| `renderLocalGallery()` | 渲染画廊 DOM + 绑定拖拽 |
| `buildGalleryGrid(order, images, thumbs)` | 构建缩略图网格 |
| `setupGalleryDrag(grid)` | Pointer Events 拖拽排序（长按 300ms 触发，动画落位） |
| `ensureGalleryContainer()` | 获取或创建画廊容器 |
| `removeLocalGallery()` | 移除画廊 + revoke Blob URLs |

**面板（§8）**

| 函数 | 功能 |
|------|------|
| `openSettings()` / `closeSettings()` | 一级设置面板 |
| `openLangPanel()` / `closeLangPanel()` | 语言面板（与设置面板互斥） |
| `closeAll()` | 关闭所有面板 |

**搜索栏与视觉（§10/§11）**

| 函数 | 功能 |
|------|------|
| `showCorners()` / `hideCorners()` | 右上角按钮显隐（400ms 延迟防抖） |
| `isNearTopRight(x, y)` | 右上角热区判定 |
| `isInCenter(x, y)` | 屏幕中央区域判定 |
| `showSearch()` / `hideSearch()` | 搜索栏显隐（悬停模式 150ms 延迟） |
| `applySearchMode()` / `applyOpacity()` / `applyEngine()` | 应用各项搜索设置 |
| `nextEngine()` | 循环切换搜索引擎 |
| `loadSettings()` / `saveSettings()` | 设置持久化 |

**启动（§15）**

| 函数 | 功能 |
|------|------|
| `init()` | 迁移 → 语言 → 设置 → UI → 壁纸 → 扩展模式 → 事件 |
| `setupExtensionMode()` | 劫持 `doSearch` 为 `chrome.search.query()`，隐藏引擎选项 |
| `bindEvents()` | 绑定全部交互事件（键盘、鼠标热区、面板、上传、拖拽等） |

### 7. `palette.js` — 命令面板

**数据层**

| 函数 | 功能 |
|------|------|
| `loadShortcuts()` / `saveShortcuts()` | 读写快捷链接数组（内存缓存） |
| `loadIcons()` / `saveIcons()` | 读写图标字典 |
| `loadRecents()` / `saveRecents()` | 读写最近访问（≤10） |
| `loadHidden()` / `saveHidden()` | 读写隐藏链接 ID 列表 |
| `loadHotkey()` / `saveHotkey()` | 读写普通面板快捷键 |
| `loadHiddenHotkey()` / `saveHiddenHotkey()` | 读写隐藏面板快捷键 |
| `loadRecommend()` / `saveRecommend()` | 读写推荐开关 |
| `recordAccess(id)` | freq+1 + 更新 recents |

**视图渲染**

| 函数 | 功能 |
|------|------|
| `renderPinnedBar()` | 渲染顶部命令栏 + 视图切换按钮 |
| `renderShortcutList(filter)` | 主列表：推荐区 + A-Z 区，列表/图标双视图，分页，搜索过滤 |
| `renderGrid(mode, page)` | 编辑/删除模式网格 |
| `renderForm(mode, item)` | 添加/编辑表单 |
| `renderFeedback(name, icon)` | 添加成功反馈动画（2s 后自动返回） |
| `renderHelp()` | 帮助列表 |
| `renderRecentList()` | 最近访问列表 |
| `renderHideGrid()` / `renderUnhideGrid()` | 隐藏/取消隐藏网格 |
| `buildItemHTML()` / `buildGridIconHTML()` | 列表项 / 图标格 HTML |
| `renderPaginationHTML()` | 分页圆点 |
| `applyIconStyles()` | 后处理图标：首字母彩色同心圆 / 真实 favicon |
| `applyMarqueeLabels()` | 长名称跑马灯 |

**交互控制**

| 函数 | 功能 |
|------|------|
| `openPalette()` / `openHiddenPalette()` | 打开面板（含互斥提示） |
| `closePalette()` | 关闭面板 + 动画 + 状态重置 |
| `handleCommand(cmd)` | 命令分发 |
| `handleSearchInput()` | 搜索框输入 + 斜杠命令（`/add` `/edit` 等） |
| `handleAddSubmit()` / `handleEditSubmit()` | 提交添加/编辑：URL 校验 + 去重 + 保存 |
| `handleDeleteClick(id)` | 删除：快捷链接 + 图标 + 最近 + 隐藏 |
| `handleShortcutClick(id)` | 点击跳转 + recordAccess |
| `handleKeyNav(e)` | 键盘导航（↑↓ Enter Escape） |
| `handleGridScroll()` / `handleIconPageScroll()` | 滚轮翻页 |
| `handleImport()` / `handleExport()` | 书签 HTML 导入 / JSON 导出 |
| `handleReset()` / `handleClear()` | 重置频率 / 清空全部（二次确认） |
| `handleFetchTitle()` | 从目标网页抓取标题自动填入 |
| `fetchPageTitle(url, cb)` | fetch + 正则提取 `<title>` |
| `isDDGPlaceholder(img)` | DuckDuckGo 占位图检测（像素哈希） |
| `hideShortcut()` / `unhideShortcut()` | 切换隐藏状态 |
| `slideInContent(fromLeft)` | 翻页滑入动画 |

---

## 模块依赖图

```
preload.js          (无依赖，最先执行)
languages.js        (无依赖，注入全局)
│
├─ wallpaper/data.js    (无依赖)
│   └─ wallpaper/fetch.js  → depends on data
│       └─ wallpaper/show.js → depends on data
│
├─ palette.js         (depends on t(), log(), warn() from newtab)
│
└─ newtab.js          (depends on data, fetch, show, I18N, LanguageList)
    └─ index.html 中最后加载
```

## 调用时序

```
index.html 解析
│
├─ #wallpaperBack 渲染
├─ preload.js 执行 ──────────── 首帧壁纸直写
├─ #wallpaperFront 渲染
├─ languages.js 执行 ────────── I18N + LanguageList 就绪
├─ wallpaper/data.js 执行 ───── WallpaperData 就绪
├─ wallpaper/fetch.js 执行 ──── WallpaperFetch 就绪
├─ wallpaper/show.js 执行 ───── WallpaperShow 就绪
├─ palette.js 执行 ──────────── Palette 就绪 + bindPaletteEvents
│
└─ newtab.js DOMContentLoaded → init()
    │
    ├─ WallpaperData.migrate() ──── 版本迁移
    ├─ detectLang() ─────────────── 语言检测
    ├─ loadSettings() ───────────── 恢复搜索/外观设置
    ├─ updateLangUI() ───────────── 刷新全页文字
    │
    ├─ loadWallpaper()
    │   ├─ mode='local'
    │   │   └─ tryLoadLocalWallpaper()
    │   │       ├─ WallpaperData.idbGet()
    │   │       └─ WallpaperShow.apply()
    │   │           ├─ preloadImage → decode
    │   │           ├─ #wallpaperFront 淡入
    │   │           └─ transitionend → 同步 #wallpaperBack
    │   │
    │   ├─ mode='bing' (缓存命中)
    │   │   └─ WallpaperShow.applyAndSavePreview()
    │   │       ├─ apply()
    │   │       └─ generateThumbnail → LS write
    │   │
    │   └─ mode='bing' (需网络)
    │       ├─ WallpaperFetch.fetchBingUrl()
    │       │   ├─ Promise.any([primary, fallback]) 双端点竞速
    │       │   └─ 返回最快响应的 {url, api}
    │       ├─ WallpaperShow.applyAndSavePreview()
    │       └─ WallpaperFetch.cacheBingBlob()
    │           ├─ downloadBingBlob → fetch blob
    │           └─ WallpaperData.idbPut()
    │
    ├─ setupExtensionMode()
    │   ├─ doSearch → chrome.search.query()
    │   └─ 隐藏搜索引擎选择器
    │
    └─ bindEvents()
        ├─ Ctrl+K      → Palette.open()
        ├─ Ctrl+Shift+K → Palette.openHidden()
        ├─ Ctrl+Shift+W → openSettings()
        ├─ Escape       → closeAll() or Palette.handleKeyNav()
        ├─ Enter(搜索框) → doSearch()
        ├─ 双击空白     → Palette.open()
        ├─ 中键点击     → Palette.openHidden()
        ├─ 右上角热区   → showCorners/hideCorners
        ├─ 中央区域     → showSearch/hideSearch
        └─ 点击壁纸     → searchInput.focus()
```

## 性能说明

- 总代码量 ~3000 行，零外部依赖，无构建流程
- `preload.js` 26 行同步执行，保证首帧无白屏
- WallpaperShow 使用 `img.decode()` 避免解码阻塞主线程
- `Promise.any` 双端点竞速，哪个快用哪个
- 所有 LS 读写在微秒级，IDB 异步不阻塞渲染
- palette.js 使用内存缓存避免反复 JSON.parse
- 鼠标热区检测通过 `requestAnimationFrame` 节流
- Blob URL 在壁纸切换后立即 revoke 防止内存泄漏
