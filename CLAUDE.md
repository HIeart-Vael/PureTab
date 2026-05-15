# CLAUDE.md

本文件用于指导 Claude Code（claude.ai/code）在本仓库中进行代码理解、修改与架构决策。

## 🧠 AI SYSTEM BOOT RULE（必须执行）

本项目是一个结构化 Chrome Extension 工程，AI 在执行任何任务前必须建立以下认知模型：

---

### 🟥 L1 - System Truth Layer（绝对真相层）

路径：
.claude/rules/**

特性：
- 唯一真实运行规则来源
- 定义系统行为、数据一致性、运行约束
- 优先级最高，不可违反

👉 AI 必须以该层作为所有决策最终依据

---

### 🟨 L2 - Architecture Memory Layer（结构记忆层）

路径：
ai/**/js-architecture*.md

特性：
- 描述系统结构与历史演化
- 可能存在滞后或部分过时
- 仅用于辅助理解，不是运行规则

👉 禁止将其视为运行时真相
👉 只能用于推断系统结构

---

### 🟦 L3 - Task Context Layer（任务层）

用户当前 Task 描述

特性：
- 只定义目标，不保证与系统一致
- 可能冲突或不完整

👉 必须被 L1 覆盖
👉 必须在冲突时以系统规则为准

---

## ⚖️ 冲突优先级（强制）

.claude/rules/**
    > Task Prompt
    > ai architecture docs

---

## 🧠 行为约束（必须遵守）

- 禁止整体重构已有模块
- 禁止修改 architecture 历史记录（仅 append）
- 所有结构修改必须最小化影响范围
- 优先保证 runtime 连续性 > 代码优雅性
- preload.js 执行顺序绝对不可改变

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

禁止引入：

- 构建工具（Webpack / Vite / Rollup 等）
- npm / package.json
- 前端框架（React / Vue / Svelte 等）
- lint / test 框架
- 运行时大型依赖

技术栈：

- Vanilla JavaScript
- 原生 CSS
- ES Modules（允许）

---

## 🧠 规则系统（最高优先级系统）

本项目存在三层规则系统：

---

### 🟥 Level 0：系统真理层（绝对最高优先级）

路径：

```

.claude/rules/

```

说明：

- 定义系统架构
- 定义数据一致性
- 定义崩溃安全机制
- 定义运行时行为
- 定义模块边界与依赖关系

👉 修改任何代码前必须优先读取相关 rules 文件  
👉 不得违反其中任何规则

---

### 🟧 Level 1：AI 行为策略层（辅助决策）

路径：

```

ai/

```

包含：

- performance.md
- ui-style.md
- chrome-extension.md
- anti-overengineering.md
- analysis/
- engine/
- guard/
- router/

说明：

- 用于指导实现方式
- 不定义系统真理
- 可被 Level 0 覆盖

---

### 🟨 Level 2：架构分析与增强层（可选参考）

路径：

```

js-architecture*.md

```

包括：

- js-architecture.md（全局架构分析）
- js-architecture.ai-router.md
- js-architecture.patch-engine.md
- js-architecture.guardrails.md

说明：

- 用于 AI 理解系统结构
- 不参与运行
- 不可影响核心规则判断
- 仅用于辅助推理

---

## 📊 规则优先级（关键）

优先级从高到低：

1. `.claude/rules/core-rules.md`（绝对最高）
2. `.claude/rules/` 其他所有文件
3. `ai/` 行为策略
4. `js-architecture*.md`（仅分析参考）
5. CLAUDE.md（本文件）

---

## 📁 系统结构总览

```

.claude/rules/     → 系统真理层（不可违反）
ai/                → AI 行为策略层
js-architecture*   → 架构分析层（只读理解）

```

---

## 🧱 核心模块系统

系统由 8 个模块组成：

- data-storage-spec.md → 数据一致性 / IDB / LS
- language-system-spec.md → 多语言 fallback
- wallpaper-system-spec.md → 双层壁纸系统
- search-bar-spec.md → 搜索系统
- settings-panel-spec.md → UI 状态管理
- local-gallery-spec.md → 本地图片生命周期
- command-palette-spec.md → 命令面板
- runtime-interaction-spec.md → 启动与交互调度

---

## 📊 js-architecture 文件规则（强约束）

路径：
- ai/analysis/js-architecture.md
- ai/engine/js-architecture.patch-engine.md
- ai/guard/js-architecture.guardrails.md
- ai/router/js-architecture.ai-router.md

### 🚫 禁止行为
- 禁止修改或重写已有历史内容
- 禁止删除历史段落
- 禁止合并文件
- 禁止重构文件结构
- 禁止将其迁移到 .claude/rules/

### 🟡 唯一允许行为（核心）
- 只能追加（append-only）
- 可以新增 section（必须保留旧内容）
- 可以写 changelog（推荐）
- 可以补充分析结论，但不能改旧结论

### 🧠 本质定位
这些文件是：

> AI 架构演化日志（immutable reasoning trace）

不是设计文档，不是规范文件，不是实现依据。

---

## ⚡ 启动顺序（强约束）

index.html 必须按顺序执行：

1. #wallpaperBack 必须先存在
2. preload.js（首帧同步执行）
3. #wallpaperFront
4. 其余 DOM
5. languages.js
6. newtab.js

👉 preload.js 是零白屏核心，不可移动

---

## 🖼 双层壁纸系统

Back：
- 永久显示当前壁纸
- 保证首帧渲染

Front：
- 用于新图过渡
- decode 完成后淡入
- 550ms 后同步回 Back

原则：

> 永远保证至少一层有内容，禁止空白帧

---

## 💾 存储系统

IndexedDB：
- DB: PlainTab
- Store: wallpaper

localStorage：
- settings
- thumbnails
- metadata

---

## 🛡 崩溃安全原则

核心原则：

先写数据，再写引用  
先断引用，再删数据

防止：

- 半写入状态
- 数据丢失
- orphan blob
- 状态不一致

---

## 🚫 CSP 约束

禁止：

- inline script
- inline style
- eval()
- 动态注入脚本

允许：

- addEventListener
- class/style 操作
- 静态资源加载

---

## 🛠 修复模式规则（强约束）

当执行 fix task 时：

### 必须遵守
- 只允许最小范围修改（minimal diff）
- 禁止重构任何模块结构
- 禁止优化代码结构
- 禁止引入新抽象
- 禁止修改非相关文件

### 修复原则
> Fix the bug, do not improve the system.

---

## 📦 提交规范

Conventional Commits：

feat:
fix:
perf:
refactor:
chore:
docs:

---

## 🧠 核心设计原则

- 性能优先于结构
- 首帧优先于完整性
- DOM 操作优先于抽象
- 连续渲染优先于状态一致性
- 禁止过度工程化
```
