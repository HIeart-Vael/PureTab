如果收到的指令是完善此Task，AI 应当言简意赅、结构化、工程化的补充文本加以完善，输出要求之后的部分可以不动

# Task: <功能名称>

## 🎯 目标
一句话说明要实现什么

## 📌 背景
为什么要做这个（可选）

## 🧠 行为要求
必须满足的行为（重点）

- 必须做 A
- 必须做 B
- 不允许做 C

## ⚡ 性能约束
- 不可阻塞 UI
- 不可增加额外依赖

## 🧱 涉及模块
- 50-search.md
- 40-runtime.md

## 🚫 禁止行为
- 不允许改 architecture 文件
- 不允许改 rules 文件
- 不允许重构系统结构

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
