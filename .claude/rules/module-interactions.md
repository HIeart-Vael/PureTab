# 模块联动总览

## 一、模块全景图

PlainTab 由 8 个独立逻辑模块组成，各自负责一块功能，通过明确的接口互相调用。

```
                        ┌─────────────────┐
                        │   全局交互系统    │  ← 顶层协调者
                        │  (键盘/鼠标/面板) │
                        └───────┬─────────┘
                                │ 调用所有模块
        ┌───────────┬───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │ 命令   │ │ 设置   │ │ 搜索   │ │ 语言   │ │ 本地   │
   │ 面板   │ │ 面板   │ │ 栏     │ │ 系统   │ │ 图库   │
   └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
       │          │          │          │          │
       └──────────┴──────────┴──────────┴──────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   壁纸系统     │  ← 核心功能
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   数据存储     │  ← 最底层
                     └──────────────┘
```

---

## 二、依赖关系矩阵

行 = 依赖者，列 = 被依赖者。● = 有依赖。

| 谁 ↓ / 依赖谁 → | 数据存储 | 语言系统 | 壁纸系统 | 搜索栏 | 设置面板 | 本地图库 | 命令面板 | 全局交互 |
|-----------------|---------|---------|---------|-------|---------|---------|---------|---------|
| **数据存储**    | -       |         |         |       |         |         |         |         |
| **语言系统**    | ●       | -       |         |       |         |         |         |         |
| **壁纸系统**    | ●       | ●       | -       |       |         |         |         |         |
| **搜索栏**      | ●       | ●       |         | -     |         |         |         |         |
| **设置面板**    | ●       | ●       | ●       | ●     | -       | ●       | ●       |         |
| **本地图库**    | ●       | ●       | ●       |       |         | -       |         |         |
| **命令面板**    | ●       | ●       |         |       |         |         | -       |         |
| **全局交互**    | ●       |         | ●       | ●     | ●       |         | ●       | -       |

**解读：**
- **数据存储** 是最底层，被所有模块依赖，自己不依赖任何人
- **语言系统** 几乎被所有模块依赖（任何显示文字的地方都需要它）
- **壁纸系统** 被设置面板、本地图库、全局交互依赖
- **全局交互** 是顶层，依赖所有模块（调用它们的接口），但不被任何人依赖

---

## 三、关键时序流程

### 3.1 冷启动完整流程（从零到页面就绪）

```
浏览器开始解析 HTML
│
├─ #wallpaperBack 出现在 DOM
│
├─ preload.js 同步执行（阻塞渲染）
│   ├─ 读 ptab_mode
│   ├─ 读缩略图（preview_thumb → bing_thumb 优先级）
│   ├─ 写 wallpaperBack.style.backgroundImage
│   └─ 返回 ← 此时浏览器可以安全绘制第一帧了
│
├─ 浏览器首次绘制（壁纸已在底层！零闪白 ✓）
│
├─ #wallpaperFront + 其他 DOM 元素解析
│
├─ languages.js 同步加载
│   └─ 设置 window.I18N + window.LanguageList
│
├─ newtab.js 同步加载（IIFE 立即执行）
│   ├─ 1. 检测环境（扩展 or 网页）
│   ├─ 2. detectLang() → 读 ptab_lang 或自动检测
│   ├─ 3. loadSettings() → 恢复搜索/透明度/引擎
│   ├─ 4. loadWallpaper() → 异步加载壁纸
│   │   ├─ 本地模式？→ tryLoadLocalWallpaper
│   │   │   ├─ 读 order[index] → IDB 取 blob
│   │   │   ├─ 递增 index → 同步写 preview_thumb
│   │   │   └─ applyWallpaper(blobUrl) → 异步过渡
│   │   ├─ Bing 模式？→ tryLoadCachedBing
│   │   │   ├─ 缓存有效 → applyWallpaper
│   │   │   └─ 缓存无效 → loadBingFromNetwork
│   │   │       ├─ fetchBingUrl（双端点竞速）
│   │   │       └─ applyWallpaper + cacheBingBlob
│   │   └─ 全部失败 → 保持 preload 写入的缩略图
│   ├─ 5. setupExtensionMode()（如是扩展）
│   └─ 6. bindEvents() → 全局键盘/鼠标/点击
│
└─ 页面就绪 ✓
```

### 3.2 壁纸切换流程（上传一张本地图片 → 展示）

```
用户在设置面板点击「选择本地壁纸」
│
├─ 文件选择器弹出 → 用户选了一张
│
├─ 本地图库处理上传：
│   ├─ generateId() → 生成唯一 ID
│   ├─ 创建缩略图（Canvas 640px JPEG）
│   ├─ idbPut(ptab_img_<id>, {blob, mime, name}) → 重数据落盘
│   ├─ order.push(id) → saveOrder() → ID 加入轮换序列
│   ├─ thumbs[id] = thumb → saveThumbs() → 缩略图入库
│   ├─ meta[id] = {name, size} → saveMeta() → 元数据入库
│   ├─ localStorage.setItem('ptab_mode', 'local') → 切模式
│   └─ 调用壁纸系统展示：
│
├─ 壁纸系统展示流程：
│   ├─ URL.createObjectURL(blob) → 创建临时 URL
│   ├─ preloadImage(url) → 预加载到内存 + 解码
│   ├─ transitionToWallpaper(url) → 双图层过渡
│   │   ├─ 设到 front 层（opacity:0）
│   │   ├─ 两个 rAF 后 → front 层淡入
│   │   └─ 550ms 后 → stabilize 到 back 层 + 清空 front
│   ├─ generateThumbnail(img) → 复用已加载的 Image
│   └─ 写 preview_thumb → 下一个标签页用
│
├─ 设置面板刷新图库 → 显示新的缩略图 + 「＋」按钮
│
└─ 完成 ✓
```

### 3.3 命令面板完整生命周期

```
用户按 Ctrl+K
│
├─ 全局交互接收 keydown 事件
├─ 检查：Ctrl+K + !shiftKey + 面板没开
├─ 调用 openPalette():
│   ├─ isPaletteOpen = true
│   ├─ 设置 visibility: visible
│   ├─ 遮罩淡入动画（200ms）
│   ├─ 面板缩放淡入动画（220ms）
│   ├─ renderPinnedBar() → 渲染命令栏
│   ├─ renderShortcutList() → 渲染主视图
│   └─ 聚焦搜索输入框
│
├─ 用户在面板内操作：
│   ├─ 搜索 → 每输入一个字符就过滤 shortcut 列表
│   ├─ 点击命令按钮 → 进入对应模式（add/edit/delete/...）
│   ├─ 上下箭头 → 在列表项之间移动高亮
│   ├─ 回车 → 点击当前高亮的项
│   └─ Esc → 从子模式返回主列表 / 从主列表关闭面板
│
├─ 用户按 Esc 或点击遮罩 → closePalette():
│   ├─ 遮罩淡出动画（150ms）
│   ├─ 面板缩放淡出动画（150ms）
│   ├─ 动画完成后 → visibility: hidden
│   ├─ isPaletteOpen = false
│   └─ isHiddenMode = false（重置）
│
└─ 完成 ✓
```

### 3.4 设置变更传播路径

```
用户在设置面板里改了透明度
│
├─ 滑块/数字框的 input 事件触发
├─ applyOpacity(newValue):
│   ├─ currentOpacity = newValue
│   ├─ document.documentElement.style.setProperty('--icon-opacity', newValue)
│   │   └─ CSS 变量更新 → 所有引用该变量的元素即时刷新（角落按钮、引擎图标）
│   └─ saveSettings() → localStorage 持久化
│
└─ 下次打开新标签页 → loadSettings() → 恢复透明度 ✓
```

---

## 四、数据流向图

```
localStorage 数据流向：

ptab_mode ─────────── 壁纸系统(写) → preload.js(读) → 壁纸系统(读)
ptab_bing_thumb ───── 壁纸系统(写) → preload.js(读)
ptab_preview_thumb ── 壁纸系统(写) → preload.js(读，优先)
ptab_bing_meta ────── 壁纸系统(写) → 壁纸系统(读，去重判断)
ptab_img_order ────── 壁纸系统/图库(写) → preload.js/壁纸系统/图库(读)
ptab_img_thumbs ───── 壁纸系统/图库(写) → preload.js/壁纸系统/图库(读)
ptab_img_meta ─────── 壁纸系统/图库(写) → 图库(读)
ptab_local_index ──── 壁纸系统(写) → preload.js/壁纸系统(读)
ptab_lang ─────────── 语言系统(写) → 语言系统(读)
ptab_search_mode ──── 设置面板(写) → 搜索栏(读)
ptab_icon_opacity ─── 设置面板(写) → 搜索栏(读)
ptab_search_engine ── 设置面板(写) → 搜索栏(读)
ptab_shortcuts ────── 命令面板(写) → 命令面板(读)
ptab_shortcut_icons ─ 命令面板(写) → 命令面板(读)
ptab_shortcut_recents 命令面板(写) → 命令面板(读)
ptab_shortcut_hidden ─ 命令面板(写) → 命令面板(读)
ptab_shortcut_hotkey ─ 设置面板/命令面板(写) → 全局交互(读)
ptab_shortcut_hidden_hotkey 命令面板(写) → 全局交互(读)
ptab_shortcut_recommend 设置面板(写) → 命令面板(读)
ptab_shortcut_view ─── 命令面板(写) → 命令面板(读)
ptab_version ──────── 应用启动(写) → 应用启动(读)

IndexedDB 数据流向：

ptab_bing_blob ────── 壁纸系统(写) → 壁纸系统(读)
ptab_img_<id> ─────── 壁纸系统/图库(写) → 壁纸系统/图库(读)
```

---

## 五、事件流

```
键盘事件路由：

document.addEventListener('keydown', handler)
│
├─ 命令面板开着？
│   ├─ YES → handleKeyNav(e)
│   │   ├─ 上下箭头 → 列表导航
│   │   ├─ 回车 → 点击/确认
│   │   ├─ Esc → 返回上一步/关闭面板
│   │   └─ 其他 → 输入框打字
│   └─ NO → 继续往下
│
├─ e.key === 'Escape'
│   ├─ closeAll() → 关闭设置 + 语言面板
│   └─ hideCorners() → 隐藏角落按钮
│
├─ e.ctrlKey && e.key === 'k' && !e.shiftKey
│   ├─ 命令面板已打开？→ 检查互斥规则
│   └─ 命令面板没开？→ openPalette()
│
├─ e.ctrlKey && e.shiftKey && e.key === 'k'
│   └─ openHiddenPalette()（同理检查互斥）
│
├─ e.ctrlKey && e.shiftKey && e.key === 'w'
│   └─ toggleSettings()
│
└─ e.key === 'Enter' && 搜索框有焦点
    └─ doSearch()
```

---

## 六、面板互斥状态机

```
         ┌──────────┐
         │  空闲状态  │ ← 所有面板关闭
         └─────┬────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌───────┐ ┌───────┐ ┌──────────┐
│ 设置   │ │ 语言   │ │ 命令面板  │
│ 面板   │ │ 面板   │ │ (覆盖层)  │
│ 打开   │ │ 打开   │ │ 打开      │
└───┬───┘ └───┬───┘ └─────┬────┘
    │         │           │
    └────┬────┘           │
         │ 互斥：打开一个    │ 命令面板可以覆盖
         │ 关另一个         │ 在设置/语言之上
         ▼                 ▼
    设置 ↔ 语言       命令面板独立
```

---

## 七、CSP 对架构的影响

Chrome 扩展的内容安全策略限制：

- **不能写内联样式**（HTML 里写 `style="..."`）→ 所有样式走 CSS 文件，动态样式用 JS 的 `element.style.xxx`
- **不能写内联事件**（HTML 里写 `onclick="..."`）→ 所有事件走 JS 的 `addEventListener`
- **不能写 `<style>` 标签** → 所有 CSS 在一个文件里
- **不能用 eval** → 完全不使用
- **图片只能从这几个地方加载**：自己、Bing、DuckDuckGo 图标服务、data URL、blob URL

这些限制影响了所有模块的 UI 实现方式，但不影响功能需求本身。

---

## 八、总结

| 模块 | 一句话职责 |
|------|----------|
| 数据存储 | 所有数据怎么存、怎么读、怎么保证不丢 |
| 语言系统 | 16 种语言翻译、检测、切换 |
| 壁纸系统 | 零闪白展示壁纸、Bing 每日/本地轮换 |
| 搜索栏 | 搜索输入、引擎切换、扩展/网页双模式 |
| 设置面板 | 所有可配置项的 UI 入口 |
| 本地图库 | 管理上传的壁纸（增删拖拽排序） |
| 命令面板 | 快捷链接的增删改查、导入导出 |
| 全局交互 | 键盘快捷键、鼠标行为、面板协调、启动流程 |
