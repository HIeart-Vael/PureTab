# 性能规则（关键）

## 渲染（Rendering）

* 首次渲染必须“瞬时完成”（用户感知 < 50ms）
* 启动阶段禁止阻塞主线程
* 所有模块优先采用延迟初始化（lazy initialization）
* 非关键任务必须通过 `requestIdleCallback` 延迟执行

---

## DOM 规则（DOM Rules）

* DOM 更新必须批量执行（batch update）
* 避免布局抖动（layout thrashing），禁止读写交替操作
* 禁止在循环中触发强制重排（forced reflow）
* 动画仅允许使用 `transform` 和 `opacity`

---

## 图片系统（壁纸核心）

* 缩略图必须立即渲染（首帧可见）
* 高清图片必须异步加载
* 如可行，图片解码应避免占用主线程
* 只有在完全 decode 之后才允许进行交叉淡入（crossfade）

---

## 内存管理（Memory）

* 避免长期持有 DOM 引用
* 必须清理未使用的事件监听器
* 后台脚本不得产生内存泄漏

---

## 存储（Storage）

* IndexedDB 仅用于大数据存储
* UI 线程禁止同步存储操作
* 必须使用缓存机制，但需保证安全失效（cache invalidation）

---

## 反模式（Anti-patterns）

* 禁止启动时进行重型初始化
* 禁止对大数据集合进行同步遍历
* 禁止引入不必要的抽象层
