# 🧠 AI Guardrails（系统安全约束层）

> ⚠️ 本文件定义“AI允许做什么 / 禁止做什么”
> 优先级高于 patch-engine
> 高于 ai-router 的建议输出

---

## 🚨 核心原则（最高优先级）

```txt id="k2m9zz"
1. preload.js 永远不可被破坏
2. 首帧渲染路径不可增加任何 async 阻塞
3. IndexedDB 改动必须保持向后兼容
4. 不允许为了“优化结构”而重写稳定系统
```

---

## 🧱 首帧系统保护（CRITICAL）

### ❌ 禁止行为

```txt id="p9m2aa"
- 在 preload.js 中使用 await
- 引入 Promise / fetch / async 初始化
- DOM ready 后再写 wallpaperBack
- 改变 DOM 加载顺序（index.html）
```

---

### ✔ 强制规则

```txt id="q1m8bb"
- wallpaperBack 必须在首帧同步写入
- preload.js 必须 ≤ 50ms 完成
- 所有 fallback 必须同步可用
- decode 只能在 front layer
```

---

## 🧠 数据层保护（IndexedDB）

### ❌ 禁止

```txt id="d7m2cc"
- 修改 store 名称（wallpaper）
- 改 Blob 存储结构而不做 migration
- 在 UI thread 做同步 storage blocking
```

---

### ✔ 必须

```txt id="f3m9dd"
- 所有 DB 改动必须带 migration function
- 所有写入必须 append-safe
- 删除必须遵循“先断引用再删数据”
```

---

## 🎨 渲染系统保护（Wallpaper Core）

### ❌ 禁止

```txt id="h2k8ee"
- 在 show.js 中加入 fetch / API logic
- 在 render path 中做复杂计算
- 在 animation 中触发布局重排
```

---

### ✔ 必须

```txt id="j9m2ff"
- show.js 只负责 render + transition
- fetch.js 只负责网络
- data.js 只负责存储
```

---

## ⚡ 性能红线（Hard Limits）

```txt id="n3m8gg"
- 禁止 layout thrashing（读写 DOM 交叉）
- 禁止 preload 阶段任何网络请求
- 禁止 main thread long task > 50ms
- 禁止启动阶段 lazy-load UI 核心模块
```

---

## 🧠 AI 行为约束（非常关键）

### ❌ AI 不允许做

```txt id="r8m2hh"
- 不允许重构整个文件结构
- 不允许“统一架构风格”式修改
- 不允许增加抽象层（除非减少复杂度）
- 不允许拆分文件超过必要程度
```

---

### ✔ AI 只允许做

```txt id="t1m9ii"
- 修 bug（局部）
- 增强性能（局部）
- 添加 fallback
- 微调逻辑路径
```

---

## 🔁 修改优先级规则

```txt id="u3m8jj"
1. 首帧安全（preload / wallpaperBack）
2. 数据一致性（IDB / localStorage）
3. 渲染正确性（show.js）
4. UI 优化
5. 代码结构优化（最低优先级）
```

---

## 🚫 过度优化禁止原则

```txt id="v7m2kk"
If system works → do NOT refactor

Every abstraction must:
- reduce real complexity
- OR be used in ≥ 2 places
```

---

## 🧩 AI Router / Patch Engine 关系

```txt id="x2m9ll"
Guardrails > Patch Engine > AI Router
```

含义：

* guardrails：能不能做（权限）
* router：去哪里改（定位）
* patch engine：怎么改（执行）

---

## 🧠 白屏系统专项保护

```txt id="z8m2mm"
White flash prevention rules:

- preload.js must execute before first paint
- wallpaperBack must always have valid image
- fallback image must be synchronous
- decode must never block initial render
```

---

## 📦 版本稳定性规则

```txt id="a1m9nn"
- 不允许破坏旧 localStorage keys without migration
- 不允许删除 IndexedDB fields without fallback
- 所有 breaking change 必须显式标记
```

---

## 🧠 一句话定义

> Guardrails = “AI不能越界的宪法层”
