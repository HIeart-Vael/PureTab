# 命令面板需求规格

## 一、两套独立面板

| 面板 | 快捷键 | 鼠标 | 默认值 |
|------|--------|------|--------|
| Normal | 用户可配 | 双击空白区域 | `Ctrl+K` |
| Hidden | 用户可配 | 中键点击 | `Ctrl+Shift+K` |

两套面板共用同一套 DOM，通过 `isHiddenMode` 标志位区分。各自独立运行：

- 每套面板有自己的命令栏，Normal 显示 `hide`，Hidden 显示 `unhide`，其余命令相同
- 每套面板只显示自己的数据，互不干扰
- 每套面板的 edit / delete / recent 只操作自己范围内的快捷链接

互斥规则：

- Normal 面板打开时按 `Ctrl+Shift+K` → 不切换，面板内提示「当前普通模式 — 请按 Esc 关闭后再试」
- Hidden 面板打开时按 `Ctrl+K` → 不切换，面板内提示「当前隐藏模式 — 请按 Esc 关闭后再试」
- 提示 2 秒后自动消失
- 关闭面板时 `isHiddenMode` 重置为 `false`

命令栏（全部一行，不换行不滚动）：

Normal：
```
add  edit  delete  hide  recent  import  export  reset  clear  help  ☰/⊞
```

Hidden：
```
add  edit  delete  unhide  recent  import  export  reset  clear  help  ☰/⊞
```

末尾 `☰列表` / `⊞图标` 是视图切换按钮，显示当前模式。

---

## 二、数据模型

| Key | 类型 | 内容 |
|-----|------|------|
| `ptab_shortcuts` | Array | 所有快捷链接 `[{id, name, url, freq, added}]` |
| `ptab_shortcut_icons` | Object | `{id: "url" \| "LETTER:X"}` |
| `ptab_shortcut_recents` | Array | 最近访问的 id（最多 10 条） |
| `ptab_shortcut_hidden` | Array | 被隐藏的快捷链接 id 列表 |
| `ptab_shortcut_hotkey` | String | Normal 面板快捷键，默认 `ctrl+k` |
| `ptab_shortcut_hidden_hotkey` | String | Hidden 面板快捷键，默认 `ctrl+shift+k` |
| `ptab_shortcut_recommend` | String | 是否显示推荐，`"true"` / `"false"` |
| `ptab_shortcut_view` | String | 视图模式，`"list"` / `"icon"` |

数据互斥规则：**一条快捷链接只能属于 Normal 或 Hidden，不能同时属于两边。**

- `ptab_shortcuts` 存储所有快捷链接（不分 Normal/Hidden）
- `ptab_shortcut_hidden` 数组标记哪些是隐藏的
- Normal 面板显示：在 `ptab_shortcuts` 中但不在 `ptab_shortcut_hidden` 中的
- Hidden 面板显示：在 `ptab_shortcuts` 中且在 `ptab_shortcut_hidden` 中的
- 主视图（推荐 + A-Z）、edit、delete、hide/unhide、recent 视图均遵循此过滤规则

去重规则：添加时检查 URL 是否已存在于 `ptab_shortcuts` 全量（大小写不敏感，不区分 Normal/Hidden）。导入书签时同样全量去重。

---

## 三、命令行为

### add

1. 表单：名称 + URL（名称可留空，提交时自动用域名回退）
2. URL 输入框右侧有 ⬇ 下载图标按钮，点击 → `fetch(url)` 解析页面 `<title>` 标签填入名称字段（覆盖已有值）
3. 获取期间按钮旋转动画，名称字段显示「正在获取标题…」；CORS 失败则回退提取域名
4. 扩展模式首次请求时弹出权限对话框（`optional_host_permissions`），用户授权后所有网站 fetch 生效
5. URL 校验：只允许 `http://` / `https://` 协议（自动补 `https://`），拒绝 `javascript:` / `file:` 等危险协议，格式必须为 `scheme://host/...`
6. 全量检查 URL 重复 → 重复则报错
7. 写入 `ptab_shortcuts`，获取 DuckDuckGo favicon URL → 异步预加载：
   - favicon 加载成功 → 即刻展示反馈（圆形图标 + favicon + "xxx 已添加"）
   - favicon 加载失败或 3s 超时 → 展示首字母反馈
8. 若当前为 Hidden 模式 → 同时将该 id 加入 `ptab_shortcut_hidden`
9. 反馈停留 2 秒后返回主列表，不关闭面板

### edit

1. 显示当前面板范围内的快捷链接（跟随视图模式）
2. 点击某个快捷链接 → 预填表单（名称 + URL 已有值），**不触发跳转**
3. 编辑模式下 ⬇ 按钮同样可用，可覆盖已有名称
4. 提交 → 更新 `ptab_shortcuts` + 更新 favicon → 立即返回主列表
5. 不改变该快捷链接的 Normal/Hidden 归属
6. Escape → 返回主列表

### delete

1. 显示当前面板范围内的快捷链接（跟随视图模式）
2. 每项右上角红色 ✕，始终可见，紧贴图标右上角
3. 图标模式：5 列 × 3 排 = 15 项/页，底部分页圆点，滚轮翻页，不足 15 格补空白
4. 列表模式：单列可滚动
5. 点击 ✕ → 从 `ptab_shortcuts` 移除，同时清理 `ptab_shortcut_icons` `ptab_shortcut_recents` `ptab_shortcut_hidden`

### hide（仅 Normal 面板）

1. 显示 Normal 范围内的快捷链接（已隐藏的不再出现）
2. 点击 → id 加入 `ptab_shortcut_hidden` → 刷新

### unhide（仅 Hidden 面板）

1. 显示 Hidden 范围内的快捷链接
2. 点击 → id 从 `ptab_shortcut_hidden` 移除 → 刷新

### recent

1. 从 `ptab_shortcut_recents` 读取，只显示当前面板范围内的
2. 跟随视图模式

### import

1. 弹出文件选择器，接受 `.html` / `.htm`
2. 正则解析 `<A HREF="...">...</A>`，全量 URL 去重
3. 批量添加，不关闭面板

### export

1. 导出 `ptab_shortcuts` 为 JSON 下载
2. 文件名 `plaintab-shortcuts-YYYY-MM-DD.json`
3. 不关闭面板

### reset

- 将所有 `ptab_shortcuts` 的 `freq` 置为 0，刷新主列表

### clear

- 面板内二次确认后清空 `ptab_shortcuts` `ptab_shortcut_icons` `ptab_shortcut_recents` `ptab_shortcut_hidden`，返回主列表（不关闭面板）

### help

- 显示所有命令及说明，始终为列表样式

---

## 四、视图模式

| 模式 | 布局 | 显示内容 |
|------|------|---------|
| 列表 | 单列 | 圆形图标 + 名称 + URL（截断） |
| 图标 | 推荐区 + A-Z 区双 grid（`gap: 18px 10px`，推荐 grid `margin-bottom: 18px`，56px 外圆 + 32px favicon img / 38px 内圆） | 推荐 1 排（5 格）+ A-Z 每页（有推荐 10/无推荐 15 项），翻页圆点 + 滚轮翻页 + 左右滑入动画 |

- 持久化到 `localStorage.ptab_shortcut_view`，切换即时保存
- 对所有视图全局生效：主视图、edit、delete、hide、unhide、recent
- 切换视图模式时当前视图即时刷新
- **长名称跑马灯**：名称文本超出容器宽度时自动启用无限循环滚动动画（`cp-marquee` 6s linear infinite），列表和图标模式均生效
- **页面高度**：所有页结构统一（1 title + 对应 grid rows），推荐 grid 的 `cp-grid-rec` `margin-bottom: 18px` 补足双 grid 间距

---

## 五、主视图渲染

- 推荐区：无搜索词且开启推荐时显示，按频率取前 5，从当前面板范围内筛选。独立 grid，**不参与翻页**
- A-Z 区：排除推荐项后按名称字母升序，图标模式有推荐时每页 10 项（2 排）、无推荐时 15 项（3 排）。底部分页圆点，滚轮/点圆点翻页，左右滑入动画（`slideInContent`，28ms cubic-bezier）。所有页均显示 section title
- 推荐与 A-Z 互斥：出现在推荐区的不会出现在 A-Z 区
- 搜索：全量过滤当前面板范围，匹配名称或 URL（大小写不敏感），搜索结果统一 15 项/页
- 空状态：无快捷链接时显示「暂无快捷链接，输入 /add 创建」

---

## 六、图标

- 圆形 (`border-radius: 50%`)，列表 32px / grid 56px / 反馈 40px
- **统一外观**：所有图标外层灰白圆 (`#3e3e44`)，favicon 图标内嵌图片、文字图标内嵌彩色同心圆（`.cp-icon-inner`，22/38/28px，16 色 hash）
- Favicon 来源：`https://icons.duckduckgo.com/ip3/{domain}.ico`（全球可用）
- CSP 已放行 `icons.duckduckgo.com`
- **保存策略**：新增时先存 `LETTER:X`，后台 `Image()` 预加载 DuckDuckGo favicon → Canvas 指纹比对（`isDDGPlaceholder`，48×48 + 像素 hash `-1750283373`）。真实 favicon 自动升级为 URL，DDG 占位图维持首字母。面板渲染时同样检测——已存 URL 若命中 DDG 占位图指纹自动回退彩色内圆
- img 加载失败 → JS 移除 img，显示彩色内圆 + 首字母

---

## 七、导航

| 当前状态 | Esc 行为 |
|---------|---------|
| 主列表 | 关闭面板 |
| 表单 / grid / recent / help | 返回主列表 |
| feedback | 不响应（2s 自动返回） |

- **点击跳转**：主列表和最近使用模式下，点击快捷链接行（列表模式）或图标（图标模式）→ 记录访问 → `window.open(url, '_self')` 跳转
- **编辑/删除/隐藏模式下点击不跳转**：这些模式下点击行或图标进入对应操作，不会触发 URL 跳转
- 点击面板外遮罩 → 关闭面板
- 新标签页点击页面空白 → 聚焦搜索栏

---

## 八、动效

- 打开：遮罩 fade-in 200ms + 面板 slide-up 220ms，Web Animations API，GPU 合成
- 关闭：遮罩 fade-out 150ms，完成后 `visibility: hidden`

---

## 九、CSP / 权限

- 禁止 HTML 内联 `style="..."`、`onclick`、`onerror`
- 样式通过 CSS class + JS `element.style.xxx`
- 事件通过 `addEventListener`
- `img-src` 含 `icons.duckduckgo.com`
- ⬇ 获取页面标题功能需要跨域 fetch：
  - manifest 声明 `optional_host_permissions: ["https://*/*", "http://*/*"]`，不随安装自动授予
  - 用户首次点击 🔗 时弹出权限请求对话框，用户同意后永久生效（同会话复用）
  - 用户拒绝或网页模式下 CORS 失败 → 回退提取域名作为名称

---

## 十、联动关系

```
Normal 面板                     Hidden 面板
┌─────────────────┐           ┌─────────────────┐
│ 显示：非隐藏链接  │           │ 显示：隐藏链接    │
│ add → 不进hidden │           │ add → 进hidden  │
│ hide → 移入hidden│           │ unhide → 移出   │
│ edit → 保留归属  │           │ edit → 保留归属   │
│ delete → 彻底删  │           │ delete → 彻底删  │
└─────────────────┘           └─────────────────┘
         ↕                            ↕
    ptab_shortcuts              ptab_shortcuts
    ptab_shortcut_hidden        ptab_shortcut_hidden
         ↕                            ↕
    同一份数据存储，通过 hidden 数组区分归属
```
