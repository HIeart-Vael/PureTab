# ⚙️ Claude Patch Engine v1（执行层）

> ⚠️ 本文件用于 AI 生成“代码修改方案 + diff”
> 不参与运行时逻辑
> 与 router 层配合使用

---

## 🧠 核心定位

如果说：

* router = 找到该改哪里
* patch engine = **生成怎么改**

---

## 🔁 输入 / 输出模型

### 输入（来自 router）

```txt id="k9x2a1"
target_files:
- preload.js
- show.js

problem:
white flash on first render

risk_level:
high
```

---

### 输出（AI必须生成）

```txt id="n4c8zz"
[PATCH PLAN]

[FILE] preload.js

[CHANGE TYPE] performance / critical fix

[GOAL]
避免首帧空白（zero flash）

[MODIFICATION]
- 将异步图片加载前移为同步 fallback
- 增加 memory cache check before first paint

[DIFF]

+ const cachedThumb = getCache();
+ if (cachedThumb) applyImmediately();

- await loadImage();
+ // moved to post-first-paint queue

[RISK]
HIGH - affects first paint pipeline

[ROLLBACK]
restore original preload sync flow
```

---

## 🧱 Patch 生成规则（核心逻辑）

### 1. 永远优先“最小修改”

❌ 错误：

* 重写 preload
* 重构 show.js
* 引入新抽象层

✔ 正确：

* 改 1~5 行逻辑
* 不改变架构
* 不新增模块

---

### 2. 严格禁止破坏首帧路径

```txt id="h3p9qq"
禁止：
- preload.js async 化
- await fetch in preload
- DOM delay injection
```

---

### 3. 所有修改必须归类

| 类型          | 说明               |
| ----------- | ---------------- |
| bugfix      | 修复逻辑错误           |
| performance | 优化首帧 / 渲染        |
| refactor    | 非结构性优化           |
| critical    | 影响 preload / IDB |

---

## 🧠 壁纸系统专用规则（重点）

### preload.js 修改原则

* 必须同步执行
* 不允许 await
* 必须保证 first paint 可见

---

### show.js 修改原则

* 只负责 render
* 不处理 fetch / storage
* 不做业务判断

---

### data.js 修改原则

* 唯一允许访问 IndexedDB
* 所有 cache 必须经过它
* 不允许 DOM 操作

---

## 🔥 白屏问题专用 Patch 模式

当 router 判断：

> white flash / blank frame

patch engine 必须输出：

```txt id="v8m2ld"
STEP 1: preload.js fix
STEP 2: cache layer adjustment (data.js)
STEP 3: decode timing fix (show.js)
STEP 4: verify no async in first paint
```

---

## 🧬 数据流约束（必须遵守）

```txt id="c3p9aa"
Bing API
  ↓
fetch.js
  ↓
data.js (cache layer)
  ↓
show.js (render)
  ↓
preload.js (fallback / instant render)
```

---

## ⚠️ 风险评级系统

### 🟢 LOW

* UI text change
* minor layout adjustment

### 🟡 MEDIUM

* show.js rendering logic
* fetch fallback logic

### 🔴 HIGH

* preload.js
* data.js (IDB)
* index.html loading order

---

## 🔁 rollback 必须包含

每个 patch 必须带：

```txt id="r1k8zz"
[ROLLBACK PLAN]

- restore previous preload.js version
- clear cache keys:
  - ptab_preview_thumb
  - ptab_bing_blob
```

---

## 🧠 最终输出标准（强制）

Claude 必须输出：

```txt id="x8c1aa"
1. 修改文件
2. 修改原因
3. diff（精确到行逻辑）
4. 风险等级
5. rollback plan
6. 是否影响首帧（YES/NO）
```

---
