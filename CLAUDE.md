```md
# CLAUDE.md

本文件用于指导 Claude Code（claude.ai/code）在本仓库中进行代码理解、修改与架构决策。

---

## 📌 项目概述

PlainTab 是一个 Chrome/Edge 浏览器扩展（Manifest V3），用于替换新标签页。

核心特性：
- 零闪白极简壁纸体验
- 双层壁纸渲染系统（Back / Front）
- 首帧即渲染的性能优先设计
- 可作为独立网页运行
- 零外部依赖，无构建流程（纯原生 JS + CSS）

---

## 🚫 开发约束（硬性）

本项目禁止引入以下内容：

- 构建工具（Webpack / Vite / Rollup 等）
- npm / package.json
- 前端框架（React / Vue / Svelte 等）
- lint / test 框架
- 运行时大型依赖

技术栈限制：
- Vanilla JavaScript（原生 JS）
- 原生 CSS
- ES Modules（允许）

---

## ▶️ 运行方式

### 扩展模式（Chrome / Edge）
1. 打开 `chrome://extensions`
2. 开启开发者模式
3. 加载“已解压扩展”
4. 选择本项目目录

### 网页模式（调试）
- 直接打开 `index.html`

---

## 🧠 规则系统（非常重要）

本项目存在三层规则体系：

---

### 🟥 1. 系统级规则（最高优先级，必须严格遵守）

路径：
```

.claude/rules/

```

定义内容：
- 系统架构
- 数据一致性规则
- 崩溃安全机制
- 运行时行为逻辑
- 模块边界与依赖关系

👉 任何功能实现前必须读取相关规则文件  
👉 不得违反其中任何约束

---

### 🟨 2. 项目级行为规则（本文件）

本文件（CLAUDE.md）定义：

- 项目结构说明
- 模块划分方式
- 开发流程与约束
- 文件加载顺序
- 系统运行机制概览

👉 用于“任务理解与执行方式”，不是底层规则

---

### 🟦 3. AI 开发规范（参考约束）

路径：
```

AGENTS.md

```

定义内容：
- 性能优化原则
- UI 设计约束
- DOM 操作规范
- anti-overengineering 原则
- 调试方法规范

👉 在不违反 `.claude/rules/` 的前提下应当遵守  
👉 用于指导实现方式，不具备系统级优先级

---

## 📊 规则优先级（关键）

1. `.claude/rules/core-rules.md`（绝对最高优先级）
2. `.claude/rules/` 其他所有文件
3. `CLAUDE.md`（本文件）
4. `AGENTS.md`（软约束）

---

## 🧱 架构总览（8 大模块）

系统由以下模块构成：

- data-storage-spec.md → 数据存储 / IndexedDB / localStorage 一致性
- language-system-spec.md → 多语言系统 + fallback 机制
- wallpaper-system-spec.md → 双层壁纸 + 零闪白渲染
- search-bar-spec.md → 搜索栏 + 多引擎切换
- settings-panel-spec.md → 设置面板 UI 与状态管理
- local-gallery-spec.md → 本地图片管理 + Blob 生命周期
- command-palette-spec.md → 命令面板系统
- runtime-interaction-spec.md → 启动流程 + 全局交互调度

---

## ⚡ 文件加载顺序（强约束）

index.html 执行顺序必须保持：

1. `#wallpaperBack` 必须先存在
2. `preload.js`（首帧前同步执行）
3. `#wallpaperFront`
4. 其他 DOM 元素
5. `languages.js`
6. `newtab.js`

👉 preload.js 是“零闪白机制核心”，禁止调整顺序

---

## 🖼 双层壁纸系统（核心机制）

### Back 层（稳定层）
- 永久持有当前壁纸
- 用于首帧直接渲染

### Front 层（过渡层）
- 用于新壁纸加载
- decode 完成后淡入
- 550ms 后同步回 Back

### 核心原则：
> 永远保证至少一层已有可渲染内容，禁止空白帧

---

## 🔄 运行模式

### 扩展模式
- 使用 `chrome.search.query()`
- UI 简化
- 无搜索引擎选择器

### 网页模式
- 使用 `window.open`
- 支持完整搜索引擎切换

---

## 💾 存储系统

### IndexedDB
- DB：PlainTab
- Store：wallpaper
- 存储内容：图片 Blob

### localStorage
- 设置项
- 缩略图（base64）
- 元数据

---

## 🛡 崩溃安全原则（非常重要）

核心规则：

> 先写数据，再写引用  
> 先断引用，再删除数据

用于避免：
- 半写入状态
- 数据丢失
- 孤儿 Blob
- 状态不一致

---

## ⚠️ 已知关键问题（必须注意）

- IndexedDB Blob 可能丢失 MIME 类型（需手动修复）
- preview_thumb 存在竞态写入问题（必须同步更新）
- Blob URL 必须显式 revoke，否则内存泄漏
- UI 面板存在互斥关系，关闭操作必须幂等

---

## 🚫 CSP 安全约束

禁止：
- inline style
- inline script
- eval()
- 动态脚本注入

允许：
- addEventListener
- class / style 操作
- 静态资源加载

---

## 📦 提交规范

使用 Conventional Commits：

- feat:
- fix:
- perf:
- refactor:
- chore:
- docs:

---

## 📁 项目结构

- index.html → 新标签页入口
- js/preload.js → 首帧壁纸渲染
- js/newtab.js → 主逻辑
- js/languages.js → 多语言系统
- css/newtab.css → 样式系统
- .claude/rules/ → 系统级规则（核心）
- AGENTS.md → AI 行为规范（软约束）

---

## 🧠 关键设计原则总结

- 性能优先于结构
- 首帧优先于完整性
- DOM 直接操作优于抽象封装
- 渲染连续性优于状态一致性（在可控范围内）
- 禁止过度工程化
```
