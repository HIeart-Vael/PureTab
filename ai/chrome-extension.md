# Chrome 扩展规则

## 架构（Architecture）

* 仅使用 Manifest V3
* 仅使用原生 JavaScript（Vanilla JS）
* 禁止使用前端框架
* 除非必要，否则禁止使用构建工具（bundler）

---

## 启动（Startup）

* 新标签页必须做到“瞬时可渲染”
* 避免阻塞 service worker 启动流程
* 启动路径必须保持最短执行链路

---

## 安全（Security）

* 禁止远程代码执行（Remote Code Execution）
* 禁止动态脚本注入（Dynamic Script Injection）

---

## 性能（Performance）

* 后台脚本必须保持轻量
* 尽量减少 message passing（消息通信）开销
* 避免不必要的跨上下文通信

---

## 约束（Constraints）

* 仅申请必要权限（least privilege principle）
* 保持扩展体积与运行时 footprint 尽可能最小
