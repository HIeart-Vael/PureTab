# 命令面板需求规格

## 行为概述

命令面板是快捷链接管理中心，由 `js/command-palette.js` 实现，并在需要时由 `newtab.js` 懒加载 `css/command-palette.css` 和脚本。它独立于壁纸系统，数据保存在 `ptab_shortcuts` 和 `ptab_shortcut_icons`。

### 两套独立面板

| 面板 | 默认快捷键 | 鼠标打开 |
|------|-----------|---------|
| 普通面板 | `ctrl+k` | 双击页面空白区域 |
| 隐藏面板 | `ctrl+shift+k` | 鼠标中键点击 |

普通面板显示未隐藏链接；隐藏面板显示 hidden 列表中的链接。同一条链接只能属于其中一边。

互斥规则：

- 普通面板已打开时请求隐藏面板，显示普通模式提示，2 秒后消失。
- 隐藏面板已打开时请求普通面板，显示隐藏模式提示，2 秒后消失。
- 关闭面板会重置为普通状态，下次打开默认普通面板。

### 面板界面

命令面板容器在 `index.html` 中预置，实际逻辑懒加载。打开后：

1. 顶部固定命令栏。
2. 搜索输入框。
3. 内容区：主列表、表单、编辑/删除/隐藏网格、最近访问、帮助、反馈或清空确认。

普通面板命令：`add edit delete hide recent import export reset clear help`。

隐藏面板命令：`add edit delete unhide recent import export reset clear help`。

末尾视图按钮在列表/图标模式之间切换，并保存到 `ptab_shortcuts.settings.viewMode`。

### 数据模型

`ptab_shortcuts`：

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

`ptab_shortcut_icons` 是 `{ [shortcutId]: iconData }`。图标数据可以是 DuckDuckGo favicon URL，也可以是 `LETTER:X` 首字母 fallback。

### 命令行为

**add：** 表单包含名称和 URL。URL 为空拒绝；缺少协议自动补 `https://`；必须匹配 http/https host。名称为空时用域名。新增 URL 在全量 links 中去重，不区分普通/隐藏。隐藏面板中新增的链接自动加入 hidden。

**fetch title：** URL 输入旁的下载按钮会尝试 GET 页面并解析 `<title>`。扩展模式首次使用会请求 `http://*/*` 和 `https://*/*` 可选权限；失败时回退域名。

**edit：** 在当前面板范围内选择链接，编辑名称和 URL。编辑不改变 hidden 归属。

**delete：** 在当前面板范围内删除链接，同时删除图标、最近访问记录和 hidden 引用。

**hide / unhide：** 在普通面板把链接加入 hidden；在隐藏面板把链接移出 hidden。

**recent：** 显示当前面板范围内最近访问过的链接，最多 10 条。

**import：** 弹出文件选择器，接受 `.html/.htm` 书签文件；解析 `<a href>`，全量 URL 去重后批量加入快捷链接。不导入 PlainTab 全局配置。

**export：** 导出当前全部快捷链接数组为 JSON 文件，文件名包含日期。不导出壁纸、界面或语言配置。

**reset：** 将所有快捷链接的频率计数归零。

**clear：** 面板内二次确认后，清空快捷链接、图标、最近访问和 hidden 列表。

**help：** 显示命令说明。

### 视图模式

列表模式：

- 单列显示。
- 每项包含圆形图标、名称、URL。
- 推荐区在无搜索词且开启推荐时显示。

图标模式：

- 每页 15 项。
- 有推荐区时推荐占最多 5 个，A-Z 区每页 10 个。
- 无推荐或搜索结果每页 15 个。
- 通过滚轮或分页圆点翻页。
- 长名称可使用跑马灯效果。

推荐区按使用频率取当前面板范围内前 5 个，推荐项不在 A-Z 区重复出现。

### 导航

| 当前状态 | Escape 行为 |
|---------|-------------|
| 主列表 | 关闭面板 |
| 表单、编辑、删除、隐藏、最近、帮助、清空确认 | 返回主列表 |
| 反馈动画 | 忽略按键，约 2 秒后自动回主列表 |

主列表和最近访问中点击链接会记录访问次数和最近访问，并在当前页面 `_self` 跳转。编辑、删除、隐藏/取消隐藏模式下点击不会跳转。

## 约束清单

### URL 与安全

- 只接受 http/https 链接。
- 缺少协议时自动补 `https://`。
- 拒绝无法匹配主机名的 URL。
- 去重基于完整 URL 字符串，跨普通/隐藏全量比较。

### 图标

- favicon 使用 `https://icons.duckduckgo.com/ip3/<host>.ico`。
- 新增链接先保存首字母 fallback，再尝试显示 favicon。
- 若 favicon 加载失败或识别为服务默认占位图，显示首字母。
- 图标缓存写入 `ptab_shortcut_icons`，不要混入 `ptab_shortcuts` 主模型。

### 快捷键

- 快捷键配置由设置面板保存到 `ptab_shortcuts.settings`。
- `newtab.js` 在 Palette 未加载时也能读取保存的快捷键打开面板。
- 录制规则归设置面板维护；命令面板只负责读取和暴露 load/save 方法。

### 导入导出边界

- 当前 import/export 是命令面板功能，只处理快捷链接/书签。
- “导入/导出所有配置”尚未实现；不要在文档或 UI 中描述为已完成。

### 懒加载

- `command-palette.js` 不在首屏关键路径中同步加载。
- `ensurePalette()` 负责注入 CSS 和 JS；重复调用应复用同一个加载 Promise。
- 命令面板失败不应影响壁纸、搜索和设置基础功能。
