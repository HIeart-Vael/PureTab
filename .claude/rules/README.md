# PlainTab Rules

本目录是 PlainTab 的系统规则源。所有 AI agent 修改代码前都应先读 `AGENTS.md`，再按任务读取这里的规则文件。

## Priority Map

1. `00-core.md`  
   全局行为约束、范围控制、验证要求。
2. `10-storage.md`  
   localStorage、IndexedDB、迁移、崩溃安全。
3. `20-wallpaper.md`  
   壁纸来源、双层渲染、零闪白、图片生命周期。
4. `30-language.md`  
   多语言字典、语言检测、fallback。
5. `40-runtime.md`  
   启动顺序、全局事件、面板互斥。
6. `50-search.md`  
   搜索栏、搜索引擎、扩展/网页模式差异。
7. `60-settings.md`  
   设置面板、模态窗口、设置项 UI。
8. `70-command-palette.md`  
   命令面板、快捷链接、快捷键、导入导出。
9. `90-storage-history.md`  
   存储结构历史，仅作参考。

## Naming Rules

- `00-*` 是所有任务都要遵守的基础规则。
- `10-40` 是运行时核心链路。
- `50-70` 是用户交互功能。
- `90-*` 是历史参考，不应作为新实现的唯一依据。

不要新增根目录 `ai/` 或 `js-architecture*` 文件；临时任务记录放在 `docs/ai-tasks/`。
