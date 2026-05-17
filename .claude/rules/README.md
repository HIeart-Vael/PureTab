# PlainTab Rules

本目录是 PlainTab 的系统规则源。所有 AI agent 修改代码前都应先读 `AGENTS.md`，再按任务读取这里的规则文件。

这些规则描述的是**当前项目实现**，不是早期设计稿。若规则与代码不一致，先以实际代码为准，再把规则同步回来。

## Priority Map

1. `00-core.md`  
   全局行为约束、范围控制、验证要求。
2. `10-storage.md`  
   localStorage、IndexedDB、迁移入口、崩溃安全。
3. `20-wallpaper.md`  
   壁纸来源、双层渲染、零闪白、图片生命周期。
4. `30-language.md`  
   多语言字典、语言检测、fallback、Bing 市场映射。
5. `40-runtime.md`  
   启动顺序、全局事件、面板协调、懒加载。
6. `50-search.md`  
   搜索栏、搜索引擎、扩展/网页模式差异。
7. `60-settings.md`  
   设置面板、模态窗口、壁纸草稿应用交互。
8. `70-command-palette.md`  
   命令面板、快捷链接、快捷键、书签导入和快捷链接导出。
9. `90-storage-history.md`  
   存储结构历史，仅作参考；新实现以 `10-storage.md` 和当前代码为准。

## Current Snapshot

- PlainTab 是 Chrome/Edge Manifest V3 新标签页扩展，也可直接打开 `index.html` 作为网页运行。
- 项目使用原生 JavaScript、CSS 和静态资源；不引入构建工具、框架、`npm` 或运行时大依赖。
- 当前存储基线是 `LS_VERSION = 3`、`DB = PlainTab` v1，入口在 `js/wallpaper/data.js`。
- 壁纸来源是 Bing、本地上传、本地文件夹、RSS、API。壁纸设置页采用草稿 + `应用配置`，不是切换即保存。
- 首屏热路径固定：`#wallpaperBack` → 同步 `js/preload.js` → `#wallpaperFront` → 其余脚本。不要把网络、IDB、canvas 或目录扫描放进首屏同步路径。

## Naming Rules

- `00-*` 是所有任务都要遵守的基础规则。
- `10-40` 是运行时核心链路。
- `50-70` 是用户交互功能。
- `90-*` 是历史参考，不应作为新实现的唯一依据。

不要新增根目录 `ai/` 或 `js-architecture*` 文件；临时任务记录放在 `docs/ai-tasks/`。
