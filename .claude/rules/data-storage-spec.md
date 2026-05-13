# 数据存储需求规格

## 一、概述

PlainTab 用两套存储系统保存数据：

- **localStorage**：存轻量数据——设置、缩略图、配置。速度快、同步读写。
- **IndexedDB**：存大文件——壁纸原图 Blob。异步读写，不阻塞页面。

所有存储的数据加起来大约 1-2MB，远低于 localStorage 的 5MB 配额，正常情况下不会满。

核心原则：**先落重数据，再写轻数据。先断引用，再删数据。** 这样不管哪一步崩溃，数据都不会损坏。

---

## 二、localStorage 里的所有数据

### 2.1 壁纸相关（7 个 key）

| Key | 存什么 | 类型 | 默认值 | 谁写 | 谁读 |
|-----|--------|------|--------|------|------|
| `ptab_mode` | 壁纸模式 `'bing'` 或 `'local'` | 字符串 | `'bing'` | 壁纸系统、图库 | 壁纸系统、preload.js |
| `ptab_bing_thumb` | Bing 壁纸缩略图 base64 | 字符串 | 无 | 壁纸系统 | preload.js |
| `ptab_preview_thumb` | 下一张壁纸的预计算缩略图 | 字符串 | 无 | 壁纸系统 | preload.js（优先） |
| `ptab_bing_meta` | Bing 图元数据 `{src, date, provider}` | JSON | `{}` | 壁纸系统 | 壁纸系统 |
| `ptab_img_order` | 本地图片 ID 列表，决定轮换顺序 | JSON 数组 | `[]` | 壁纸系统、图库 | 壁纸系统、preload.js、图库 |
| `ptab_img_thumbs` | `{id: "缩略图 base64"}` 映射表 | JSON 对象 | `{}` | 壁纸系统、图库 | 壁纸系统、preload.js、图库 |
| `ptab_local_index` | 本地轮换索引（当前播到第几张） | 数字 | `0` | 壁纸系统 | 壁纸系统、preload.js |

### 2.2 语言（1 个 key）

| Key | 存什么 | 类型 | 默认值 |
|-----|--------|------|--------|
| `ptab_lang` | 用户选择的语言代码 | 字符串 | 自动检测 |

### 2.3 搜索设置（3 个 key）

| Key | 存什么 | 类型 | 默认值 |
|-----|--------|------|--------|
| `ptab_search_mode` | 搜索栏显示模式 | 字符串 | `'always'` |
| `ptab_icon_opacity` | 图标透明度 0~1 | 数字 | `0.45` |
| `ptab_search_engine` | 当前搜索引擎 | 字符串 | `'google'` |

### 2.4 命令面板（8 个 key）

| Key | 存什么 | 类型 | 默认值 | 说明 |
|-----|--------|------|--------|------|
| `ptab_shortcuts` | 所有快捷链接 | JSON 数组 | `[]` | `[{id, name, url, freq, added}]` |
| `ptab_shortcut_icons` | 图标数据 | JSON 对象 | `{}` | `{id: "favicon URL" 或 "LETTER:X"}` |
| `ptab_shortcut_recents` | 最近访问的 ID | JSON 数组 | `[]` | 最多 10 条 |
| `ptab_shortcut_hidden` | 隐藏的快捷链接 ID | JSON 数组 | `[]` | |
| `ptab_shortcut_hotkey` | Normal 面板快捷键 | 字符串 | `'ctrl+k'` | |
| `ptab_shortcut_hidden_hotkey` | Hidden 面板快捷键 | 字符串 | `'ctrl+shift+k'` | |
| `ptab_shortcut_recommend` | 是否显示推荐 | 字符串 | `'true'` | `'true'` / `'false'` |
| `ptab_shortcut_view` | 视图模式 | 字符串 | `'list'` | `'list'` / `'icon'` |

### 2.5 元数据（2 个 key）

| Key | 存什么 | 类型 | 默认值 |
|-----|--------|------|--------|
| `ptab_version` | 数据格式版本号 | 数字 | `2` |
| `ptab_img_meta` | 本地图片元数据 `{id: {name, size}}` | JSON 对象 | `{}` |

**总计：21 个 localStorage key。**

---

## 三、IndexedDB 里的数据

数据库名：`PlainTab`，版本 1，只有一个存储空间 `wallpaper`。

| Key | 存什么 | 类型 | 谁写 | 谁读 |
|-----|--------|------|------|------|
| `ptab_bing_blob` | Bing 每日壁纸原图 | Blob | 壁纸系统 | 壁纸系统 |
| `ptab_img_<id>` | 单张本地壁纸 | `{blob, mime, name}` | 壁纸系统、图库 | 壁纸系统、图库 |

- `ptab_bing_blob` 每次都覆盖写入——永远只存最新一张 Bing 图
- `ptab_img_<id>` 每张独立——新增/删除/读取一张不影响其他
- 数据库连接是惰性的：第一次访问时才建立连接，之后复用

---

## 四、读写规则

### 4.1 JSON 类型的读写

- **写**：`JSON.stringify()` → `localStorage.setItem()`，包在 try-catch 里
- **读**：`localStorage.getItem()` → `JSON.parse()`，包在 try-catch 里
- 解析失败 → 回退到安全的默认值（`[]` 或 `{}`），不报错
- 默认值类型也是安全的——数组类型的回退空数组，对象类型的回退空对象

### 4.2 字符串类型的读写

- 直接 `getItem()` + `|| 默认值`，无需 try-catch
- 布尔值存成 `'true'` / `'false'` 字符串，读的时候用 `!== 'false'` 判断

### 4.3 数字类型的读写

- 存的时候直接 `setItem()`（数字会隐式转字符串）
- 读的时候 `parseInt()` / `parseFloat()` + `|| 默认值`

### 4.4 内存缓存

频繁读的数据在内存里缓存，避免反复 `JSON.parse`：
- `ptab_img_thumbs` → 读到内存对象 `_thumbsCache`
- `ptab_img_meta` → 读到内存对象 `_metaCache`
- 写入时同步更新缓存

`ptab_bing_meta` 不缓存——每次读取都要保证是最新值（调用频率低）。

---

## 五、崩溃安全设计

### 5.1 保存本地图片

顺序很关键：

```
第 1 步：原图 blob → IndexedDB（重数据先落盘）
第 2 步：ID 加入 order 数组 → 存到 localStorage
第 2 步：缩略图加入 thumbs → 存到 localStorage
第 2 步：元数据加入 meta → 存到 localStorage
```

**如果第 1 步后崩溃：** blob 在 IDB，但 order 里没有 → 孤儿数据，轮换时会跳过，安全忽略。
**如果第 2 步中崩溃：** order/thumbs/meta 可能部分写入，但下次加载时发现缺失会自动修复。

### 5.2 删除本地图片

```
第 1 步：从 order 数组移除（先断引用——图片立刻不可达）
第 2 步：从 thumbs 删除
第 3 步：从 meta 删除
第 4 步：从 IndexedDB 删除 blob（最后删重数据）
```

**如果第 1 步后崩溃：** 图片不可达，但 blob 还在 → 无害孤儿。
**如果第 4 步失败：** blob 留在 IDB，但 order 里没了 → 同上。

### 5.3 缓存 Bing 壁纸

```
第 1 步：下载图片 → 获取 Blob
第 2 步：写入 meta（记录 URL + 日期）→ localStorage
第 3 步：写入 blob → IndexedDB
```

**如果第 2 步后崩溃：** meta 指向的 URL 没有对应 blob → 下次加载发现 blob 缺失，重新下载。
**如果第 3 步后崩溃：** 同上。

### 5.4 重置（全部清空）

```
第 1 步：批量删除所有 ptab_img_<id> → IndexedDB（一次事务）
第 2 步：清空 localStorage 中的 order / thumbs / meta / index / thumb / mode
```

**如果第 1 步后崩溃：** IDB 空了但 order 还在 → 下次加载发现 blob 不存在，跳过并走 Bing fallback。

---

## 六、版本升级

| 版本常量 | 当前值 | 什么时候升级 |
|---------|--------|------------|
| localStorage 格式版本 | `2` | 增/删/改/改名了一个 localStorage key |
| IndexedDB 数据库版本 | `1` | 改变数据库结构（新建/删除存储空间、加索引） |

**不需要升级的情况：**
- IndexedDB 的 key 改名字 → 不用升级，key 只是字符串
- localStorage 的某个值改格式 → 靠默认值和 try-catch 兼容
- 新增可选 key → 不影响已有数据的读取

升级逻辑在启动时执行：读 `ptab_version` → 如果小于当前版本 → 执行迁移 → 写新版本号。

---

## 七、各种情况处理

| 情况 | 处理 |
|------|------|
| localStorage 写满了（QuotaExceededError） | try-catch 捕获，写入失败不影响主流程 |
| 缩略图 base64 太大 | 不存，下次重新生成 |
| JSON 解析失败（数据损坏） | 返回安全的默认值（`[]` 或 `{}`） |
| IndexedDB 连接意外断开 | 清除缓存连接，下次重新建 |
| 隐私模式下 IndexedDB 不持久 | 视为正常，本次会话正常使用 |
| 从 IDB 读取 blob 时类型丢失 | 用存的 mime 信息重建 Blob |
| 多个新标签页同时写 | **假设不会发生**——每个标签页独立，Chrome 每开一个新标签页会创建新的页面实例 |

---

## 八、与其它模块的关系

存储层是最底层模块——被所有模块依赖，不依赖任何模块。

| 谁依赖存储层 | 依赖什么 |
|------------|---------|
| 壁纸系统 | IDB 读写 Blob + localStorage 读写 order/thumbs/meta/bing_meta |
| 搜索栏 | localStorage 读写搜索模式/引擎/透明度 |
| 设置面板 | localStorage 读写搜索设置 |
| 本地图库 | IDB 读写 Blob + localStorage 读写 order/thumbs/meta |
| 语言系统 | localStorage 读写语言选择 |
| 命令面板 | localStorage 读写 8 个快捷链接相关 key |
| 全局交互 | localStorage 读启动设置 |
