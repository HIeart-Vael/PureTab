# Task: 升级设置面板为二级面板（一级面板 + 模态窗口）

## 🎯 目标

将当前单个设置面板拆分为两层，严格对照 [60-settings.md](../../.claude/rules/60-settings.md)：

- **一级面板**（齿轮按钮弹出）：壁纸来源标签 + 计数 + 副信息 + 画廊（local 模式）+ 底部栏（高级设置按钮 + GitHub + 版本号）
- **模态窗口**（Ctrl+Shift+W 或「高级设置」打开）：居中浮动，左侧 4 个分页标签（界面 / 壁纸 / 快捷键 / 关于），右侧内容区

当前仅支持 bing 和 local(上传) 两种来源，folder/rss/api 的相关 UI 一律不加。

## 📌 背景

当前一级面板把所有设置（壁纸信息、上传、画廊、高级设置控件）混在一起，不符合二级面板规范。拆分为两层后，日常只需一级面板查看壁纸状态，需要改设置时再打开模态窗口。

## 🧠 行为要求

### 一级面板（#settingsPanel 改造）

- 顶部：壁纸来源标签 —— Bing 蓝色圆角标签、Local 绿色圆角标签
- 壁纸计数：local 模式显示「N/12」，bing 不显示
- 副信息行：bing 显示市场区域 + 缓存日期，local 显示「本地轮换」
- 画廊：local 模式保留现有画廊（缩略图网格 + 删除 + 上传 + 拖拽排序），bing 模式隐藏画廊
- 底部栏：左侧「高级设置」按钮 → 打开模态窗口；右侧 GitHub 图标链接；底部版本号文字
- 移除：现有 Advanced 折叠区（searchMode/opacity/engine/cpHotkey/cpRecommend/resetAdv），迁移到模态窗口
- 打开/关闭逻辑、互斥规则保持不变（与语言面板互斥，点击外部/Escape 关闭）

### 模态窗口（新增 #modalOverlay + #modalWindow）

- **界面分页**：搜索栏显示模式、搜索栏位置（新增，默认居中）、搜索栏圆角（新增，默认胶囊）、壁纸遮罩不透明度（新增滑块 0~0.6，默认 0）、图标透明度、搜索引擎选择（扩展模式下隐藏该行）、恢复默认按钮
- **壁纸分页**：Bing / 本地上传 两项，当前选中高亮。Bing 下方提示无需配置；本地上传下方提示在一级面板上传。点击切换来源
- **快捷键分页**：命令面板快捷键录制、隐藏面板快捷键录制（新增）、显示推荐复选框
- **关于分页**：PlainTab 名称、版本号 v3.2.0、简介、GitHub 链接、作者、许可证（纯展示）
- 打开：关闭一级面板，搜索栏/语言面板/命令面板独立不受影响
- 关闭：Escape 或点击遮罩

### 新增设置项（此前未实现）

- `ptab_search_position`：搜索栏垂直位置，默认 `'center'`，值 `top/upper/center/lower/bottom`
- `ptab_overlay_opacity`：壁纸遮罩不透明度，默认 `0`，范围 0~0.6
- `ptab_search_radius`：搜索栏圆角，默认 `'capsule'`，值 `capsule/rounded/sharp`
- `ptab_shortcut_hidden_hotkey`：隐藏面板快捷键，默认 `'ctrl+shift+k'`

## ⚡ 性能约束

- 不可阻塞 UI
- 不可增加额外依赖
- 模态窗口 DOM 首次打开时创建（惰性初始化），之后复用

## 🧱 涉及模块

修改文件：
- `index.html`：新增模态窗口 DOM 结构，改造 #settingsPanel
- `css/settings.css`：新增模态窗口样式，调整一级面板样式
- `js/newtab.js`：改造一级面板渲染，新增模态窗口逻辑，新增 4 个设置项的读写
- `js/languages.js`：新增模态窗口相关翻译 key（如缺失则补充）

参考规则（只读，不可修改）：
- `60-settings.md`：一级面板 + 模态窗口行为定义
- `40-runtime.md`：面板互斥规则、快捷键规则
- `50-search.md`：搜索栏位置/圆角/遮罩的 CSS 变量约定
- `10-storage.md`：新增 key 的命名与默认值

---

## 🧠 修改范围

允许修改：
- js/newtab.js
- index.html
- css/*
- js/languages.js（仅补 key）

禁止修改：
- .claude/rules/**
- 根目录 ai/ 或 js-architecture* 文件（已废弃）
- palette.js
- wallpaper/data/fetch/show 结构
- 新增 JS 文件

---

## 🚫 禁止行为

- ❌ 不重构已有架构模块
- ❌ 不新增 JS 文件
- ❌ 不重建根目录 ai/ 或 js-architecture 历史文件
- ❌ 不引入新依赖
- ❌ 不改变 preload.js 顺序机制

---

## ⚡ 性能约束

- 不阻塞主线程
- DOM 操作必须最小化
- 不新增复杂抽象
- modal / UI 必须 lazy init
- 所有交互保持即时响应

---

## 🧱 涉及模块

参考：

- 10-storage.md
- 40-runtime.md
- 60-settings.md
- 50-search.md

---

## 📦 输出要求（强制）

必须完成以下三步：

---

### ① CODE CHANGES

直接修改代码（最小改动原则）

---

### ② TASK NOTE UPDATE（如有必要）

如果修改影响启动流程、存储、面板结构或事件绑定，在当前任务文档追加 `Architecture Notes` 小节。

格式建议如下：

* time: <YYYY-MM-DD>
* module: <module-name>
* change summary: <what changed>
* reason: <why changed>
* affected files: <files>
* runtime impact: <impact on execution flow>
* performance impact: <perf impact>
* risk level: low | medium | high

---

### ③ ARCHITECTURE IMPACT SUMMARY（必须输出）

必须在回复中包含：

## ARCHITECTURE IMPACT

* affected modules:
* runtime change:
* performance impact:
* risk:

---

## 🧠 触发任务记录更新规则

以下修改必须更新当前任务文档的 `Architecture Notes`：

- 修改 js/newtab.js
- 修改 preload.js
- 修改 DOM 渲染顺序
- 修改 storage / IndexedDB
- 修改 UI 面板结构
- 修改事件绑定逻辑

---

## 📁 写入规则（强制）

所有任务记录更新必须写入当前 `docs/ai-tasks/` 任务文档。


禁止写入：
- root
- .claude/rules
- 根目录 ai/
- js-architecture* 文件

---

## 🚨 完成判定（HARD GATE）

任务只有在以下全部完成时才算完成：

1. 功能实现完成
2. 无明显 console error
3. UI 行为正确
4. 如有架构影响，当前任务文档已追加 Architecture Notes
5. Architecture Notes 格式符合规范

❗缺一项 = 任务未完成

---

## 🧠 ARCHITECTURE NOTES FORMAT（强制结构）

* time:
* module:
* change summary:
* reason:
* affected files:
* runtime impact:
* performance impact:
* risk level:

---

## 🔁 重要原则

- 优先最小改动
- 禁止过度设计
- 保持首帧性能优先
- UI 连续性优于结构完美性
