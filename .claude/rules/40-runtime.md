# 全局交互需求规格

## 行为概述

全局运行时由 `index.html`、`js/preload.js`、`js/settings-bootstrap.js`、`js/newtab.js` 和按需加载的完整设置/命令面板组成。目标是：首屏快速、壁纸不断层、设置和命令面板按需加载。

### 启动顺序

`index.html` 的加载顺序是零白屏设计的一部分：

1. `#wallpaperBack`
2. 同步 `js/preload.js`
3. `#wallpaperFront`
4. RSS 信息层、搜索栏、角落按钮、一级设置面板、语言面板、模态容器、命令面板容器
5. `js/languages.js`
6. `js/wallpaper/data.js`
7. `js/wallpaper/show.js`
8. `js/wallpaper/folder.js`
9. `js/wallpaper/fetch.js`
10. `js/settings-bootstrap.js`
11. `js/newtab.js`

不要移动 `preload.js`，不要给它加 `async/defer`，不要让它访问网络、IDB、canvas、`WallpaperData` 或文件系统接口。

### 启动流程

`newtab.js` 在 DOM ready 后：

1. 获取 `window.SettingsPanel` bootstrap。
2. 调用 `WallpaperData.migrate()`，当前实现只确保 schema baseline。
3. 初始化设置 bootstrap：读取 UI、语言、当前壁纸源，应用 CSS 变量和基础事件。
4. 加载当前壁纸源，失败时回退 Bing。
5. 绑定全局鼠标/键盘事件。
6. 空闲阶段预热完整设置面板和命令面板。

完整设置面板 `js/settings-panel.js` 和命令面板 `js/command-palette.js` 都是懒加载：用户打开或空闲预热时才注入脚本。

### 运行环境检测

扩展模式判定：`chrome.runtime.id` 存在。

当前实现差异：

- 扩展模式隐藏搜索引擎选择行，搜索图标显示静态放大镜且不可点击。
- 网页模式显示搜索引擎选择，点击搜索图标循环切换 Google/Bing/Baidu/DuckDuckGo。
- 搜索执行当前统一使用保存的搜索 URL 模板跳转；没有调用 `chrome.search.query`。

### 键盘快捷键

全局 keydown 分发：

| 快捷键 | 行为 |
|--------|------|
| Escape | 若命令面板打开，先交给命令面板；否则关闭设置/语言/模态面板并隐藏角落按钮 |
| 主命令面板快捷键 | 默认 `ctrl+k`，打开普通命令面板 |
| 隐藏命令面板快捷键 | 默认 `ctrl+shift+k`，打开隐藏命令面板 |
| Ctrl/Cmd+Shift+W | 切换设置模态窗口：已打开则关闭，否则打开 |
| Enter（搜索框聚焦） | 执行搜索 |

命令面板打开时，键盘导航优先交给 `window.Palette.handleKeyNav(e)`。如果普通/隐藏面板已打开，再尝试打开另一种模式，由命令面板内部显示 2 秒提示而不是切换模式。

### 鼠标行为

**右上角热区：** 鼠标进入距右边 180px、顶部 130px 的区域时，设置和语言按钮显示；离开后延迟 400ms 隐藏。设置或语言面板打开时不隐藏。

**搜索栏：** `always` 模式始终可见；`hover` 模式下搜索栏本身保留透明可命中的区域，鼠标进入该区域或获得 `.visible` 时显示，移开 150ms 后隐藏；`never` 模式不可见且不可聚焦。

**壁纸点击：** 只有搜索栏是 `always` 模式时，点击非 UI 区域才会聚焦搜索框。`hover` 和 `never` 不通过壁纸点击聚焦。

**命令面板鼠标入口：** 双击页面空白区域打开普通面板；鼠标中键点击打开隐藏面板。

### 面板协调

| 面板 | 打开方式 | 关系 |
|------|---------|------|
| 一级设置面板 | 角落齿轮按钮 | 与语言面板互斥；完整设置打开时关闭 |
| 语言面板 | 角落语言按钮 | 与一级设置面板互斥 |
| 设置模态窗口 | Ctrl/Cmd+Shift+W 或一级面板入口 | 独立遮罩；打开时由完整设置模块管理 |
| 命令面板 | 快捷键 / 双击 / 中键 | 独立覆盖层；打开时不主动关闭设置或语言面板 |

关闭函数必须幂等。点击面板外区域关闭对应面板；点击面板内部不能透传成外部关闭。

### 空闲预热

`schedulePanelWarmup()` 在 `requestIdleCallback` 中预热完整设置和命令面板；没有 `requestIdleCallback` 时用延迟 `setTimeout`。预热失败应被吞掉，不影响主页面。

## 约束清单

- 启动路径优先保证壁纸首帧，非关键模块用懒加载或空闲加载。
- 全局鼠标移动使用 `requestAnimationFrame` 节流，避免每次 mousemove 同步改 DOM。
- 只通过 `SettingsPanel`/`SettingsPanelFull`/`Palette` 暴露的 API 协调面板。
- 不在 `newtab.js` 中直接实现完整设置面板或命令面板业务逻辑。
- `window.reloadWallpaper` 是设置面板在删除/应用/重置后触发壁纸重载的入口。
