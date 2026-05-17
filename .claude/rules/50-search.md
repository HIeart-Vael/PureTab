# 搜索栏需求规格

## 行为概述

搜索栏是新标签页的主要输入入口，浮动在壁纸之上。搜索 UI 由 `css/search.css` 渲染，运行时设置由 `ptab_ui.search` 保存，基础应用逻辑在 `settings-bootstrap.js`，搜索提交在 `newtab.js`。

### 显示模式

| 模式 | 值 | 行为 |
|------|----|------|
| 始终显示 | `always` | 搜索栏始终可见，点击壁纸区域可聚焦输入框 |
| 悬停显示 | `hover` | 搜索栏保持透明可命中，鼠标进入搜索栏区域或获得 `.visible` 时显示，移开后隐藏 |
| 始终隐藏 | `never` | 搜索栏隐藏且不响应聚焦 |

默认值为 `always`。

### 搜索引擎

支持四种 URL 模板：

| 引擎 | URL |
|------|-----|
| Google | `https://www.google.com/search?q=` |
| Bing | `https://www.bing.com/search?q=` |
| Baidu | `https://www.baidu.com/s?wd=` |
| DuckDuckGo | `https://duckduckgo.com/?q=` |

网页模式下，点击搜索引擎图标循环切换并保存到 `ptab_ui.search.engine`。

扩展模式下，搜索引擎设置行隐藏，图标改为静态放大镜且不可点击。提交搜索时必须调用 `chrome.search.query()`，使用浏览器默认搜索提供商，避免在扩展版内提供搜索引擎切换。

### 搜索执行

1. 输入关键词。
2. 按 Enter。
3. 去除首尾空格。
4. 关键词为空则不跳转。
5. 按配置写入搜索历史。
6. 使用当前引擎 URL 模板拼接 `encodeURIComponent(query)`，在当前页面 `_self` 跳转。

### 搜索历史

搜索历史保存在 `ptab_ui.search.historyItems`，数量配置保存在 `ptab_ui.search.historyLimit`。

| 配置 | 行为 |
|------|------|
| `0` | 不保存、不展示历史 |
| `5` | 保存并展示最近 5 条 |
| `10` | 保存并展示最近 10 条 |

默认值为 `5`。历史记录只保存去除首尾空格后的搜索词，大小写不敏感去重，最新记录排在最前。输入框聚焦或输入时在搜索栏下方展示匹配项；方向键切换选中项，Enter 搜索选中项，Escape 关闭候选面板。

### 可自定义外观

这些设置在模态窗口“界面”分页即时保存到 `ptab_ui`：

| 设置 | 存储字段 | 当前范围/值 |
|------|----------|-------------|
| 搜索栏显示 | `search.visibility` | `hover` / `always` / `never` |
| 垂直位置 | `search.position` | `edge-top` / `top` / `upper` / `center-upper` / `center` / `center-lower` / `lower` / `bottom` / `edge-bottom` |
| 横向对齐 | `search.align` | 当前默认 `center`；归一化支持 `left` / `center` / `right` |
| 图标位置 | `search.iconPosition` | `left` / `right` |
| 宽度 | `search.width` | 360-760px，CSS 中再限制为 `min(width, 88vw)` |
| 圆角 | `search.radius` | `capsule` / `rounded` / `sharp` |
| 搜索框背景 | `search.backgroundOpacity` | 0.04-0.32 |
| 搜索框模糊 | `search.blur` | 0-40px backdrop blur |
| 搜索历史 | `search.historyLimit` / `search.historyItems` | 0 / 5 / 10 条 |
| 壁纸遮罩 | `wallpaper.overlayOpacity` | 0-0.6 |
| 壁纸适配 | `wallpaper.fit` | `cover` / `contain` / `100% 100%` |
| 壁纸焦点 | `wallpaper.position` | `center` / `top` / `bottom` / `left` / `right` |
| 背景模糊 | `wallpaper.blur` | `0` 或 `5-15` |
| 壁纸主题色 | `wallpaper.themeEnabled` | boolean |
| 图标透明度 | `icon.opacity` | 0-1 |
| 面板透明度 | `panel.opacity` | 0.3-1 |
| 界面圆角 | `appearance.radius` | `compact` / `soft` / `round` |

## 约束清单

### 显隐行为

- `always` 模式下搜索栏必须有 `.visible`。
- `hover` 模式不得靠全局鼠标中心区域强制显示；当前实现基于搜索栏自身 hover/focus 状态。
- 输入框聚焦时，搜索栏不能因鼠标离开而隐藏。
- 命令面板打开时，不应额外触发搜索栏显示。
- 从一种模式切换到另一种时即时应用并保存。

### 搜索执行

- 只去除首尾空格，中间空格保留。
- 空关键词不跳转。
- 网页模式 URL 拼接必须使用 `encodeURIComponent`。
- 扩展模式隐藏引擎切换入口，并通过 `chrome.search.query()` 尊重浏览器默认搜索；不得在扩展版中恢复搜索引擎切换，除非同步评估 Chrome Web Store 单一用途政策。
- 搜索历史关闭时不得保留旧历史；数量降低时必须裁剪到新上限。
- 搜索历史候选面板不得影响 `never` 模式，也不得阻塞命令面板快捷键。

### 外观

- 搜索栏宽度由 CSS 变量 `--search-width` 和 `88vw` 上限共同约束。
- 搜索栏位置通过 `data-position` 和 CSS 变量控制，不用 JS 动态写 top/left。
- 图标左右位置通过 `data-icon-position` 切换 flex 方向。
- 壁纸遮罩是全屏 `pointer-events:none` 元素，不影响下层交互。
- 背景模糊值必须按壁纸规则归一化，不能把 `1-4` 当作真实 blur 强度保存/使用。

### 语言适配

- 搜索框 placeholder、引擎图标 title、设置项文案都走 `t(key)`。
- 新增搜索相关设置时必须补齐英文兜底和各语言 key。
