(function () {
    'use strict';

    /* ================================================================
       1. 常量
       ================================================================ */

    var BING_PRIMARY = function (mkt) { return 'https://bing.kaininx.workers.dev/?resolution=1920x1080&format=json&index=0&mkt=' + mkt; };
    var BING_FALLBACK = function (mkt) { return 'https://bing.biturl.top/?resolution=1920x1080&format=json&index=0&mkt=' + mkt; };

    // *** localStorage / IndexedDB 的 key 名
    // LS_* = localStorage, DB_* = IndexedDB
    var LS_VERSION = 2;
    var DB_VERSION = 1;

    var LS_KEY_VERSION = 'ptab_version';
    var LS_KEY_BING_THUMB = 'ptab_bing_thumb';
    var LS_KEY_LANG = 'ptab_lang';
    var LS_KEY_MODE = 'ptab_mode';
    var LS_KEY_SEARCH_MODE = 'ptab_search_mode';
    var LS_KEY_ICON_OPACITY = 'ptab_icon_opacity';
    var LS_KEY_SEARCH_ENGINE = 'ptab_search_engine';
    var LS_KEY_BING_META = 'ptab_bing_meta';
    var DB_KEY_BING_BLOB = 'ptab_bing_blob';
    var DB_KEY_IMG_PREFIX = 'ptab_img_';
    var LS_KEY_IMG_ORDER = 'ptab_img_order';
    var LS_KEY_IMG_THUMBS = 'ptab_img_thumbs';
    var LS_KEY_LOCAL_INDEX = 'ptab_local_index';
    var LS_KEY_PREVIEW_THUMB = 'ptab_preview_thumb';
    var LS_KEY_IMG_META = 'ptab_img_meta';

    var DB_NAME = 'PlainTab';
    var DB_STORE_NAME = 'wallpaper';

    var TRANSITION_MS = 500; // 壁纸淡入过渡时长（ms），必须与 CSS 中的 transition-duration 保持一致
    var THUMB_MAX_W = 640;   // 生成缩略图的最大宽度（px）

    // 搜索设置默认值，需与 index.html 中控件的 value 保持一致
    var DEFAULT_SEARCH_MODE = 'always';
    var DEFAULT_OPACITY = 0.45;
    var DEFAULT_ENGINE = 'google';

    var log = function (tag, msg) { console.log('[' + tag + '] ' + msg); };
    var warn = function (tag, msg) { console.warn('[' + tag + '] ' + msg); };

    // 追踪当前壁纸的 blob URL，用于在切换壁纸时 revoke 旧 URL 释放内存
    var _currentWallpaperBlobUrl = null;

    // ptab_img_thumbs 的内存缓存，避免每次 loadThumbs() 重新解析 300-420 KB 的 JSON
    var _thumbsCache = null;

    /* ================================================================
       2. 运行环境
       ================================================================ */

    var IS_EXTENSION = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;

    /* ================================================================
       3. DOM 元素
       ================================================================ */

    var wallpaperBackEl = document.getElementById('wallpaperBack');
    var wallpaperFrontEl = document.getElementById('wallpaperFront');
    var searchBar = document.getElementById('searchBar');
    var searchInput = document.getElementById('searchInput');
    var engineIcon = document.getElementById('searchEngineIcon');
    var settingsBtn = document.getElementById('settingsBtn');
    var langBtn = document.getElementById('langBtn');
    var settingsPanel = document.getElementById('settingsPanel');
    var langPanel = document.getElementById('langPanel');
    var langOptions = document.getElementById('langOptions');
    var wallpaperInfoEl = document.getElementById('wpInfo');
    var uploadBtn = document.getElementById('uploadBtn');
    var fileInput = document.getElementById('fileInput');
    var resetBtn = document.getElementById('resetBtn');
    var advancedToggleEl = document.getElementById('advToggle');
    var advancedSectionEl = document.getElementById('advSection');
    var searchModeSelect = document.getElementById('searchModeSel');
    var opacityRange = document.getElementById('opacityRange');
    var opacityNumInput = document.getElementById('opacityNum');
    var engineSelect = document.getElementById('engineSel');
    var resetAdvancedBtn = document.getElementById('resetAdvBtn');

    /* ================================================================
       4. 状态变量
       ================================================================ */

    var currentMode = 'bing';             // 'bing' | 'local'
    var currentLang = 'en';
    var I18N = window.I18N || {};
    var LanguageList = window.LanguageList || [];

    // 鼠标/面板交互状态
    var isMouseInCornerZone = false;
    var isMouseInSearchZone = false;
    var isSettingsPanelOpen = false;
    var isLangPanelOpen = false;
    var cornerHideTimer = null;
    var searchHideTimer = null;

    // 搜索设置（持久化到 localStorage）
    var searchMode = DEFAULT_SEARCH_MODE;  // 'hover' | 'always' | 'never'
    var currentOpacity = DEFAULT_OPACITY;
    var currentEngine = DEFAULT_ENGINE;
    var engineIndex = 0;
    var langBtns = null; // 缓存语言面板按钮引用，避免每次切换重建 DOM

    /* ================================================================
       5. 国际化 (i18n)
       ================================================================ */

    /**
     * 查找翻译文本。
     *
     * WHY 优先级链：
     *   扩展模式下 chrome.i18n.getMessage 由浏览器原生提供，覆盖最全；
     *   Web 模式走 I18N 表自维护翻译；英语兜底确保不会显示原始 key。
     */
    function t(key) {
        if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
            var msg = chrome.i18n.getMessage(key);
            if (msg) return msg;
        }
        return (I18N[currentLang] && I18N[currentLang][key]) || (I18N['en'] && I18N['en'][key]) || key;
    }

    /**
     * 探测浏览器 UI 语言，返回 I18N 表中的最佳匹配。
     *
     * WHY 两级匹配：
     *   精确匹配（如 zh-CN）优先，因为部分语言有地区变体（zh-TW vs zh-CN）；
     *   主语言前缀兜底（zh-CN → zh），确保繁体浏览器也能命中简体翻译。
     */
    function detectLang() {
        var browserLang = 'en';
        if (typeof chrome !== 'undefined' && chrome.i18n) browserLang = chrome.i18n.getUILanguage();
        else browserLang = navigator.language || 'en';
        if (I18N[browserLang]) return browserLang;
        var main = browserLang.split('-')[0];
        var found = null;
        Object.keys(I18N).some(function (k) { if (k.indexOf(main) === 0) { found = k; return true; } return false; });
        return found || 'en';
    }

    /**
     * 用当前语言刷新页面上所有可见文本。
     *
     * WHY 遍历所有 DOM 文本：
     *   语言切换时整个 UI 必须即时刷新，不能有残留的旧语言文本。
     *   包括 title、placeholder、按钮文字、设置标签等所有用户可见字符串。
     */
    function updateLangUI() {
        document.title = t('extName');
        searchInput.placeholder = t('searchPlaceholder');
        engineIcon.setAttribute('title', t('engineTitle'));
        langBtn.setAttribute('title', t('langTitle'));
        settingsBtn.setAttribute('title', t('settingsTitle'));
        document.querySelector('.settings-panel h3').textContent = t('panelTitle');
        if (currentMode === 'local') refreshLocalGallery();
        else wallpaperInfoEl.textContent = t('wpBing');
        uploadBtn.textContent = t('uploadBtn');
        resetBtn.textContent = t('resetBtn');
        advancedToggleEl.textContent = t('advToggle');
        var labels = document.querySelectorAll('.setting-row label');
        if (labels.length >= 3) {
            labels[0].textContent = t('searchLabel');
            labels[1].textContent = t('opacityLabel');
            labels[2].textContent = t('engineLabel');
        }
        var opts = searchModeSelect.options;
        if (opts.length >= 3) { opts[0].textContent = t('searchHover'); opts[1].textContent = t('searchAlways'); opts[2].textContent = t('searchNever'); }
        resetAdvancedBtn.textContent = t('resetAdv');
        renderLangPanel();
    }

    /**
     * 渲染语言选择面板的按钮列表。
     *
     * WHY 首次创建后缓存按钮引用：
     *   按钮结构和事件逻辑不变，语言切换时只需更新文本和高亮状态，
     *   避免每次切换都销毁重建 16 个按钮并重新绑定事件。
     */
    function renderLangPanel() {
        document.querySelector('.lang-title').textContent = t('langPanelTitle');
        if (!langBtns) {
            langBtns = {};
            LanguageList.forEach(function (lang) {
                var btn = document.createElement('button');
                btn.className = 'lang-option';
                btn.addEventListener('click', function () {
                    if (lang.code !== currentLang) {
                        localStorage.setItem(LS_KEY_LANG, lang.code);
                        currentLang = lang.code;
                        updateLangUI();
                    }
                    closeLangPanel();
                });
                langOptions.appendChild(btn);
                langBtns[lang.code] = btn;
            });
        }
        LanguageList.forEach(function (lang) {
            langBtns[lang.code].textContent = lang.name;
            langBtns[lang.code].classList.toggle('current', lang.code === currentLang);
        });
    }

    /* ================================================================
       6. IndexedDB 存储层
       ================================================================ */

    var _dbConnection;

    /**
     * 获取（或创建并缓存）数据库连接。
     *
     * WHY 缓存连接：
     *   IndexedDB.open 是异步操作，每次调用都有开销。
     *   缓存连接后后续调用直接返回 Promise.resolve，零延迟。
     *   onclose 回调清除缓存，确保意外断开后下次能重新建立连接。
     */
    function openDB() {
        if (_dbConnection) return Promise.resolve(_dbConnection);
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function (e) {
                if (!e.target.result.objectStoreNames.contains(DB_STORE_NAME)) e.target.result.createObjectStore(DB_STORE_NAME);
            };
            req.onsuccess = function (e) {
                _dbConnection = e.target.result;
                // WHY: 连接意外关闭时清除缓存，下次调用会重新建立连接
                _dbConnection.onclose = function () { _dbConnection = null; };
                resolve(_dbConnection);
            };
            req.onerror = function (e) { reject(e.target.error); };
        });
    }

    /**
     * 向 IndexedDB 写入键值对。
     *
     * WHY 单 key 操作：
     *   每张本地图片独立存储为 ptab_img_<id>，写入一张不影响其他图片。
     *   写 blob 到 IDB 是保存流程的第一步——先落盘再更新 order，崩溃安全。
     */
    function idbPut(key, value) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB_STORE_NAME, 'readwrite');
                tx.objectStore(DB_STORE_NAME).put(value, key);
                tx.oncomplete = resolve;
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    /**
     * 从 IndexedDB 读取键值对。
     *
     * WHY 返回 undefined 而非 null：
     *   IDB 中不存在的 key 返回 undefined，调用方用 `!result` 判断即可，
     *   与 localStorage 的 null 行为保持一致的真值检查逻辑。
     */
    function idbGet(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB_STORE_NAME, 'readonly');
                var req = tx.objectStore(DB_STORE_NAME).get(key);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    /**
     * 从 IndexedDB 删除指定键。
     *
     * WHY 删除是保存流程的最后一步：
     *   先从 order 中移除引用（不可达），再删 thumb，最后删 IDB blob。
     *   任何一步崩溃都不会导致数据不一致——最多留下无害的孤儿 blob。
     */
    function idbDelete(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB_STORE_NAME, 'readwrite');
                tx.objectStore(DB_STORE_NAME).delete(key);
                tx.oncomplete = resolve;
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    /**
     * 在单个事务中批量删除多个 key。
     *
     * WHY 单事务批量删除：
     *   resetToBing 可能删除 12 张图片的 blob，每条一个事务会产生
     *   12 次事务创建/提交/回调开销。合并为单个事务后只有 1 次开销。
     */
    function idbDeleteMany(keys) {
        if (!keys.length) return Promise.resolve();
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB_STORE_NAME, 'readwrite');
                var store = tx.objectStore(DB_STORE_NAME);
                keys.forEach(function (key) { store.delete(key); });
                tx.oncomplete = resolve;
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    /* ================================================================
       7. 壁纸核心 — 双图层零白屏系统

       WHY 需要两个图层：
         #wallpaperBack (z-index:0) — 始终持有可见图像。
         preload.js 在浏览器首帧绘制前同步写入缩略图，
         用户永远不会看到空白背景。
         #wallpaperFront (z-index:1, opacity:0) — 用于淡入过渡。
         新图在内存中预加载 → 设到 front 层 → CSS opacity
         transition 淡入 → 过渡完成后 "稳定" 到 back 层
         （直接 back.style.backgroundImage 赋值），front 复位透明。
         这样每个时刻至少有一层持有已渲染图像 —— 零白屏。
       ================================================================ */

    /**
     * 将图片预加载到浏览器缓存，返回已解码的 Image 对象。
     *
     * WHY 设置 crossOrigin：
     *   返回的 Image 对象会被 generateThumbnail 复用，而 canvas.toDataURL()
     *   要求图片必须以 CORS 方式加载。统一在预加载阶段设置 crossOrigin，
     *   避免后续需要重新发起请求。blob URL 天然同源，设置 crossOrigin 无副作用。
     */
    function preloadImage(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                // WHY: decode() 确保图片已解码，避免首次绘制时的解码延迟闪烁
                img.decode().then(function () { resolve(img); }, function () { resolve(img); });
            };
            img.onerror = function () { resolve(null); };
            img.src = url;
        });
    }

    /**
     * 应用壁纸并执行双层交叉淡入淡出过渡。
     *
     * WHY 使用 front/back 双层结构：
     *   浏览器对 background-image 的切换没有原生过渡动画，
     *   所以用两层 div 叠放：front 层淡入新壁纸，过渡完成后
     *   将新壁纸同步到 back 层，再清空 front——视觉上形成平滑切换。
     *
     * WHY Blob URL 在过渡完成后才 revoke：
     *   过渡期间 back 层可能仍在显示旧 URL 对应的图片。
     *   过渡完成后，back 层已持有新 URL，front 层已清空，
     *   旧 URL 不再被任何 DOM 元素引用，此时释放才是安全的。
     *   此外，preloadImage 已将图片解码为位图，Image 对象
     *   的内部数据不依赖 blob URL 字符串，revoke 不影响
     *   后续 generateThumbnail 对同一 Image 的复用。
     *
     * @param {string} url  - 壁纸图片 URL（可以是 https:// 或 blob:）
     * @param {string} mode - 壁纸来源模式：'bing' | 'local'
     * @returns {Promise<string|null>} 缩略图 data URL 或 null
     */
    function applyWallpaper(url, mode) {
        var preloadedImg = null;
        var isBlobUrl = url.indexOf('blob:') === 0;

        return preloadImage(url).then(function (img) {
            preloadedImg = img;
            wallpaperFrontEl.style.backgroundImage = 'url(' + url + ')';
            return new Promise(function (resolve) {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        wallpaperFrontEl.classList.add('active');
                        setTimeout(function () {
                            wallpaperBackEl.style.backgroundImage = 'url(' + url + ')';
                            wallpaperFrontEl.classList.remove('active');
                            wallpaperFrontEl.style.backgroundImage = '';
                            resolve();
                        }, TRANSITION_MS + 50);
                    });
                });
            });
        }).then(function () {
            // ── Blob URL 生命周期管理 ──
            // 过渡完成：back 层已持有新 URL，front 层已清空，
            // 旧 URL 不再被 DOM 引用，可以安全释放。
            if (isBlobUrl) {
                var oldUrl = _currentWallpaperBlobUrl;
                _currentWallpaperBlobUrl = url;
                if (oldUrl && oldUrl !== url) {
                    try { URL.revokeObjectURL(oldUrl); } catch (e) { /* already revoked */ }
                }
            } else {
                // 非 Blob URL 切入时，若之前持有 Blob URL 也需释放
                if (_currentWallpaperBlobUrl) {
                    try { URL.revokeObjectURL(_currentWallpaperBlobUrl); } catch (e) { /* already revoked */ }
                    _currentWallpaperBlobUrl = null;
                }
            }

            currentMode = mode;
            wallpaperInfoEl.textContent = mode === 'local' ? t('wpLocal') : t('wpBing');

            // ★ 复用 preloadImage 已加载的 Image 对象，避免二次加载 + 二次解码
            return generateThumbnail(preloadedImg).then(function (thumb) {
                if (thumb) {
                    // WHY: bing 模式写入预计算缓存，让 preload.js 一次 getItem 即可命中
                    //      local 模式由 tryLoadLocalWallpaper 同步写入，不在此处异步覆盖（避免竞态错位）
                    if (mode === 'bing') {
                        try { localStorage.setItem(LS_KEY_PREVIEW_THUMB, thumb); } catch (e) { /* quota */ }
                        try { localStorage.setItem(LS_KEY_BING_THUMB, thumb); } catch (e) { /* quota */ }
                    }
                }
                return thumb;
            });
        });
    }
    /**
     * 生成缩略图（纯计算，不写 localStorage）。
     * 调用方根据 mode 决定是否持久化到 ptab_bing_thumb。
     *
     * WHY 640px 宽 JPEG 0.55 质量：
     *   缩略图以 CSS url(data:...) 格式存入 localStorage，需要控制在 quota 内。
     *   640px 在 1920 屏幕上也足够锐利。JPEG 0.55 是体积与画质的平衡点。
     *
     * WHY 接受 Image 对象或 URL：
     *   当 source 是已加载的 Image 对象时，直接复用它绘制 Canvas，
     *   避免二次网络请求 + 二次解码——这是最大的性能瓶颈。
     *   当 source 是字符串 URL 时（如 saveLocalImage 的 !show 路径），
     *   仍走原有的 new Image + onload 流程，向后兼容。
     */
    function generateThumbnail(source) {
        function processImage(img) {
            var canvas = document.createElement('canvas');
            var scale = THUMB_MAX_W / img.width;
            canvas.width = THUMB_MAX_W;
            canvas.height = Math.floor(img.height * scale);
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return 'url(' + canvas.toDataURL('image/jpeg', 0.55) + ')';
        }

        // ★ 传入已加载的 Image 对象 → 零额外 IO，同步生成缩略图
        if (source && typeof source !== 'string') {
            return Promise.resolve(processImage(source));
        }

        // 传入 URL 字符串 → 兼容旧调用路径（如 saveLocalImage 的 !show 分支）
        return new Promise(function (resolve) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () { resolve(processImage(img)); };
            img.onerror = function () { resolve(null); };
            img.src = source;
        });
    }

    // 本地图片 order 与缩略图（id 做钥匙）
    function imgKey(id) { return DB_KEY_IMG_PREFIX + id; }

    /**
     * 从 localStorage 读取本地图片 ID 顺序数组。
     *
     * WHY 返回空数组而非 null：
     *   调用方直接访问 order.length，返回 null 会导致 TypeError。
     *   JSON.parse 异常时也回退空数组，确保后续逻辑安全执行。
     */
    function loadOrder() {
        try { return JSON.parse(localStorage.getItem(LS_KEY_IMG_ORDER) || '[]'); }
        catch (e) { return []; }
    }
    /**
     * 将本地图片 ID 顺序数组写入 localStorage。
     *
     * WHY 用 JSON.stringify：
     *   localStorage 只能存字符串，数组必须序列化。
     *   try-catch 兜底 quota 超限（缩略图 base64 可能撑满 5MB）。
     */
    function saveOrder(order) {
        try { localStorage.setItem(LS_KEY_IMG_ORDER, JSON.stringify(order)); }
        catch (e) { /* quota */ }
    }

    /**
     * 从 localStorage 读取本地图片缩略图映射表。
     *
     * WHY 返回空对象而非 null：
     *   调用方用 thumbs[id] 访问，null 会导致 TypeError。
     *   空对象安全返回 undefined，与"无缩略图"语义一致。
     */
    function loadThumbs() {
        if (_thumbsCache !== null) return _thumbsCache;
        try { _thumbsCache = JSON.parse(localStorage.getItem(LS_KEY_IMG_THUMBS) || '{}'); }
        catch (e) { _thumbsCache = {}; }
        return _thumbsCache;
    }
    /**
     * 将本地图片缩略图映射表写入 localStorage。
     *
     * WHY 每次写整个对象：
     *   缩略图映射是 `{id: "url(data:...)"}` 结构，
     *   更新单个 key 需要先读再写，直接写整个对象更简单且原子。
     *   try-catch 兜底 quota 超限。
     */
    function saveThumbs(thumbs) {
        try { localStorage.setItem(LS_KEY_IMG_THUMBS, JSON.stringify(thumbs)); }
        catch (e) { /* quota */ }
        _thumbsCache = thumbs;
    }

    // ptab_img_meta 的内存缓存，与 _thumbsCache 相同模式
    var _metaCache = null;

    /**
     * 读取本地图片元数据映射表（name, size）。
     *
     * WHY 内存缓存：
     *   与 loadThumbs 同理，meta JSON 体积小（~1KB）但读取频繁，
     *   首次解析后缓存，后续调用直接返回引用。
     */
    function loadMeta() {
        if (_metaCache !== null) return _metaCache;
        try { _metaCache = JSON.parse(localStorage.getItem(LS_KEY_IMG_META) || '{}'); }
        catch (e) { _metaCache = {}; }
        return _metaCache;
    }

    /**
     * 将本地图片元数据映射表写入 localStorage。
     *
     * WHY 每次写整个对象：
     *   与 saveThumbs 同理，直接写整个对象更简单且原子。
     */
    function saveMeta(meta) {
        try { localStorage.setItem(LS_KEY_IMG_META, JSON.stringify(meta)); } catch (e) { }
        _metaCache = meta;
    }

    /* ================================================================
       8. 壁纸 — Bing 每日壁纸获取与缓存
       ================================================================ */

    /**
     * 语言代码 → Bing 市场代码。
     *
     * WHY 回退 en-US：
     *   部分语言（如 vi、pl）无 Bing 直营市场，用 en-US 确保 API 始终返回有效结果。
     *   比返回空或报错更友好——用户至少能看到一张壁纸。
     */
    function bingMkt(lang) {
        var map = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', 'en': 'en-US', 'ja': 'ja-JP', 'ko': 'ko-KR', 'fr': 'fr-FR', 'de': 'de-DE', 'es': 'es-ES', 'it': 'it-IT', 'pt': 'pt-BR', 'ru': 'ru-RU', 'ar': 'ar-SA', 'hi': 'hi-IN', 'tr': 'tr-TR', 'pl': 'pl-PL', 'vi': 'vi-VN' };
        return map[lang] || 'en-US';
    }

    /**
     * 获取 Bing 每日壁纸的图像直链。双端点并发竞速，取先响应的结果。
     *
     * WHY 双端点竞速：
     *   kaininx（Cloudflare Workers）海外更快，biturl 国内可直连。
     *   不论用户在哪，Promise.any 总是取最先响应的结果，兼顾国内外网络环境。
     *   8 秒超时确保慢端点不会拖累整体体验。
     *   AbortSignal.any 合并超时信号与竞速信号，快端点返回后立即 abort 慢端点。
     */
    function fetchBingUrl() {
        var mkt = bingMkt(currentLang);
        var shared = new AbortController();
        function tryFetch(url, api, timeout) {
            var signal = AbortSignal.any([shared.signal, AbortSignal.timeout(timeout)]);
            return fetch(url, { signal: signal }).then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            }).then(function (data) {
                if (data && data.url) return { url: data.url, api: api };
                throw new Error('no url in response');
            });
        }
        // WHY: 同时并发请求两个端点，Promise.any 取最先响应的结果。
        // kaininx（Cloudflare Workers）海外更快，biturl 国内可直连——不论在哪，总是先到先用。
        var t = '&t=' + Date.now();
        return Promise.any([
            tryFetch(BING_PRIMARY(mkt) + t, 'primary', 8000),
            tryFetch(BING_FALLBACK(mkt) + t, 'fallback', 8000)
        ]).finally(function () { shared.abort(); });
    }

    /**
     * CORS 方式下载图片 Blob（用于存入 IDB）。
     *
     * WHY 用 mode: 'cors'：
     *   Bing 图片 CDN 支持 CORS 头，fetch 拿到的 Blob 可安全存入 IDB。
     *   不设置 mode 时浏览器默认 same-origin，跨域请求会被拦截。
     */
    function downloadBingBlob(url) {
        return fetch(url, { mode: 'cors' }).then(function (r) {
            if (!r.ok) throw new Error('fetch failed');
            return r.blob();
        });
    }

    /**
     * 从 localStorage 读取 Bing 壁纸元数据。
     *
     * WHY 返回空对象而非 null：
     *   调用方直接访问 meta.src、meta.date 等属性，
     *   返回 null 会导致 TypeError，空对象则安全返回 undefined。
     */
    function loadBingMeta() {
        try { var raw = localStorage.getItem(LS_KEY_BING_META); return raw ? JSON.parse(raw) : {}; }
        catch (e) { return {}; }
    }

    /**
     * 将 Bing 壁纸元数据写入 localStorage。
     *
     * WHY 记录 src + date + provider：
     *   src 用于去重（同 URL 跳过下载），date 用于新鲜度判断（非今天则重新获取），
     *   provider 记录来源端点，便于调试哪个代理更快。
     */
    function saveBingMeta(meta) {
        try { localStorage.setItem(LS_KEY_BING_META, JSON.stringify(meta)); }
        catch (e) { /* quota 满了 */ }
    }

    /**
     * 下载 Blob 并存入 IDB，同时更新 meta。
     *
     * WHY 用 src（图像直链 URL）作为去重 key：
     *   Bing 每天只换一次图。如果 URL 没变，说明还是同一张，跳过下载。
     *   但 IDB 中的旧 blob 可能已被浏览器清理 —— 所以即使 URL 相同，
     *   也要检查 blob 是否真的存在，丢了就回退下载。
     */
    function cacheBingBlob(url, provider, today) {
        var meta = loadBingMeta();
        var isNew = meta.src !== url;

        if (!isNew) {
            return idbGet(DB_KEY_BING_BLOB).then(function (blob) {
                if (blob) {
                    var kb = (blob.size / 1024).toFixed(0);
                    log('Bing', 'wallpaper unchanged, skipped  ·  ' + provider + '  ·  ' + kb + ' KB');
                    return blob;
                }
                log('Bing', 'blob missing, re-downloading...');
                return downloadAndStore();
            });
        }

        return downloadAndStore();

        function downloadAndStore() {
            return downloadBingBlob(url).then(function (blob) {
                meta.src = url;
                meta.date = today;
                meta.provider = provider;
                saveBingMeta(meta);
                var kb = (blob.size / 1024).toFixed(0);
                log('Bing', 'fetched new wallpaper from ' + provider + '  ·  ' + kb + ' KB');
                return idbPut(DB_KEY_BING_BLOB, blob).then(function () { return blob; });
            }).catch(function () { warn('Bing', 'got the URL but failed to download image, kept last image'); });
        }
    }

    /**
     * 后台静默缓存最新 Bing 壁纸。
     *
     * WHY 在本地壁纸模式下也需要它：
     *   用户可能随时切回 Bing 模式。在后台提前缓存好今天的 Bing 图，
     *   切换时无需等待网络请求。同时 meta.date 防重复请求，
     *   每个新标签页只跑一次。
     */
    function cacheBingInBackground() {
        var today = new Date().toDateString();
        var meta = loadBingMeta();
        if (meta.date === today && meta.src) return;
        fetchBingUrl().then(function (r) {
            return cacheBingBlob(r.url, r.api, today).then(function (blob) {
                if (blob && currentMode === 'bing') {
                    applyWallpaper(URL.createObjectURL(blob), 'bing');
                }
            });
        }).catch(function () { warn('Bing', 'background: failed, will retry later'); });
    }

    /* ================================================================
       9. 壁纸 — 主加载流程

       优先级：本地壁纸轮播 > 今日 Bing 缓存 > Bing 网络获取
       ================================================================ */

    /**
     * 尝试加载本地壁纸（轮播）。
     *
     * WHY 同步写入 preview_thumb：
     *   快速开新标签时，index 已递增但 applyWallpaper 尚未完成，
     *   若 preview_thumb 仍是旧值 → 预览错位。同步写入确保 index 与 preview_thumb 原子一致。
     *   下一张缩略图缺失时主动移除 preview_thumb，强制走 fallback 路径，避免展示错误图片。
     */
    function tryLoadLocalWallpaper(order) {
        if (!order || !order.length) return Promise.resolve(false);

        var idx = (parseInt(localStorage.getItem(LS_KEY_LOCAL_INDEX)) || 0) % order.length;
        var id = order[idx];

        return idbGet(imgKey(id)).then(function (img) {
            if (!img || !img.blob) { warn('Local', 'image ' + id + ' missing, skipping'); return false; }

            var blob = img.blob;
            if ((!blob.type || blob.type === '') && img.mime) {
                try { blob = new Blob([blob], { type: img.mime }); } catch (e) { }
            }

            localStorage.setItem(LS_KEY_LOCAL_INDEX, (idx + 1) % order.length);

            // ★ 同步写入下一张壁纸的预计算缩略图（在 applyWallpaper 异步操作之前）
            // WHY 必须同步：快速开新标签时，index 已递增但 applyWallpaper 尚未完成，
            // 若 preview_thumb 仍是旧值 → 预览错位。同步写入确保 index 与 preview_thumb 原子一致。
            var nextIdx = (idx + 1) % order.length;
            var nextId = order[nextIdx];
            var previewThumbs = loadThumbs();
            if (previewThumbs[nextId]) {
                try { localStorage.setItem(LS_KEY_PREVIEW_THUMB, previewThumbs[nextId]); } catch (e) { /* quota */ }
            } else {
                // 下一张缩略图尚未生成，移除 preview_thumb 强制走 fallback 路径，避免展示错误图片
                try { localStorage.removeItem(LS_KEY_PREVIEW_THUMB); } catch (e) { }
            }

            log('Local', 'image ' + (idx + 1) + '/' + order.length + (img.name ? '  ·  ' + img.name : ''));

            return applyWallpaper(URL.createObjectURL(blob), 'local').then(function (thumb) {
                if (thumb) {
                    var thumbs = loadThumbs();
                    if (!thumbs[id]) {
                        thumbs[id] = thumb;
                        saveThumbs(thumbs);
                    }
                }

                // preview_thumb 已在 index 递增后同步写入，此处无需再写

                cacheBingInBackground();
                return true;
            });
        });
    }

    /**
     * 尝试用已缓存的 Bing blob 展示壁纸。
     *
     * WHY 检查 meta.date：
     *   Bing 每天换一次图，meta.date 非今天说明缓存已过期，
     *   返回 false 让调用方走网络路径获取新图。
     */
    function tryLoadCachedBing(bingBlob, meta, today) {
        if (!bingBlob || meta.date !== today) return Promise.resolve(false);

        log('Bing', 'wallpaper is fresh  ·  date: ' + meta.date + ', nothing to do');
        return applyWallpaper(URL.createObjectURL(bingBlob), 'bing').then(function () { return true; });
    }

    /**
     * 从网络获取 Bing 壁纸（无可用缓存时的最终回退）。
     *
     * WHY 用旧 URL 垫 back 层：
     *   等待网络请求时，如果 back 层没有背景图，先把旧 URL 垫上去防止白屏。
     *   preload.js 可能已经写入了缩略图，所以仅在 back 层为空时才写。
     *   网络全挂时也回退到旧 URL，确保用户至少能看到一张图。
     */
    function loadBingFromNetwork(meta, today) {
        currentMode = 'bing';
        wallpaperInfoEl.textContent = t('wpBing');
        log('Bing', meta.date ? 'wallpaper is old (cache: ' + meta.date + ', today: ' + today + '), fetching...' : 'no wallpaper cached, fetching...');

        // 路径 A：meta 里有今天的 src 但没 blob —— 先用 src 展示，异步下载 blob
        if (meta.src && meta.date === today) {
            return applyWallpaper(meta.src, 'bing').then(function () {
                return cacheBingBlob(meta.src, meta.provider || 'primary', today);
            });
        }

        // WHY: 在等待网络请求时，把旧 URL 先垫到 back 层防止白屏。
        // 仅当 back 层没有背景图时才写 —— preload.js 可能已经写入了。
        if (meta.src && !wallpaperBackEl.style.backgroundImage) {
            wallpaperBackEl.style.backgroundImage = 'url(' + meta.src + ')';
        }

        // 路径 B：完全无缓存，从头获取 URL → 展示 → 下载 blob
        return fetchBingUrl().then(function (r) {
            return applyWallpaper(r.url, 'bing').then(function () {
                return cacheBingBlob(r.url, r.api, today);
            });
        }).catch(function () {
            // 网络全挂了：回退到旧 URL（如果 back 层还没有图的话）
            if (!wallpaperBackEl.style.backgroundImage && meta.src) {
                wallpaperBackEl.style.backgroundImage = 'url(' + meta.src + ')';
            }
        });
    }

    /**
     * 主加载流程 —— 按优先级尝试三个来源。
     *
     * WHY 并行读 IDB：
     *   本地图片和 Bing blob 都存在 IDB 中，并行读取比串行更快。
     *   根据上次模式（ptab_mode）和缓存新鲜度决定走哪条路径，
     *   所有路径最终都经过 applyWallpaper 的双图层过渡管线。
     */
    function loadWallpaper() {
        var lastMode = localStorage.getItem(LS_KEY_MODE) || 'bing';
        var meta = loadBingMeta();
        var today = new Date().toDateString();
        var order = loadOrder();

        return idbGet(DB_KEY_BING_BLOB).then(function (bingBlob) {
            // 优先级 1：本地模式且有图片 → 轮播
            if (lastMode === 'local') {
                return tryLoadLocalWallpaper(order).then(function (loaded) {
                    if (loaded) return;
                    return tryLoadCachedBing(bingBlob, meta, today).then(function (loaded) {
                        if (!loaded) return loadBingFromNetwork(meta, today);
                    });
                });
            }

            // 优先级 2：今日 Bing 缓存可用 → 直接用
            return tryLoadCachedBing(bingBlob, meta, today).then(function (loaded) {
                if (loaded) return;
                // 优先级 3：缓存不可用 → 走网络
                return loadBingFromNetwork(meta, today);
            });
        });
    }

    /* ================================================================
       10. 壁纸 — 本地上传、删除与画廊
       ================================================================ */

    /**
     * 生成唯一 ID 字符串。
     *
     * WHY 时间戳 + 随机数：
     *   时间戳（base-36）保证不同批次上传不冲突，
     *   随机后缀防止同一毫秒内多次调用重复。
     *   无外部依赖，比 UUID 库更轻量。
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    /**
     * 保存单张本地壁纸。先落 blob（IDB），再关联 order + thumb。
     *
     * WHY 先写 IDB 再写 localStorage：
     *   blob 体积大，写 IDB 是耗时操作；order + thumb 体积小，写 localStorage 是同步的。
     *   先落重数据再落轻数据——任何一步崩溃：blob 是孤儿，不参与轮播，安全忽略。
     *   show=true 时同步设置 ptab_mode='local'，确保后续 applyWallpaper 正确识别模式。
     */
    function saveLocalImage(file, show) {
        var id = generateId();
        var blobUrl = URL.createObjectURL(file);

        var start = show
            ? (localStorage.setItem(LS_KEY_MODE, 'local'), applyWallpaper(blobUrl, 'local'))
            : generateThumbnail(blobUrl).then(function (thumb) {
                URL.revokeObjectURL(blobUrl);
                return thumb;
            });

        return start.then(function (thumb) {
            if (!thumb) { warn('Local', 'thumbnail failed for ' + file.name); return false; }

            return idbPut(imgKey(id), { blob: file, mime: file.type || '', name: file.name || '' }).then(function () {
                var order = loadOrder();
                var thumbs = loadThumbs();
                order.push(id);
                thumbs[id] = thumb;
                saveOrder(order);
                saveThumbs(thumbs);

                var meta = loadMeta();
                meta[id] = { name: file.name || '', size: file.size || 0 };
                saveMeta(meta);

                // ★ 更新 preview_thumb：下一个新标签页将展示 order[currentIndex]
                if (show && order.length) {
                    var curIdx = (parseInt(localStorage.getItem(LS_KEY_LOCAL_INDEX)) || 0) % order.length;
                    var nextId = order[curIdx];
                    if (thumbs[nextId]) {
                        try { localStorage.setItem(LS_KEY_PREVIEW_THUMB, thumbs[nextId]); } catch (e) { /* quota */ }
                    }
                }

                return true;
            });
        }).catch(function (e) { warn('Local', 'save failed: ' + e.message); return false; });
    }

    /**
     * 删除单张本地壁纸。先切 order 引用，再删 thumb，最后删 IDB blob。
     *
     * WHY 三步删除顺序：
     *   1. 从 order 移除 → 图片立即不可达（轮播跳过它）
     *   2. 删 thumb → localStorage 释放空间
     *   3. 删 IDB blob → 最后删重数据，即使崩溃也只是留下无害的孤儿 blob
     *   最后一张删除时自动切回 Bing 模式，清理 index 和 preview_thumb。
     */
    function deleteLocalImage(id) {
        var order = loadOrder();
        if (!order.length) return;

        var newOrder = order.filter(function (oid) { return oid !== id; });
        saveOrder(newOrder);

        var thumbs = loadThumbs();
        delete thumbs[id];
        saveThumbs(thumbs);

        var meta = loadMeta();
        delete meta[id];
        saveMeta(meta);

        if (newOrder.length === 0) {
            localStorage.removeItem(LS_KEY_LOCAL_INDEX);
            localStorage.removeItem(LS_KEY_PREVIEW_THUMB);
            localStorage.setItem(LS_KEY_MODE, 'bing');
            currentMode = 'bing';
            wallpaperInfoEl.textContent = t('wpBing');
            removeLocalGallery();
            return idbDelete(imgKey(id)).then(function () { loadWallpaper(); }).catch(function () { });
        }

        return idbDelete(imgKey(id)).then(function () {
            refreshLocalGallery();
        }).catch(function (e) { warn('Local', 'delete blob failed: ' + (e && e.message)); });
    }

    /**
     * 重置为 Bing 模式。逐条删 IDB blob，再清 localStorage。
     *
     * WHY 逐条删除而非清空整个 store：
     *   只删除 pab_img_* 前缀的 key，保留 ptab_bing_blob 不受影响。
     *   Promise 链串行执行，避免并发写同一 store 导致事务冲突。
     *   多张图片时弹确认框，防止误操作。
     */
    function resetToBing() {
        var order = loadOrder();
        var count = order.length;
        if (count > 1 && !confirm(t('resetConfirm'))) return;

        currentMode = 'bing';
        removeLocalGallery();
        localStorage.removeItem(LS_KEY_BING_THUMB);
        localStorage.removeItem(LS_KEY_PREVIEW_THUMB);
        localStorage.removeItem(LS_KEY_IMG_THUMBS);
        _thumbsCache = null;
        localStorage.removeItem(LS_KEY_IMG_META);
        _metaCache = null;
        localStorage.removeItem(LS_KEY_IMG_ORDER);
        localStorage.removeItem(LS_KEY_LOCAL_INDEX);
        localStorage.setItem(LS_KEY_MODE, 'bing');

        return idbDeleteMany(order.map(function (id) { return imgKey(id); })).then(function () {
            return loadWallpaper();
        }).then(function () {
            wallpaperInfoEl.textContent = t('wpBing');
            closeSettings();
        }).catch(function () { closeSettings(); });
    }

    /* ================================================================
       11. UI — 设置面板与语言面板
       ================================================================ */

    /**
     * 打开设置面板。
     *
     * WHY 本地模式自动刷新画廊：
     *   用户可能在面板关闭期间通过其他标签页修改了图片，
     *   重新打开时刷新画廊确保显示最新状态。
     *   Bing 模式则恢复显示上传/重置按钮。
     */
    function openSettings() {
        if (isLangPanelOpen) closeLangPanel();
        if (isSettingsPanelOpen) return;
        isSettingsPanelOpen = true;
        settingsPanel.classList.add('active');
        settingsBtn.classList.add('panel-open');
        clearTimeout(cornerHideTimer);
        if (currentMode === 'local') refreshLocalGallery();
        else { uploadBtn.style.display = ''; resetBtn.style.display = ''; }
    }

    /**
     * 关闭设置面板。
     *
     * WHY 关闭时清理 blob URL：
     *   画廊中的图片通过 blob URL 预览，关闭面板后不再需要。
     *   及时 revoke 释放内存，防止长时间打开新标签页累积泄漏。
     */
    function closeSettings() {
        if (!isSettingsPanelOpen) return;
        isSettingsPanelOpen = false;
        settingsPanel.classList.remove('active');
        settingsBtn.classList.remove('panel-open');
        revokeGalleryUrls();
    }

    /**
     * 打开语言选择面板。
     *
     * WHY 与设置面板互斥：
     *   两个面板都占据右上角区域，同时打开会重叠。
     *   打开语言面板前先关闭设置面板，反之亦然。
     */
    function openLangPanel() {
        if (isSettingsPanelOpen) closeSettings();
        if (isLangPanelOpen) return;
        isLangPanelOpen = true;
        langPanel.classList.add('active');
        clearTimeout(cornerHideTimer);
    }

    /**
     * 关闭语言选择面板。
     *
     * WHY 幂等设计：
     *   多处调用（Escape、全局点击、打开设置面板）可能重复触发关闭，
     *   幂等检查避免无意义的 DOM 操作和状态重置。
     */
    function closeLangPanel() {
        if (!isLangPanelOpen) return;
        isLangPanelOpen = false;
        langPanel.classList.remove('active');
    }

    /**
     * 关闭所有面板。
     *
     * WHY 同时关闭两个：
     *   Escape 键和全局点击场景下，用户意图是"回到干净的壁纸视图"，
     *   不关心当前哪个面板是开的，全部关掉最符合直觉。
     */
    function closeAll() { closeSettings(); closeLangPanel(); }

    /* ================================================================
       12. UI — 本地壁纸画廊
       ================================================================ */

    // 追踪画廊中创建的 blob URL，关闭画廊时必须清理，防止内存泄漏
    var _galleryBlobUrls = [];

    /**
     * 撤销所有画廊 blob URL，释放内存。
     *
     * WHY 必须在关闭画廊时调用：
     *   blob URL 持有对 Blob 的引用，不 revoke 会导致 Blob 无法被 GC 回收。
     *   用户可能反复开关设置面板，每次都要清理上次的 URL 再创建新的。
     */
    function revokeGalleryUrls() {
        _galleryBlobUrls.forEach(function (url) { URL.revokeObjectURL(url); });
        _galleryBlobUrls = [];
    }

    /**
     * 隐藏本地壁纸画廊，恢复上传/重置按钮。
     *
     * WHY 恢复按钮显示：
     *   画廊模式下上传/重置按钮被隐藏（由 renderLocalGallery 控制），
     *   删除最后一张图片或重置为 Bing 时需要恢复这些按钮。
     */
    function removeLocalGallery() {
        revokeGalleryUrls();
        var gallery = document.getElementById('localGallery');
        if (gallery) gallery.style.display = 'none';
        uploadBtn.style.display = '';
        resetBtn.style.display = '';
    }

    /**
     * 从缓存或 IDB 加载本地图片元数据，重新渲染画廊。
     *
     * WHY 优先读 localStorage 元数据缓存：
     *   画廊只需要 .name（tooltip）和 .blob（缩略图缺失时的 fallback），
     *   而 IDB 中存储的是完整 blob（12 张 1920×1080 可达 50MB+）。
     *   ptab_img_meta 缓存只存 {name, size}（~1KB），常见路径零 IDB 读取。
     *   首次打开或缓存缺失时 fallback 到 IDB 全量读取，并回填缓存。
     */
    function refreshLocalGallery() {
        if (currentMode !== 'local') return;
        var order = loadOrder();
        if (!order.length) return;
        var thumbs = loadThumbs();
        var meta = loadMeta();

        // 快速路径：所有图片都有缓存的元数据和缩略图 → 零 IDB 读取
        var allCached = order.every(function (id) { return meta[id] && thumbs[id]; });
        if (allCached) {
            renderLocalGallery(order, order.map(function (id) { return meta[id]; }), thumbs);
            return;
        }

        // 慢速路径：有缺失时 fallback 到 IDB 全量读取
        var reads = order.map(function (id) { return idbGet(imgKey(id)); });
        Promise.all(reads).then(function (images) {
            // 顺便回填缓存，下次就走快速路径
            var m = loadMeta();
            var changed = false;
            images.forEach(function (img, i) {
                if (img && !m[order[i]]) {
                    m[order[i]] = { name: img.name || '', size: img.size || 0 };
                    changed = true;
                }
            });
            if (changed) saveMeta(m);
            renderLocalGallery(order, images, thumbs);
        }).catch(function () { });
    }

    /**
     * 获取或创建画廊容器 DOM 元素。
     *
     * WHY 复用而非重建：
     *   画廊容器在整个会话中可能被多次打开/关闭，
     *   复用已有 DOM 节点避免重复创建和插入，减少 GC 压力。
     *   每次调用清空子元素，确保内容与当前数据同步。
     */
    function ensureGalleryContainer() {
        var gallery = document.getElementById('localGallery');
        if (!gallery) {
            gallery = document.createElement('div');
            gallery.id = 'localGallery';
            gallery.className = 'local-gallery';
            wallpaperInfoEl.parentNode.insertBefore(gallery, uploadBtn);
        }
        // 清空旧内容
        gallery.replaceChildren();
        gallery.style.display = 'block';
        return gallery;
    }

    /**
     * 构建缩略图网格，每张卡片含删除按钮。
     *
     * WHY 优先用 base64 缩略图：
     *   ptab_img_thumbs 中的 base64 是预生成的，直接用无需解码，
     *   比 blob URL 快且不占 IDB 事务。仅在缩略图缺失时回退到 blob URL。
     *   回退创建的 blob URL 记入 _galleryUrls，关闭画廊时统一 revoke。
     */
    function buildGalleryGrid(order, images, thumbs) {
        var grid = document.createElement('div');
        grid.className = 'local-gallery-grid';

        order.forEach(function (id, i) {
            var card = document.createElement('div');
            card.className = 'local-thumb';
            card.setAttribute('data-id', id);
            card.setAttribute('draggable', 'false');

            // 优先用预生成的 base64 缩略图（localStorage），缺失时回退到 blob URL
            var bg = thumbs[id];
            var imgMeta = images[i];
            if (!bg && imgMeta && imgMeta.blob && imgMeta.blob.size > 0) {
                var url = URL.createObjectURL(imgMeta.blob);
                _galleryBlobUrls.push(url);
                bg = 'url(' + url + ')';
            }
            if (bg) card.style.backgroundImage = bg;

            var delBtn = document.createElement('button');
            delBtn.className = 'local-thumb-del';
            delBtn.title = t('deleteImage') + (imgMeta && imgMeta.name ? ': ' + imgMeta.name : '');
            delBtn.setAttribute('data-id', id);
            delBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                deleteLocalImage(this.dataset.id);
            });
            card.appendChild(delBtn);
            grid.appendChild(card);
        });

        return grid;
    }

    /**
     * 为画廊网格绑定长按拖拽排序。
     *
     * WHY 长按而非立即拖拽：
     *   画廊卡片上有删除按钮，短点击需要留给删除。
     *   300ms 长按与 iOS/Android 原生交互一致，用户有直觉。
     *   移动超 8px 阈值取消长按，避免滑动误触发。
     *
     * WHY pointer events 而非 HTML5 drag API：
     *   HTML5 drag API 在触屏设备上支持不一致（Safari 尤其差）。
     *   pointer events 统一鼠标和触屏，行为完全可控。
     *   拖拽卡片设 pointer-events:none 防止自身拦截事件。
     *
     * WHY DOM insertBefore 而非 CSS transform：
     *   CSS Grid 布局中 transform 不改变文档流，其他卡片不会让位。
     *   移动占位符 DOM 节点让 grid 自动重排，代码简单且可靠。
     */
    function setupGalleryDrag(grid) {
        var pressTimer = null;
        grid.style.touchAction = 'none'; // 防止触屏设备拖拽时触发滚动

        function getCard(e) {
            var el = e.target;
            while (el && el !== grid) {
                if (el.classList && el.classList.contains('local-thumb')) return el;
                el = el.parentNode;
            }
            return null;
        }

        function onPointerDown(e) {
            if (e.button !== 0) return; // 只响应左键/单指
            var card = getCard(e);
            if (!card || e.target.classList.contains('local-thumb-del')) return;

            var startX = e.clientX, startY = e.clientY;

            pressTimer = setTimeout(function () {
                pressTimer = null;

                // 锁定指针捕获，防止触屏滚动
                try { card.setPointerCapture(e.pointerId); } catch (ex) { }

                // 创建占位符保持 grid 布局
                var placeholder = document.createElement('div');
                placeholder.className = 'local-thumb drag-placeholder';
                placeholder.style.height = card.offsetHeight + 'px';
                card.parentNode.insertBefore(placeholder, card);

                // 拖拽卡片浮起
                var rect = card.getBoundingClientRect();
                card.classList.add('dragging');
                document.body.appendChild(card);
                card.style.position = 'fixed';
                card.style.width = rect.width + 'px';
                card.style.height = rect.height + 'px';
                card.style.left = rect.left + 'px';
                card.style.top = rect.top + 'px';
                card.style.margin = '0';

                var dragState = {
                    card: card,
                    placeholder: placeholder,
                    lastX: startX,
                    lastTime: Date.now(),
                    animating: false // FLIP 动画进行中时跳过新的占位符移动
                };

                function onMove(ev) {
                    ev.preventDefault();
                    // 速度追踪（用于倾斜效果）
                    var now = Date.now();
                    var dt = Math.max(now - dragState.lastTime, 1);
                    var vx = (ev.clientX - dragState.lastX) / dt; // px/ms
                    dragState.lastX = ev.clientX;
                    dragState.lastTime = now;

                    // 卡片跟随指针
                    dragState.card.style.left = (ev.clientX - rect.width / 2) + 'px';
                    dragState.card.style.top = (ev.clientY - rect.height / 2) + 'px';

                    // 倾斜效果：速度越快倾斜越大，上限 ±3°（缓动平滑）
                    var targetTilt = Math.max(-3, Math.min(3, vx * 8));
                    var prevTilt = parseFloat(dragState.card.dataset.tilt) || 0;
                    var tilt = prevTilt + (targetTilt - prevTilt) * 0.3; // 低通滤波，减少抖动
                    dragState.card.dataset.tilt = tilt;
                    var scale = 1.08;
                    dragState.card.style.transform = 'scale(' + scale + ') rotate(' + tilt + 'deg)';

                    // 检测目标位置：遍历 grid 子元素，找到指针下方的卡片
                    var children = Array.prototype.slice.call(grid.children);
                    var phIdx = children.indexOf(dragState.placeholder);
                    for (var i = 0; i < children.length; i++) {
                        if (children[i] === dragState.placeholder) continue;
                        var r = children[i].getBoundingClientRect();
                        if (ev.clientX >= r.left && ev.clientX <= r.right &&
                            ev.clientY >= r.top && ev.clientY <= r.bottom) {
                            var targetIdx = i;
                            // FLIP 动画进行中时跳过，避免快速滑动导致连续触发抖动
                            if (dragState.animating) break;
                            dragState.animating = true;
                            // FLIP：记录所有卡片旧位置
                            var cards = Array.prototype.filter.call(grid.children, function (c) {
                                return c !== dragState.placeholder && c !== dragState.card;
                            });
                            var oldPos = {};
                            for (var ci = 0; ci < cards.length; ci++) {
                                var cr = cards[ci].getBoundingClientRect();
                                oldPos[cards[ci].dataset.id] = { left: cr.left, top: cr.top };
                            }
                            // DOM 移动占位符
                            if (targetIdx < phIdx) {
                                grid.insertBefore(dragState.placeholder, children[targetIdx]);
                            } else {
                                grid.insertBefore(dragState.placeholder, children[targetIdx + 1] || null);
                            }
                            // FLIP：计算位移并施加反向 transform
                            for (var ci = 0; ci < cards.length; ci++) {
                                var c = cards[ci];
                                var old = oldPos[c.dataset.id];
                                if (!old) continue;
                                var nr = c.getBoundingClientRect();
                                var dx = old.left - nr.left;
                                var dy = old.top - nr.top;
                                if (dx === 0 && dy === 0) continue;
                                c.style.transition = 'none';
                                c.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
                            }
                            // 强制 reflow 后播放动画
                            void grid.offsetHeight;
                            for (var ci = 0; ci < cards.length; ci++) {
                                cards[ci].style.transition = 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)';
                                cards[ci].style.transform = '';
                            }
                            // 动画结束后解锁
                            setTimeout(function () { dragState.animating = false; }, 260);
                            break;
                        }
                    }
                }

                function onUp() {
                    // 归位动画：spring easing 产生可见回弹
                    var phRect = dragState.placeholder.getBoundingClientRect();
                    // cubic-bezier(0.34, 1.3, 0.64, 1) 过冲 30%，回弹可见但不夸张
                    var spring = 'left 0.3s cubic-bezier(0.34, 1.3, 0.64, 1), ' +
                                 'top 0.3s cubic-bezier(0.34, 1.3, 0.64, 1), ' +
                                 'opacity 0.2s, transform 0.3s cubic-bezier(0.34, 1.3, 0.64, 1), ' +
                                 'box-shadow 0.25s';
                    dragState.card.style.transition = spring;
                    dragState.card.style.left = phRect.left + 'px';
                    dragState.card.style.top = phRect.top + 'px';
                    dragState.card.style.opacity = '1';
                    dragState.card.style.transform = '';
                    dragState.card.style.boxShadow = '';

                    setTimeout(function () {
                        // 恢复卡片到 grid 中（保留 background-image，只清除拖拽样式）
                        dragState.card.classList.remove('dragging');
                        var s = dragState.card.style;
                        s.position = ''; s.width = ''; s.height = '';
                        s.left = ''; s.top = ''; s.margin = '';
                        s.transition = ''; s.opacity = ''; s.transform = '';
                        s.zIndex = ''; s.pointerEvents = ''; s.boxShadow = '';
                        grid.insertBefore(dragState.card, dragState.placeholder);
                        grid.removeChild(dragState.placeholder);

                        // 清除 FLIP 残留的 transition/transform
                        var allCards = grid.querySelectorAll('.local-thumb');
                        for (var ci = 0; ci < allCards.length; ci++) {
                            allCards[ci].style.transition = '';
                            allCards[ci].style.transform = '';
                        }

                        // 从 DOM 顺序提取新 order 并持久化
                        var newOrder = [];
                        Array.prototype.forEach.call(grid.querySelectorAll('.local-thumb[data-id]'), function (c) {
                            newOrder.push(c.dataset.id);
                        });
                        var oldOrder = loadOrder();
                        if (newOrder.length === oldOrder.length &&
                            newOrder.some(function (id, i) { return id !== oldOrder[i]; })) {
                            saveOrder(newOrder);
                            // 同步更新 preview_thumb，确保下个新标签页展示正确的下一张
                            var idx = parseInt(localStorage.getItem(LS_KEY_LOCAL_INDEX)) || 0;
                            var thumbs = loadThumbs();
                            var nextId = newOrder[idx % newOrder.length];
                            if (thumbs[nextId]) {
                                try { localStorage.setItem(LS_KEY_PREVIEW_THUMB, thumbs[nextId]); } catch (ex) { }
                            }
                        }
                    }, 300);

                    document.removeEventListener('pointermove', onMove);
                    document.removeEventListener('pointerup', onUp);
                }

                document.addEventListener('pointermove', onMove);
                document.addEventListener('pointerup', onUp);
            }, 300);

            // 移动超阈值取消长按
            function onCancelMove(ev) {
                if (pressTimer && (Math.abs(ev.clientX - startX) > 8 || Math.abs(ev.clientY - startY) > 8)) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                    document.removeEventListener('pointermove', onCancelMove);
                }
            }

            function onCancelUp() {
                clearTimeout(pressTimer);
                pressTimer = null;
                document.removeEventListener('pointermove', onCancelMove);
                document.removeEventListener('pointerup', onCancelUp);
            }

            document.addEventListener('pointermove', onCancelMove);
            document.addEventListener('pointerup', onCancelUp);
        }

        grid.addEventListener('pointerdown', onPointerDown);
    }

    /**
     * 渲染本地壁纸画廊：缩略图网格 + 添加按钮。
     *
     * WHY 上限 12 张：
     *   localStorage 缩略图占用空间（每张 ~20KB base64），12 张已足够轮播多样性。
     *   超过上限时隐藏添加按钮，防止用户无感知地超出 quota。
     *   添加按钮复用 fileInput 的 change 事件，通过 _keepGalleryOpen 标记保持面板打开。
     */
    function renderLocalGallery(order, images, thumbs) {
        revokeGalleryUrls();
        var gallery = ensureGalleryContainer();

        wallpaperInfoEl.textContent = t('wpLocal') + ' · ' + order.length + ' ' + t('imageCount');

        var grid = buildGalleryGrid(order, images, thumbs);
        gallery.appendChild(grid);
        setupGalleryDrag(grid);

        // WHY: 上限 12 张 —— localStorage 缩略图占用空间，12 张已足够轮播多样性
        if (order.length < 12) {
            var addBtn = document.createElement('button');
            addBtn.className = 'panel-btn primary';
            addBtn.textContent = '+ ' + t('addImage');
            addBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                _keepGalleryOpen = true;
                fileInput.click();
            });
            gallery.appendChild(addBtn);
        }

        uploadBtn.style.display = 'none';
    }

    /* ================================================================
       13. UI — 角落按钮与搜索栏显隐逻辑

       WHY 角落按钮默认隐藏：
         保持壁纸的干净视觉效果。按钮仅在鼠标移到右上角时淡入。
         面板打开时始终保持可见，避免用户找不到关闭按钮。
       ================================================================ */

    /**
     * 淡入角落按钮。
     *
     * WHY 用 CSS class 而非直接操作 style：
     *   .visible class 触发 CSS transition，动画由 GPU 合成层处理，
     *   比 JS 逐帧修改 opacity 更流畅。class 切换也让状态可从 DOM 上读取。
     */
    function showCorners() {
        if (settingsBtn.classList.contains('visible')) return;
        settingsBtn.classList.add('visible');
        langBtn.classList.add('visible');
    }

    /**
     * 延迟隐藏角落按钮。
     *
     * WHY 400ms 延迟：
     *   防止用户鼠标稍微移出触发区域就立即隐藏。
     *   但如果面板正在打开状态，隐藏会被跳过 —— 面板需要这些按钮。
     */
    function hideCorners() {
        if (isSettingsPanelOpen || isLangPanelOpen) return;
        clearTimeout(cornerHideTimer);
        cornerHideTimer = setTimeout(function () {
            if (!isMouseInCornerZone && !isSettingsPanelOpen && !isLangPanelOpen) {
                settingsBtn.classList.remove('visible');
                langBtn.classList.remove('visible');
            }
        }, 400);
    }

    /**
     * 鼠标是否在右上角触发区域（宽 180px × 高 130px）。
     *
     * WHY 硬编码像素值：
     *   角落按钮和面板的尺寸是固定的，像素值比百分比更精确，
     *   避免在不同分辨率下触发区域过大或过小。
     */
    function isNearTopRight(x, y) { return x > window.innerWidth - 180 && y < 130; }

    /**
     * 鼠标是否在屏幕中心区域。
     *
     * WHY 只在中心区域触发搜索栏：
     *   用户移到角落操作按钮时不应弹出搜索栏。
     *   30%-70% 的宽高范围覆盖了用户的自然视线焦点。
     */
    function isInCenter(x, y) {
        var w = window.innerWidth, h = window.innerHeight;
        return x > w * 0.3 && x < w * 0.7 && y > h * 0.42 && y < h * 0.58;
    }

    /**
     * 显示搜索栏。
     *
     * WHY 三种模式分别处理：
     *   'never' 直接返回（不显示），'always' 立即显示（无需隐藏计时器），
     *   'hover' 清除隐藏计时器后显示，确保鼠标快速移入时不会闪烁。
     */
    function showSearch() {
        if (searchMode === 'never') return;
        if (searchBar.classList.contains('visible')) return;
        if (searchMode === 'always') { searchBar.classList.add('visible'); return; }
        clearTimeout(searchHideTimer);
        searchBar.classList.add('visible');
    }

    /**
     * 延迟隐藏搜索栏。
     *
     * WHY 150ms 延迟 + 聚焦保护：
     *   用户可能在搜索栏和页面其他区域之间移动鼠标。
     *   输入框聚焦时绝不隐藏 —— 用户在打字。
     */
    function hideSearch() {
        if (searchMode === 'always') return;
        if (document.activeElement === searchInput) return;
        clearTimeout(searchHideTimer);
        searchHideTimer = setTimeout(function () {
            if (!isMouseInSearchZone && document.activeElement !== searchInput) searchBar.classList.remove('visible');
        }, 150);
    }

    /* ================================================================
       14. UI — 搜索设置控件
       ================================================================ */

    /**
     * 设置搜索栏显示模式。
     *
     * WHY 'always' 模式用 class toggle：
     *   always 模式下搜索栏常驻显示，toggle class 确保状态与模式一致。
     *   hover/never 模式的显隐由鼠标事件和 showSearch/hideSearch 控制。
     */
    function applySearchMode(mode) {
        searchMode = mode;
        searchBar.classList.toggle('visible', mode === 'always');
    }

    /**
     * 应用图标透明度。
     *
     * WHY 用 CSS 自定义属性 --icon-opacity：
     *   所有角落图标和面板元素的透明度由一个值统一控制。
     *   修改 CSS 变量一次即可刷新所有元素，无需逐个操作 DOM。
     */
    function applyOpacity(val) {
        currentOpacity = parseFloat(val);
        document.documentElement.style.setProperty('--icon-opacity', currentOpacity);
        opacityRange.value = currentOpacity;
        opacityNumInput.value = currentOpacity;
    }

    /**
     * 切换搜索引擎并更新图标和下拉框。
     *
     * WHY 同时更新三处：
     *   engineIcon（页面可见图标）、engineSelect（设置面板下拉框）、
     *   saveSettings（持久化），确保 UI 状态与存储状态一致。
     */
    function applyEngine(engine) {
        currentEngine = engine;
        engineIndex = ENGINES.indexOf(engine);
        engineIcon.innerHTML = ENGINE_SVG[engine] || ENGINE_SVG.google;
        engineSelect.value = engine;
        saveSettings();
    }

    /**
     * 轮换到下一个搜索引擎。
     *
     * WHY 用取模循环：
     *   ENGINES 数组长度固定（4），取模确保到达末尾后自动回到第一个，
     *   用户点击图标即可无限循环切换，无需打开设置面板。
     */
    function nextEngine() {
        engineIndex = (engineIndex + 1) % ENGINES.length;
        applyEngine(ENGINES[engineIndex]);
    }

    /**
     * 持久化搜索相关设置到 localStorage。
     *
     * WHY 三个设置一次写入：
     *   searchMode、opacity、engine 三个值总是一起保存，
     *   批量写入减少 localStorage 的同步 I/O 次数。
     */
    function saveSettings() {
        localStorage.setItem(LS_KEY_SEARCH_MODE, searchMode);
        localStorage.setItem(LS_KEY_ICON_OPACITY, currentOpacity);
        localStorage.setItem(LS_KEY_SEARCH_ENGINE, currentEngine);
    }

    /**
     * 从 localStorage 恢复所有搜索相关设置。
     *
     * WHY 启动时调用一次：
     *   设置值在会话期间不会被外部修改（单标签页独占），
     *   启动时恢复一次即可，后续通过 apply* 函数实时更新。
     *   缺失值使用 DEFAULT_* 常量，确保首次使用体验一致。
     */
    function loadSettings() {
        var mode = localStorage.getItem(LS_KEY_SEARCH_MODE) || DEFAULT_SEARCH_MODE;
        var storedOpacity = localStorage.getItem(LS_KEY_ICON_OPACITY);
        var opacity = storedOpacity !== null ? parseFloat(storedOpacity) : DEFAULT_OPACITY;
        var engine = localStorage.getItem(LS_KEY_SEARCH_ENGINE) || DEFAULT_ENGINE;
        searchModeSelect.value = mode;
        applySearchMode(mode);
        applyOpacity(opacity);
        applyEngine(engine);
    }

    /* ================================================================
       15. 搜索引擎配置

       WHY 内联 SVG：
         无需外部图标字体或图片文件。SVG 体积小、可缩放、支持 CSS 着色。
         直接嵌入 JS 避免了额外的 HTTP 请求。
       ================================================================ */

    var ENGINES = ['google', 'bing', 'baidu', 'duckduckgo'];

    var ENGINE_SVG = {
        google: '<svg height="1em" viewBox="0 0 24 24" width="1em"><path d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z" fill="#4285F4"/><path d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z" fill="#34A853"/><path d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z" fill="#FBBC05"/><path d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z" fill="#EB4335"/></svg>',
        bing: '<svg height="1em" viewBox="0 0 24 24" width="1em"><defs><radialGradient cx="93.7%" cy="77.8%" r="143.7%" id="b0"><stop offset="0%" stop-color="#00CACC"/><stop offset="100%" stop-color="#048FCE"/></radialGradient><radialGradient cx="13.9%" cy="71.4%" r="149.2%" id="b1"><stop offset="0%" stop-color="#00BBEC"/><stop offset="100%" stop-color="#2756A9"/></radialGradient><linearGradient id="b2" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#00BBEC"/><stop offset="100%" stop-color="#2756A9"/></linearGradient></defs><path d="M11.97 7.57a.92.92 0 00-.805.863c-.013.195-.01.209.43 1.347 1 2.59 1.242 3.214 1.283 3.302.099.213.237.413.41.592.134.138.222.212.37.311.26.176.39.224 1.405.527.989.295 1.529.49 1.994.723.603.302 1.024.644 1.29 1.051.191.292.36.815.434 1.342.029.206.029.661 0 .847a2.491 2.491 0 01-.376 1.026c-.1.151-.065.126.081-.058.415-.52.838-1.408 1.054-2.213a6.728 6.728 0 00.102-3.012 6.626 6.626 0 00-3.291-4.53l-1.322-.698-.254-.133-1.575-.827c-.548-.29-.78-.406-.846-.426a1.376 1.376 0 00-.29-.045l-.093.01z" fill="url(#b0)"/><path d="M13.164 17.24l-.202.125-1.795 1.115-.989.614-.463.288-1.502.941c-.326.2-.704.334-1.09.387-.18.024-.52.024-.7 0a2.807 2.807 0 01-1.318-.538 3.665 3.665 0 01-.543-.545 2.837 2.837 0 01-.506-1.141l-.041-.182c-.008-.008.006.138.032.33.027.199.085.487.147.733.482 1.907 1.85 3.457 3.705 4.195a6.31 6.31 0 001.658.412c.22.025.844.035 1.074.017 1.054-.08 1.972-.393 2.913-.992l.937-.596.384-.244.684-.435.234-.149.009-.005.025-.017.013-.007.172-.11.597-.38c.76-.481.987-.65 1.34-.998.148-.146.37-.394.381-.425l.088-.136a2.49 2.49 0 00.373-1.023 4.181 4.181 0 000-.847 4.336 4.336 0 00-.318-1.137c-.224-.472-.7-.9-1.383-1.245l-.406-.181c-.01 0-.646.392-1.413.87l-1.658 1.031-.439.274z" fill="url(#b1)"/><path d="M4.003 14.946l.004 3.33.042.193c.134.604.366 1.04.77 1.445a2.701 2.701 0 001.955.814c.536 0 1-.135 1.479-.43l.703-.435.556-.346V8.003c0-2.306-.004-3.675-.012-3.782a2.734 2.734 0 00-.797-1.765c-.145-.144-.268-.24-.637-.496L5.762.362C5.406.115 5.38.098 5.271.059a.943.943 0 00-1.254.696C4.003.818 4 1.659 4 6.223v5.394H4l.003 3.329z" fill="url(#b2)"/></svg>',
        duckduckgo: '<svg viewBox="0 0 122.88 122.88"><defs><style>.a{fill:#d53}.b{fill:#fff}.c{fill:#ddd}.d{fill:#fc0}.e{fill:#6b5}.f{fill:#4a4}.g{fill:#148}</style></defs><path class="a" d="M122.88 61.44a61.44 61.44 0 10-61.44 61.44 61.44 61.44 0 0061.44-61.44z"/><path class="b" d="M114.37 61.44a52.92 52.92 0 10-15.5 37.43 52.76 52.76 0 0015.5-37.43zm-13.12-39.8A56.29 56.29 0 1161.44 5.15a56.12 56.12 0 0139.81 16.49z"/><path class="c" d="M43.24 30.15C26.17 34.13 32.43 58 32.43 58l10.81 52.9 4 1.71-4-82.49zm-4-10.24H34.7L41 22.19s-6.26 0-6.26 4C48.36 25.6 54.61 29 54.61 29l-15.36-9.1z"/><path class="b" d="M75.66 115.48S62 93.87 62 79.64c0-26.73 17.63-4 17.63-25S62 28.44 62 28.44c-8.53-10.8-25-8.53-25-8.53l4 2.28s-4 1.13-5.12 2.27 10.81-1.7 15.93 2.85C30.72 29 34.13 46.08 34.13 46.08l11.95 68.27 29.58 1.13z"/><path class="d" d="M75.66 60.87l21.62-5.69C116.62 58 80.78 68.84 78.51 68.27c-17.07-2.85-12 11.37 8.53 6.82s5.12 11.38-13.65 5.12c-26.74-7.39-12.52-20.48 2.27-19.34z"/><path class="e" d="M70 105.81l1.14-1.7c12.52 4.55 13.09 6.25 12.52-5.12s0-11.38-13.09-1.71c0-2.84-7.39-1.71-8.53 0-11.95-5.12-13.09-6.83-12.52 1.14 1.14 16.5.57 13.65 11.95 8l8.53-.57z"/><path class="f" d="M60.87 99.56v6.82c.57 1.14 9.67 1.14 9.67-1.14s-4.55 1.71-7.39.57S62 98.42 62 98.42l-1.14 1.14z"/><path class="g" d="M48.36 43.24c-2.85-3.42-10.24-.57-8.54 4 .57-2.28 4.55-5.69 8.54-4zm18.2 0c.57-3.42 6.26-4 8-.57a8 8 0 00-8 .57zm-18.77 9.1a1.14 1.14 0 110 .57v-.57zm-4.55 2.27a4 4 0 100-.57v.57zm29.58-4a1.14 1.14 0 110 .57v-.57zM69.4 52.91a3.42 3.42 0 100-.57v.57z"/></svg>',
        baidu: '<svg height="1em" viewBox="0 0 24 24" width="1em"><path d="M8.859 11.735c1.017-1.71 4.059-3.083 6.202.286 1.579 2.284 4.284 4.397 4.284 4.397s2.027 1.601.73 4.684c-1.24 2.956-5.64 1.607-6.005 1.49l-.024-.009s-1.746-.568-3.776-.112c-2.026.458-3.773.286-3.773.286l-.045-.001c-.328-.01-2.38-.187-3.001-2.968-.675-3.028 2.365-4.687 2.592-4.968.226-.288 1.802-1.37 2.816-3.085zm.986 1.738v2.032h-1.64s-1.64.138-2.213 2.014c-.2 1.252.177 1.99.242 2.148.067.157.596 1.073 1.927 1.342h3.078v-7.514l-1.394-.022zm3.588 2.191l-1.44.024v3.956s.064.985 1.44 1.344h3.541v-5.3h-1.528v3.979h-1.46s-.466-.068-.553-.447v-3.556zM9.82 16.715v3.06H8.58s-.863-.045-1.126-1.049c-.136-.445.02-.959.088-1.16.063-.203.353-.671.951-.85H9.82zm9.525-9.036c2.086 0 2.646 2.06 2.646 2.742 0 .688.284 3.597-2.309 3.655-2.595.057-2.704-1.77-2.704-3.08 0-1.374.277-3.317 2.367-3.317zM4.24 6.08c1.523-.135 2.645 1.55 2.762 2.513.07.625.393 3.486-1.975 4-2.364.515-3.244-2.249-2.984-3.544 0 0 .28-2.797 2.197-2.969zm8.847-1.483c.14-1.31 1.69-3.316 2.931-3.028 1.236.285 2.367 1.944 2.137 3.37-.224 1.428-1.345 3.313-3.095 3.082-1.748-.226-2.143-1.823-1.973-3.424zM9.425 1c1.307 0 2.364 1.519 2.364 3.398 0 1.879-1.057 3.4-2.364 3.4s-2.367-1.521-2.367-3.4C7.058 2.518 8.118 1 9.425 1z" fill="#2932E1"/></svg>'
    };

    /**
     * Web 模式的搜索行为 —— 在新标签页打开对应引擎的搜索结果。
     *
     * WHY 用 _self 而非 _blank：
     *   新标签页本身就是搜索结果页，用 _self 直接替换当前页面，
     *   避免用户需要手动关闭空的新标签页。
     *   扩展模式下此函数会被 setupExtensionMode 覆盖为 chrome.search.query。
     */
    var doSearch = function (query) {
        if (!query.trim()) return;
        var urls = { google: 'https://www.google.com/search?q=', bing: 'https://www.bing.com/search?q=', baidu: 'https://www.baidu.com/s?wd=', duckduckgo: 'https://duckduckgo.com/?q=' };
        window.open(urls[currentEngine] + encodeURIComponent(query), '_self');
    };

    /* ================================================================
       16. 扩展模式

       WHY 使用 chrome.search.query() 替代多引擎：
         Chrome Web Store 单一用途政策要求扩展只能做一件事。
         用浏览器的默认搜索引擎执行搜索（chrome.search.query），
         而不是让用户在多个引擎间选择，满足 CWS 合规要求。
         permission manifest 中的 "search" 权限也是为此 API 必需的。
       ================================================================ */

    /**
     * 配置扩展模式：覆盖搜索行为，隐藏引擎选择器。
     *
     * WHY 覆盖 doSearch 而非条件分支：
     *   启动时一次性覆盖函数引用，后续调用无需每次检查 IS_EXTENSION，
     *   消除运行时的条件判断开销。引擎图标改为静态放大镜，
     *   pointer-events: none 防止用户点击，比隐藏更直观。
     */
    function setupExtensionMode() {
        doSearch = function (query) {
            if (!query.trim()) return;
            try {
                chrome.search.query({ text: query, disposition: 'CURRENT_TAB' });
            } catch (e) {
                window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_self');
            }
        };
        // 扩展模式下搜索引擎图标变为静态放大镜，不可点击切换
        engineIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><g clip-path="url(#a)"><path d="M14 12.94 10.16 9.1c1.25-1.76 1.1-4.2-.48-5.78a4.49 4.49 0 0 0-6.36 0 4.49 4.49 0 0 0 0 6.36 4.486 4.486 0 0 0 5.78.48L12.94 14 14 12.94ZM4.38 8.62a3 3 0 0 1 0-4.24 3 3 0 0 1 4.24 0 3 3 0 0 1 0 4.24 3 3 0 0 1-4.24 0Z"/></g><defs><clipPath id="a"><path d="M0 0h16v16H0z"/></clipPath></defs></svg>';
        engineIcon.style.opacity = String(DEFAULT_OPACITY);
        engineIcon.style.pointerEvents = 'none';
        // 隐藏搜索引擎选择行 —— 扩展模式下不适用
        engineSelect.closest('.setting-row').style.display = 'none';
    }

    /* ================================================================
       17. 事件绑定

       WHY 所有事件绑定集中管理：
         方便一目了然地看到整个页面的交互逻辑，
         避免绑定代码散落在各功能函数中难以追踪。
       ================================================================ */

    // 标记画廊 "+" 按钮触发的上传（保持面板打开）
    var _keepGalleryOpen = false;

    /**
     * 绑定所有事件监听器。
     *
     * WHY 集中管理：
     *   方便一目了然地看到整个页面的交互逻辑，
     *   避免绑定代码散落在各功能函数中难以追踪。
     *   包括角落按钮、搜索栏、键盘快捷键、全局点击、面板交互、设置控件。
     */
    function bindEvents() {
        // --- 角落按钮：点击与悬停 ---

        settingsBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            isSettingsPanelOpen ? closeSettings() : openSettings();
        });
        settingsBtn.addEventListener('mouseenter', function () { isMouseInCornerZone = true; showCorners(); });
        settingsBtn.addEventListener('mouseleave', function () { isMouseInCornerZone = false; if (!isSettingsPanelOpen && !isLangPanelOpen) hideCorners(); });

        langBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            isLangPanelOpen ? closeLangPanel() : openLangPanel();
        });
        langBtn.addEventListener('mouseenter', function () { isMouseInCornerZone = true; showCorners(); });
        langBtn.addEventListener('mouseleave', function () { isMouseInCornerZone = false; if (!isSettingsPanelOpen && !isLangPanelOpen) hideCorners(); });

        // --- 全局鼠标跟踪 ---

        // WHY rAF 节流：mousemove 可达 120+ Hz，rAF 限制到帧率（60 Hz），
        // 避免每像素移动都执行位置检查和 DOM 操作。
        // 用模块变量缓存最新坐标，因为 rAF 回调时事件对象已被复用。
        var _lastMouseX = 0, _lastMouseY = 0, _mouseRafPending = false;
        document.addEventListener('mousemove', function (e) {
            _lastMouseX = e.clientX;
            _lastMouseY = e.clientY;
            if (_mouseRafPending) return;
            _mouseRafPending = true;
            requestAnimationFrame(function () {
                _mouseRafPending = false;
                if (isNearTopRight(_lastMouseX, _lastMouseY)) showCorners();
                else if (!isMouseInCornerZone && !isSettingsPanelOpen && !isLangPanelOpen) hideCorners();
                if (isInCenter(_lastMouseX, _lastMouseY)) showSearch();
                else hideSearch();
            });
        });

        // --- 搜索栏 ---

        searchBar.addEventListener('mouseenter', function () { isMouseInSearchZone = true; clearTimeout(searchHideTimer); });
        searchBar.addEventListener('mouseleave', function () { isMouseInSearchZone = false; hideSearch(); });
        searchInput.addEventListener('focus', function () { searchBar.classList.add('visible'); clearTimeout(searchHideTimer); });
        searchInput.addEventListener('blur', function () { hideSearch(); });

        // --- 键盘快捷键 ---

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeAll(); hideCorners(); }
            // WHY: Ctrl+Shift+W (Cmd+Shift+W on Mac) 作为设置面板的键盘快捷键
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'W') { e.preventDefault(); isSettingsPanelOpen ? closeSettings() : openSettings(); }
            if (e.key === 'Enter' && document.activeElement === searchInput) doSearch(searchInput.value);
        });

        // --- 全局点击关闭 ---

        document.addEventListener('click', function (e) {
            if (isSettingsPanelOpen && !settingsPanel.contains(e.target) && e.target !== settingsBtn && !settingsBtn.contains(e.target)) closeSettings();
            if (isLangPanelOpen && !langPanel.contains(e.target) && e.target !== langBtn && !langBtn.contains(e.target)) closeLangPanel();
            hideCorners();
        });

        // --- 面板鼠标交互 ---

        settingsPanel.addEventListener('mouseenter', function () { clearTimeout(cornerHideTimer); isMouseInCornerZone = true; });
        settingsPanel.addEventListener('mouseleave', function () { isMouseInCornerZone = false; cornerHideTimer = setTimeout(function () { closeSettings(); hideCorners(); }, 500); });
        settingsPanel.addEventListener('click', function (e) { e.stopPropagation(); });

        langPanel.addEventListener('mouseenter', function () { clearTimeout(cornerHideTimer); isMouseInCornerZone = true; });
        langPanel.addEventListener('mouseleave', function () { isMouseInCornerZone = false; cornerHideTimer = setTimeout(function () { closeLangPanel(); hideCorners(); }, 500); });
        langPanel.addEventListener('click', function (e) { e.stopPropagation(); });

        // --- 设置面板内控件 ---

        uploadBtn.addEventListener('click', function (e) { e.stopPropagation(); _keepGalleryOpen = false; fileInput.click(); });

        fileInput.addEventListener('change', function () {
            var all = Array.from(fileInput.files || []);
            var files = all.filter(function (f) { return f.type && f.type.match(/^image\//); });
            fileInput.value = '';

            if (!files.length) return;

            var order = loadOrder();
            var slots = Math.max(0, 12 - order.length);
            if (!slots) return;

            // 加载现有图片名称，用于跨批次去重
            var reads = order.map(function (id) { return idbGet(imgKey(id)); });
            return Promise.all(reads).then(function (existingImages) {
                var known = {};
                existingImages.forEach(function (img) { if (img && img.name) known[img.name] = true; });

                // 同批次内去重 + 去掉已在库中的
                var seen = {};
                var deduped = files.filter(function (f) {
                    if (seen[f.name] || known[f.name]) return false;
                    seen[f.name] = true;
                    return true;
                });

                // 截断超出 12 张的部分
                deduped = deduped.slice(0, slots);

                if (!deduped.length) {
                    log('Local', 'all ' + files.length + ' file(s) were duplicates, nothing to add');
                    if (_keepGalleryOpen) refreshLocalGallery(); else closeSettings();
                    return;
                }

                var saved = 0;
                var chain = Promise.resolve();
                deduped.forEach(function (file) {
                    chain = chain.then(function () {
                        var show = saved === 0;
                        return saveLocalImage(file, show).then(function (ok) { if (ok) saved++; });
                    });
                });
                return chain.then(function () {
                    log('Local', 'saved ' + saved + ' of ' + files.length + ' selected (' + (files.length - deduped.length) + ' duplicates skipped)');
                    if (_keepGalleryOpen) refreshLocalGallery(); else closeSettings();
                });
            });
        });

        resetBtn.addEventListener('click', function (e) { e.stopPropagation(); resetToBing(); });
        advancedToggleEl.addEventListener('click', function (e) { e.stopPropagation(); advancedSectionEl.classList.toggle('show'); });
        searchModeSelect.addEventListener('change', function () { applySearchMode(searchModeSelect.value); saveSettings(); });
        opacityRange.addEventListener('input', function () { applyOpacity(opacityRange.value); saveSettings(); });
        opacityNumInput.addEventListener('change', function () {
            var val = parseFloat(opacityNumInput.value);
            if (isNaN(val)) val = DEFAULT_OPACITY;
            val = Math.min(1, Math.max(0, val));
            applyOpacity(val);
            saveSettings();
        });
        engineSelect.addEventListener('change', function () { applyEngine(engineSelect.value); });
        resetAdvancedBtn.addEventListener('click', function () {
            applySearchMode(DEFAULT_SEARCH_MODE);
            searchModeSelect.value = DEFAULT_SEARCH_MODE;
            applyOpacity(DEFAULT_OPACITY);
            if (!IS_EXTENSION) applyEngine(DEFAULT_ENGINE);
            else saveSettings(); // 扩展模式下只需保存 searchMode 和 opacity
        });

        /**
         * WHY 点击搜索引擎图标会轮换引擎：
         *   Web 模式下的趣味功能。用户无需打开设置面板即可切换。
         *   扩展模式下此行为被禁用（图标不可点击），改用 chrome.search.query。
         */
        engineIcon.addEventListener('click', function (e) { e.stopPropagation(); nextEngine(); });
    }

    /* ================================================================
       18. 存储迁移

       WHY 链式迁移：
         每次改键名只需在 MIGRATIONS 加一个版本号对应的函数即可。
         新用户（stored===0）直接写版本号，不走迁移。
         老用户从旧版本号依次执行到 LS_VERSION。
       ================================================================ */

    var MIGRATIONS = {
        1: migrate_1_to_2
    };

    /**
     * v1→v2 迁移：统一 ptab_ 前缀 + 数组存储拆为单条 IDB key。
     *
     * WHY 两阶段事务：
     *   事务 1 只做非破坏性操作（put 新 key），不删旧 key。
     *   事务 2 在 localStorage 已落地后才删除旧 IDB key。
     *   任何一步崩溃都能安全重试——重命名是幂等的，旧 key 存在才删。
     */
    function migrate_1_to_2() {
        // WHY: v1 旧键名在迁移前缓存，重命名后仍可用
        var oldThumbs = [];
        try { oldThumbs = JSON.parse(localStorage.getItem('local_thumbs') || '[]'); } catch (e) { }

        // localStorage 键名迁移（目标键名硬编码——迁移是固定时刻的快照，不随常量变化）
        // WHY: 重命名是幂等的（旧键已删则跳过），放在最前面，无论后面几步失败多少次都能安全重试
        var lsRenames = [
            ['bing_thumb', 'ptab_bing_thumb'],
            ['ptab_wallpaper_source', 'ptab_mode'],
            ['ptab_search_visibility', 'ptab_search_mode']
        ];
        lsRenames.forEach(function (pair) {
            var val = localStorage.getItem(pair[0]);
            if (val !== null) {
                localStorage.setItem(pair[1], val);
                localStorage.removeItem(pair[0]);
            }
        });

        // 事务 1：非破坏性操作——put 新 key，不删旧 key
        // WHY: 此时不删 local_images。若后续 LS 写入失败，重试时 local_images 还在，能重建 order。
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB_STORE_NAME, 'readwrite');
                var store = tx.objectStore(DB_STORE_NAME);
                var result = { order: [] };

                var bingReq = store.get('bing');
                bingReq.onsuccess = function () {
                    if (bingReq.result !== undefined) {
                        store.put(bingReq.result, 'ptab_bing_blob');
                        store.delete('bing');
                    }
                };

                var liReq = store.get('local_images');
                liReq.onsuccess = function () {
                    var images = liReq.result;
                    if (images && images.length) {
                        images.forEach(function (img) {
                            var id = img.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
                            result.order.push(id);
                            store.put(
                                { blob: img.blob, mime: img.mime, name: img.name },
                                'ptab_img_' + id
                            );
                        });
                        // 不在这里 delete local_images
                    }
                };

                tx.oncomplete = function () { resolve(result); };
                tx.onerror = function (e) { reject(e.target.error); };
            });
        }).then(function (result) {
            // 先写 LS，确保 order/thumbs 落地后再清理旧数据
            if (result.order.length) {
                localStorage.setItem('ptab_img_order', JSON.stringify(result.order));
                var thumbs = {};
                for (var i = 0; i < oldThumbs.length && i < result.order.length; i++) {
                    thumbs[result.order[i]] = oldThumbs[i];
                }
                localStorage.setItem('ptab_img_thumbs', JSON.stringify(thumbs));
            }

            // 事务 2：LS 已落地，现在安全删除旧 IDB key
            return openDB().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var tx = db.transaction(DB_STORE_NAME, 'readwrite');
                    var store = tx.objectStore(DB_STORE_NAME);
                    var liReq = store.get('local_images');
                    liReq.onsuccess = function () {
                        if (liReq.result !== undefined) store.delete('local_images');
                    };
                    tx.oncomplete = resolve;
                    tx.onerror = function (e) { reject(e.target.error); };
                });
            }).then(function () {
                localStorage.removeItem('local_thumbs');
            });
        });
    }

    /**
     * 执行 localStorage/IDB 存储迁移。
     *
     * WHY 链式迁移：
     *   每次改键名只需在 MIGRATIONS 加一个版本号对应的函数即可。
     *   新用户（stored===0）直接写版本号，不走迁移，零开销。
     *   老用户从旧版本号依次执行到 LS_VERSION，确保每一步都可安全重试。
     */
    function migrateStorage() {
        var stored = parseInt(localStorage.getItem(LS_KEY_VERSION)) || 0;
        if (stored >= LS_VERSION) return Promise.resolve();

        // 新用户：直接写版本号，不跑迁移
        if (stored === 0) {
            localStorage.setItem(LS_KEY_VERSION, LS_VERSION);
            return Promise.resolve();
        }

        log('Migrate', 'v' + stored + ' → v' + LS_VERSION + ' ...');
        var chain = Promise.resolve();
        for (var v = stored; v < LS_VERSION; v++) {
            if (!MIGRATIONS[v]) continue;
            (function (ver) {
                chain = chain.then(function () { return MIGRATIONS[ver](); });
            })(v);
        }
        return chain.then(function () {
            localStorage.setItem(LS_KEY_VERSION, LS_VERSION);
            log('Migrate', 'done, now at v' + LS_VERSION);
        }).catch(function (e) {
            warn('Migrate', 'failed: ' + e.message);
            throw e;
        });
    }

    /* ================================================================
       19. 启动引导
       ================================================================ */

    /**
     * 启动引导。
     *
     * WHY 先迁移再加载壁纸：
     *   迁移可能改变 localStorage 键名（如 bing_thumb → ptab_bing_thumb），
     *   必须在 loadWallpaper 读取之前完成，否则读到空值导致白屏。
     *   扩展模式检测放在最后，确保所有基础功能已就绪再覆盖搜索行为。
     */
    function init() {
        migrateStorage().catch(function (e) {
            warn('Init', 'migration failed, continuing: ' + e.message);
        }).then(function () {
            currentLang = localStorage.getItem(LS_KEY_LANG) || detectLang();
            if (!I18N[currentLang]) currentLang = 'en';
            log('PlainTab', 'PlainTab started  ·  ' + (IS_EXTENSION ? 'extension' : 'web') + '  ·  ' + currentLang);
            loadSettings();
            updateLangUI();
            loadWallpaper();
            if (IS_EXTENSION) setupExtensionMode();
            bindEvents();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
