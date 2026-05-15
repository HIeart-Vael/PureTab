# 🧠 PlainTab AI Router

> ⚠️ 用于 Claude Code / AI 自动定位修改路径
> 不参与运行时逻辑
> 核心作用：**输入需求 → 输出修改文件 + 修改策略**

---

## 🧩 0. 核心理念（非常重要）

PlainTab 的所有修改必须满足：

> ❗任何功能修改 = “路径问题”，不是“代码问题”

AI 不允许直接“改代码”，必须先做：

```
需求 → 路由 → 文件 → 风险 → 修改策略
```

---

## 🧭 1. 输入分类器（AI第一步）

任何需求必须归类：

### 🖼 A. 壁纸类

关键词：

* 白屏
* 闪烁
* 图片
* wallpaper
* preload

→ 核心链路：
preload.js → show.js → fetch.js → data.js

---

### 💾 B. 存储类

关键词：

* 丢数据
* IDB
* 缓存
* localStorage
* migration

→ 核心链路：
data.js（唯一入口）

---

### ⚡ C. 性能类

关键词：

* 卡顿
* 慢
* 首屏
* lag

→ 核心链路：
preload.js + newtab.js + show.js

---

### 🧭 D. 启动流程

关键词：

* 初始化
* load
* startup
* 顺序

→ 核心链路：
index.html → preload.js → newtab.js

---

### ⚙️ E. UI / 交互

关键词：

* 点击
* 面板
* 搜索
* 键盘

→ 核心链路：
newtab.js + palette.js

---

### 🌍 F. 国际化

关键词：

* language
* 翻译
* i18n

→ 核心链路：
languages.js + newtab.js(t)

---

## 🧭 2. 路由决策表（核心）

| 需求类型    | 第一修改文件     | 第二文件       | 禁止修改       |
| ------- | ---------- | ---------- | ---------- |
| 白屏 / 首帧 | preload.js | show.js    | data.js    |
| 壁纸错误    | show.js    | fetch.js   | preload.js |
| 图片获取失败  | fetch.js   | data.js    | preload.js |
| 数据丢失    | data.js    | -          | IDB直写      |
| UI卡顿    | newtab.js  | palette.js | preload.js |
| 面板问题    | palette.js | newtab.js  | data.js    |
| 启动慢     | preload.js | newtab.js  | show.js    |

---

## 🔥 3. 修改执行协议（强约束）

任何修改必须走 4 步：

---

### Step 1 — 找入口文件

必须从 router 表确定：

```
primary file
secondary file
```

---

### Step 2 — 找数据来源

三选一：

* IndexedDB（必须 via data.js）
* localStorage
* memory cache

---

### Step 3 — 找渲染层

必须确认：

* show.js 是否参与 DOM
* preload.js 是否影响首帧
* newtab.js 是否控制 UI

---

### Step 4 — 风险判断

必须检查：

* 是否影响首帧（❗最高风险）
* 是否破坏 IDB 一致性
* 是否绕过 data.js
* 是否影响 preload.js 同步执行

---

## 🧱 4. 核心架构（不可变）

```
index.html
   ↓
preload.js   ← 首帧（最高优先级）
   ↓
languages.js
   ↓
data.js      ← 存储中心
   ↓
fetch.js     ← 数据来源
   ↓
show.js      ← 渲染系统
   ↓
palette.js   ← UI系统
   ↓
newtab.js    ← 控制中心
```

---

## ⚠️ 5. 强制禁止规则（AI必须 obey）

❌ 禁止：

* 直接操作 IndexedDB
* preload.js 改 async / await
* show.js 绕过 data.js
* 修改加载顺序
* UI logic 写进 preload.js

✔ 必须：

* 存储 → data.js
* 渲染 → show.js
* 首帧 → preload.js
* 控制 → newtab.js

---

## 🧠 6. 白屏问题专用路径（关键）

当出现：

> white screen / flicker / blank frame

AI 必须自动走：

```
1. preload.js
2. show.js decode timing
3. image cache (data.js)
4. request timing (fetch.js)
```

---

## 🧬 7. 数据流模型（真实执行）

```
Bing API
   ↓
fetch.js
   ↓
data.js (IndexedDB Blob)
   ↓
show.js render
   ↓
preload.js fallback cache
```

---

## 🚀 8. AI最终输出格式（必须）

当 Claude 做修改时，必须输出：

```
[FILE]
xxx.js

[REASON]
为什么改这个文件

[CHANGE TYPE]
- performance / bugfix / refactor

[RISK]
- low / medium / high (impact preload? IDB? UI?)

[DEPENDENCIES]
- affected modules
```

---

# 🧠 这个版本的本质升级是什么？

你现在已经从：

### ❌ 文档系统

→

### ✅ “AI 路由系统”

---

# 🔥 你这个项目现在已经具备：

## 👉 AI-native 开发能力：

* 自动定位文件
* 自动判断风险
* 自动拆解修改路径
* 防止乱改 preload / IDB
* 强约束架构边界
