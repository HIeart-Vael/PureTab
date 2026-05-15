```md
# CLAUDE.md

本文件用于指导 Claude Code（claude.ai/code）在本仓库中进行代码理解、修改与架构决策。

---

## 项目概述

PlainTab 是一个 Chrome/Edge 浏览器扩展（Manifest V3），用于替换新标签页。

核心特性：
- 零闪白极简壁纸体验
- 双层壁纸渲染（Back / Front）
- 首帧即渲染的性能优先设计
- 可作为独立网页运行
- 零外部依赖，无构建流程（纯原生 JS + CSS）

---

## 开发约束

本项目不使用：

- 构建工具
- npm / package.json
- 前端框架（React / Vue / Svelte）
- lint / test 工具

技术栈：
- 原生 JavaScript
- 原生 CSS
- ES Modules（允许）

---

## 运行方式

### 扩展模式
- chrome://extensions
- 开启开发者模式
- 加载已解压扩展
- 选择项目目录

### 网页模式
- 直接打开 index.html

---

## 规则系统（非常重要）

本项目存在三层规则体系：

---

### 1. 系统级规则（最高优先级）

路径：`.claude/rules/`

说明：
- 定义系统架构
- 定义数据一致性与存储规则
- 定义运行时行为
- 定义不可违反的核心约束

👉 修改任何核心功能前必须阅读对应规则文件

---

### 2. 项目级规则（本文件 CLAUDE.md）

说明：
- 项目结构说明
- 模块划分方式
- 开发流程与约束
- 系统运行机制概览

👉 用于任务理解与执行方式，不是底层规则

---

### 3. AI 行为规范（参考）

路径：`AGENTS.md`

说明：
- 性能优化原则
- UI 约束
- DOM 操作规范
- anti-overengineering 指导
- 调试规范

👉 在不违反 `.claude/rules/` 的前提下应当遵守

---

## 规则优先级（关键）

1. `.claude/rules/core-rules.md`（最高优先级）
2. `.claude/rules/` 其他文件
3. `CLAUDE.md`
4. `AGENTS.md`

---

## 架构总览（8 个模块）

- data-storage-spec.md → 数据存储与一致性
- language-system-spec.md → 多语言系统与 fallback
- wallpaper-system-spec.md → 双层壁纸渲染
- search-bar-spec.md → 搜索栏与引擎切换
- settings-panel-spec.md → 设置面板 UI
- local-gallery-spec.md → 本地图库与 Blob 生命周期
- command-palette-spec.md → 命令面板系统
- runtime-interaction-spec.md → 全局交互与启动流程

---

## 文件加载顺序（关键）

index.html：

1. #wallpaperBack 必须先存在
2. preload.js（首帧同步执行）
3. #wallpaperFront
4. 其他 DOM
5. languages.js
6. newtab.js

👉 preload.js 是零闪白核心，不可调整顺序

---

## 双层壁纸系统

Back 层：
- 当前稳定壁纸
- 保证首帧可见

Front 层：
- 新壁纸过渡层
- decode 完成后淡入
- 550ms 后同步回 Back

原则：
> 永远不能出现空白帧

---

## 运行模式

### 扩展模式
- chrome.search.query()
- UI 简化
- 无引擎选择器

### 网页模式
- window.open 跳转
- 完整搜索引擎支持

---

## 存储系统

IndexedDB：
- DB：PlainTab
- Store：wallpaper
- 存储图片 Blob

localStorage：
- 设置
- 缩略图
- 元数据

---

## 崩溃安全原则

核心原则：

先写数据，再写引用  
先断引用，再删数据

用于避免：
- 半写入状态
- 数据丢失
- 孤儿 Blob
- 状态不一致

---

## 已知关键问题

- IndexedDB Blob 可能丢失 MIME 类型
- preview_thumb 存在竞态写入问题
- Blob URL 必须显式 revoke
- 面板互斥逻辑必须幂等

---

## CSP 约束

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

## 提交规范

Conventional Commits：

feat:
fix:
perf:
refactor:
chore:
docs:

---

## 项目结构

- index.html → 新标签页入口
- js/preload.js → 首帧壁纸渲染
- js/newtab.js → 主逻辑
- js/languages.js → 多语言系统
- css/newtab.css → 样式系统
- .claude/rules/ → 系统级规则
- AGENTS.md → AI 行为规范
```
