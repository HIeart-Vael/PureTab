# PlainTab Rules Index

本目录为 PlainTab 的系统级规则集合，用于约束 Claude Code 在修改代码时的行为。

---

## 🟥 核心规则（最高优先级，必须遵守）

- core-rules.md  
  → 全局行为约束，不可违反

---

## 🟧 系统架构层（核心运行机制）

这些规则定义系统如何运行：

- data-storage-spec.md  
  → localStorage + IndexedDB 数据一致性

- wallpaper-system-spec.md  
  → 双层壁纸系统、零闪白机制

- language-system-spec.md  
  → 多语言系统 + t() fallback 机制

- runtime-interaction-spec.md  
  → 启动流程 + 全局事件调度

---

## 🟨 UI 功能模块层

这些规则定义具体功能行为：

- search-bar-spec.md  
  → 搜索栏逻辑与引擎切换

- settings-panel-spec.md  
  → 设置面板 UI 与状态控制

- command-palette-spec.md  
  → 命令面板功能与交互

---

## 🟦 辅助信息（非核心决策依据）

- storage-version-history.md  
  → 数据结构版本记录，仅用于参考