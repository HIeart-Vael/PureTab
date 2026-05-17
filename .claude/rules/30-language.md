# 语言系统需求规格

## 行为概述

PlainTab 支持 16 种界面语言。语言数据在 `js/languages.js` 中以 `window.I18N` 和 `window.LanguageList` 提供，启动时早于运行时代码加载。

用户切换语言后，可见 UI 文案即时刷新；设置完整面板若已懒加载，也同步刷新。语言选择还会影响后续 Bing 壁纸请求使用的市场参数，但不会立即清空或强制刷新已缓存的当天 Bing 图片。

### 16 种支持语言

| # | 语言 | 代码 | # | 语言 | 代码 |
|---|------|------|---|------|------|
| 1 | 中文 (简体) | `zh-CN` | 9 | 日本語 | `ja` |
| 2 | 中文 (繁體) | `zh-TW` | 10 | Deutsch | `de` |
| 3 | English | `en` | 11 | 한국어 | `ko` |
| 4 | Español | `es` | 12 | Français | `fr` |
| 5 | हिन्दी | `hi` | 13 | Italiano | `it` |
| 6 | العربية | `ar` | 14 | Türkçe | `tr` |
| 7 | Português | `pt` | 15 | Polski | `pl` |
| 8 | Русский | `ru` | 16 | Tiếng Việt | `vi` |

### 语言检测

首次使用且 `ptab_locale` 不存在时：

1. 扩展模式优先使用 `chrome.i18n.getUILanguage()`。
2. 网页模式使用 `navigator.language`。
3. 精确匹配 `I18N[language]`。
4. 精确失败后按语言前缀匹配 `I18N` 的第一个同前缀 key。
5. 仍失败则回退 `en`。

用户手动选择语言后保存到 `ptab_locale`，之后不再自动检测。

### 翻译回退链

`t(key)` 查找顺序：

1. 扩展模式下的 `chrome.i18n.getMessage(key)`。
2. `I18N[currentLang][key]`。
3. `I18N.en[key]`。
4. key 本身。

显示 key 本身是开发调试信号，新增 UI 文案时应补齐所有语言或至少补齐英文兜底。

### 语言切换

点击右上角语言按钮打开语言面板。面板首次打开时创建按钮，之后只更新高亮。点击非当前语言：

1. 写入 `ptab_locale`。
2. 更新当前语言变量。
3. 刷新页面标题、搜索框 placeholder、角落按钮 title、壁纸来源标签、一级面板文字、设置模态文字和命令面板相关文案。
4. 调用 `window.onLangChange`（如果未来实现）。
5. 关闭语言面板。

点击当前语言不做任何事。

### Bing 市场映射

`WallpaperFetch.bingMkt(lang)` 当前映射：

| 语言代码 | Bing mkt | 语言代码 | Bing mkt |
|----------|----------|----------|----------|
| `zh-CN` | `zh-CN` | `zh-TW` | `zh-TW` |
| `en` | `en-US` | `ja` | `ja-JP` |
| `ko` | `ko-KR` | `fr` | `fr-FR` |
| `de` | `de-DE` | `es` | `es-ES` |
| `it` | `it-IT` | `pt` | `pt-BR` |
| `ru` | `ru-RU` | `ar` | `ar-SA` |
| `hi` | `hi-IN` | `tr` | `tr-TR` |
| `pl` | `pl-PL` | `vi` | `vi-VN` |

未知语言回退 `en-US`。

## 约束清单

- `js/languages.js` 必须早于 `js/wallpaper/data.js`、`settings-bootstrap.js` 和 `newtab.js` 加载。
- 语言值损坏或不在 `I18N` 中时，运行时回退英文。
- 新增文案 key 时至少提供英文兜底；不要依赖浏览器原生翻译覆盖项目 UI。
- 新增语言需要同时更新 `I18N` 和 `LanguageList`，并确认 Bing 市场是否需要加入 `bingMkt`。
- 切换语言不应阻塞首屏，也不应同步请求 Bing 网络图。
