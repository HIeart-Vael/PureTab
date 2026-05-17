/**
 * WallpaperData —— 壁纸存储层
 * 所有 LS + IDB 读写的唯一入口。挂载到 window.WallpaperData。
 */
(function () {
    'use strict';

    // ================================================================
    // 常量
    // ================================================================

    var LS_VERSION = 3;
    var BASELINE_APP_VERSION = '3.2.0';
    var DB_VERSION = 1;

    var KEYS = {
        SCHEMA_VERSION: 'ptab_schema_version',
        LOCALE: 'ptab_locale',
        WALLPAPER: 'ptab_wallpaper',
        WALLPAPER_THUMBS: 'ptab_wallpaper_thumbs',
        WALLPAPER_BLUR_THUMBS: 'ptab_wallpaper_blur_thumbs',
        WALLPAPER_PREVIEW: 'ptab_wallpaper_preview',
        UI: 'ptab_ui',
        SHORTCUTS: 'ptab_shortcuts',
        SHORTCUT_ICONS: 'ptab_shortcut_icons'
    };

    var DB = {
        NAME: 'PlainTab',
        STORE: 'wallpaper',
        BING_BLOB: 'ptab_wallpaper_blob_bing',
        API_BLOB: 'ptab_wallpaper_blob_api',
        UPLOAD_PREFIX: 'ptab_wallpaper_blob_upload_',
        RSS_PREFIX: 'ptab_wallpaper_blob_rss_',
        FOLDER_HANDLE: 'ptab_wallpaper_folder_handle',
        FOLDER_FILES: 'ptab_wallpaper_folder_files'
    };

    // ================================================================
    // IndexedDB 存储层
    // ================================================================

    var _dbConnection;

    function openDB() {
        if (_dbConnection) return Promise.resolve(_dbConnection);
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB.NAME, DB_VERSION);
            req.onupgradeneeded = function (e) {
                if (!e.target.result.objectStoreNames.contains(DB.STORE)) e.target.result.createObjectStore(DB.STORE);
            };
            req.onsuccess = function (e) {
                _dbConnection = e.target.result;
                _dbConnection.onclose = function () { _dbConnection = null; };
                resolve(_dbConnection);
            };
            req.onerror = function (e) { reject(e.target.error); };
        });
    }

    function idbPut(key, value) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB.STORE, 'readwrite');
                tx.objectStore(DB.STORE).put(value, key);
                tx.oncomplete = resolve;
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function idbGet(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB.STORE, 'readonly');
                var req = tx.objectStore(DB.STORE).get(key);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function idbDelete(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB.STORE, 'readwrite');
                tx.objectStore(DB.STORE).delete(key);
                tx.oncomplete = resolve;
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function idbDeleteMany(keys) {
        if (!keys.length) return Promise.resolve();
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB.STORE, 'readwrite');
                var store = tx.objectStore(DB.STORE);
                keys.forEach(function (key) { store.delete(key); });
                tx.oncomplete = resolve;
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function idbKeys() {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB.STORE, 'readonly');
                var store = tx.objectStore(DB.STORE);
                if (store.getAllKeys) {
                    var req = store.getAllKeys();
                    req.onsuccess = function () { resolve(req.result || []); };
                    req.onerror = function (e) { reject(e.target.error); };
                    return;
                }
                var keys = [];
                var cursorReq = store.openCursor();
                cursorReq.onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (!cursor) {
                        resolve(keys);
                        return;
                    }
                    keys.push(cursor.key);
                    cursor.continue();
                };
                cursorReq.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function idbDeleteMatching(predicate) {
        return idbKeys().then(function (keys) {
            return idbDeleteMany(keys.filter(predicate));
        });
    }

    // ================================================================
    // v3.2 localStorage models
    // ================================================================

    var DEFAULT_WALLPAPER = {
        activeSource: 'bing',
        providers: {
            bing: {
                config: { mkt: 'auto' },
                state: { src: '', date: '', provider: '' }
            },
            upload: {
                config: { rotation: 'sequential' },
                state: {}
            },
            folder: {
                config: { pathLabel: '', strategy: 'random' },
                state: {}
            },
            rss: {
                config: {
                    sources: [
                        { id: 'nasa-apod', name: 'NASA APOD', url: 'https://apod.nasa.gov/apod.rss', builtIn: true },
                        { id: 'bing-rsshub', name: 'Bing', url: 'https://rsshub.app/bing', builtIn: true }
                    ],
                    activeSourceId: 'nasa-apod',
                    refreshIntervalMs: 86400000,
                    showSummary: true,
                    showLink: true,
                    summaryPosition: 'bottom',
                    summaryMode: 'expanded'
                },
                state: { lastCheckedAt: 0, lastSuccessAt: 0, lastImageUrl: '', lastError: '', lastTestAt: 0, lastTestMessage: '' }
            },
            api: {
                config: {
                    apiType: 'image',
                    activeImageSourceId: '',
                    activeJsonSourceId: '',
                    refreshIntervalMs: 86400000,
                    imageSources: [],
                    jsonSources: []
                },
                state: { lastCheckedAt: 0, lastSuccessAt: 0, lastError: '', lastSourceId: '', lastImageUrl: '' }
            }
        },
        cache: {
            order: ['bing'],
            index: 0,
            meta: { bing: {} }
        }
    };

    var DEFAULT_UI = {
        search: {
            visibility: 'always',
            engine: 'google',
            position: 'center',
            align: 'center',
            iconPosition: 'right',
            radius: 'capsule',
            width: 560,
            backgroundOpacity: 0.1,
            blur: 24
        },
        wallpaper: {
            overlayOpacity: 0,
            themeEnabled: false,
            fit: 'cover',
            position: 'center',
            blur: 0
        },
        appearance: {
            radius: 'soft'
        },
        icon: {
            opacity: 0.45
        },
        panel: {
            opacity: 0.88
        }
    };

    var DEFAULT_SHORTCUTS = {
        items: [],
        recents: [],
        hidden: [],
        settings: {
            primaryHotkey: 'ctrl+k',
            hiddenHotkey: 'ctrl+shift+k',
            recommendEnabled: true,
            viewMode: 'list'
        }
    };

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function mergeDefaults(value, defaults) {
        var result = clone(defaults);
        if (!value || typeof value !== 'object') return result;
        Object.keys(value).forEach(function (key) {
            if (value[key] && typeof value[key] === 'object' && !Array.isArray(value[key]) &&
                result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
                result[key] = mergeDefaults(value[key], result[key]);
            } else {
                result[key] = value[key];
            }
        });
        return result;
    }

    function readJSON(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : clone(fallback);
        } catch (e) {
            return clone(fallback);
        }
    }

    function writeJSON(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch (e) { return false; }
    }

    var _thumbsCache = null;
    var _blurThumbsCache = null;
    var _wallpaperCache = null;
    var _uiCache = null;
    var _shortcutsCache = null;

    function clearCaches() {
        _thumbsCache = null;
        _blurThumbsCache = null;
        _wallpaperCache = null;
        _uiCache = null;
        _shortcutsCache = null;
    }

    function normalizeSource(source) {
        return source === 'local' ? 'upload' : (source || 'bing');
    }

    function compatMode(source) {
        return normalizeSource(source) === 'upload' ? 'local' : normalizeSource(source);
    }

    function uploadId(rawId) {
        if (!rawId) return rawId;
        return rawId.indexOf('upload_') === 0 ? rawId : 'upload_' + rawId;
    }

    function legacyUploadId(id) {
        return id && id.indexOf('upload_') === 0 ? id.slice(7) : id;
    }

    function imgKey(id) {
        if (id === 'bing') return DB.BING_BLOB;
        if (id === 'api') return DB.API_BLOB;
        if (id && id.indexOf('rss_') === 0) return DB.RSS_PREFIX + id.slice(4);
        if (id && id.indexOf('upload_') === 0) return DB.UPLOAD_PREFIX + id.slice(7);
        return DB.UPLOAD_PREFIX + id;
    }

    function imageBlob(record) {
        return record && record.blob ? record.blob : record;
    }

    function imageRecord(value, fallbackName) {
        if (!value) return value;
        if (value.blob) return value;
        return { blob: value, mime: value.type || '', name: fallbackName || '' };
    }

    function defaultRssConfig() {
        return clone(DEFAULT_WALLPAPER.providers.rss.config);
    }

    function normalizeRssSource(source, index) {
        source = source || {};
        var id = String(source.id || ('rss-source-' + index)).trim();
        return {
            id: id,
            name: String(source.name || source.url || 'RSS').trim().slice(0, 80),
            url: String(source.url || '').trim(),
            builtIn: source.builtIn === true,
            test: sourceTest(
                source.test && source.test.status,
                source.test && source.test.fieldHash,
                source.test && source.test.testedAt,
                source.test && source.test.imageUrl,
                source.test && source.test.error
            )
        };
    }

    function sourceTest(status, fieldHash, testedAt, imageUrl, error) {
        return {
            status: status === 'passed' || status === 'failed' ? status : 'untested',
            fieldHash: String(fieldHash || ''),
            testedAt: parseInt(testedAt, 10) || 0,
            imageUrl: String(imageUrl || ''),
            error: String(error || '')
        };
    }

    function stableHash(value) {
        var str = String(value || '');
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }

    function rssFieldHash(source) {
        return stableHash(String(source && source.url || '').trim());
    }

    function apiFieldHash(source, apiType) {
        var url = String(source && source.url || '').trim();
        var path = apiType === 'json' ? String(source && source.jsonPath || '').trim() : '';
        return stableHash(apiType + '|' + url + '|' + path);
    }

    function isTestPassed(source, expectedHash) {
        return !!(source && source.test && source.test.status === 'passed' && source.test.fieldHash === expectedHash);
    }

    function normalizeRssConfig(config) {
        var defaults = defaultRssConfig();
        var merged = mergeDefaults(config || {}, defaults);
        var seen = {};
        merged.sources = (merged.sources || []).map(normalizeRssSource).filter(function (source) {
            if (!source.id || !source.url || seen[source.id]) return false;
            seen[source.id] = true;
            return true;
        }).slice(0, 5);
        if (!merged.sources.length) merged.sources = defaults.sources.map(normalizeRssSource);
        if (!merged.sources.some(function (source) { return source.id === merged.activeSourceId; })) {
            merged.activeSourceId = merged.sources[0].id;
        }
        var allowedIntervals = [0, 86400000, 259200000, 604800000];
        if (allowedIntervals.indexOf(merged.refreshIntervalMs) === -1) merged.refreshIntervalMs = defaults.refreshIntervalMs;
        if (merged.summaryPosition !== 'top' && merged.summaryPosition !== 'bottom') merged.summaryPosition = 'bottom';
        if (merged.summaryMode !== 'expanded' && merged.summaryMode !== 'icon') merged.summaryMode = 'expanded';
        merged.showSummary = merged.showSummary !== false;
        merged.showLink = merged.showLink !== false;
        return merged;
    }

    function normalizeApiSource(source, index, apiType) {
        source = source || {};
        var id = String(source.id || ('api-' + apiType + '-' + index)).trim();
        var normalized = {
            id: id,
            name: String(source.name || source.url || (apiType === 'json' ? 'JSON API' : 'Image API')).trim().slice(0, 80),
            url: String(source.url || '').trim(),
            test: sourceTest(
                source.test && source.test.status,
                source.test && source.test.fieldHash,
                source.test && source.test.testedAt,
                source.test && source.test.imageUrl,
                source.test && source.test.error
            )
        };
        if (apiType === 'json') normalized.jsonPath = String(source.jsonPath || '').trim();
        return normalized;
    }

    function normalizeApiConfig(config) {
        var defaults = clone(DEFAULT_WALLPAPER.providers.api.config);
        var merged = mergeDefaults(config || {}, defaults);
        merged.apiType = merged.apiType === 'json' ? 'json' : 'image';
        var legacyUrl = String(merged.url || '').trim();
        var legacyJsonPath = String(merged.jsonPath || '').trim();
        merged.imageSources = (merged.imageSources || []).map(function (source, index) {
            return normalizeApiSource(source, index, 'image');
        }).filter(function (source, index, list) {
            return source.id && source.url && list.findIndex(function (item) { return item.id === source.id; }) === index;
        }).slice(0, 5);
        merged.jsonSources = (merged.jsonSources || []).map(function (source, index) {
            return normalizeApiSource(source, index, 'json');
        }).filter(function (source, index, list) {
            return source.id && source.url && list.findIndex(function (item) { return item.id === source.id; }) === index;
        }).slice(0, 5);
        if (legacyUrl && !merged.imageSources.length && !merged.jsonSources.length) {
            if (legacyJsonPath) {
                merged.jsonSources = [normalizeApiSource({
                    id: 'api-json-legacy',
                    name: legacyUrl,
                    url: legacyUrl,
                    jsonPath: legacyJsonPath
                }, 0, 'json')];
                merged.apiType = 'json';
                merged.activeJsonSourceId = merged.jsonSources[0].id;
            } else {
                merged.imageSources = [normalizeApiSource({
                    id: 'api-image-legacy',
                    name: legacyUrl,
                    url: legacyUrl
                }, 0, 'image')];
                merged.apiType = 'image';
                merged.activeImageSourceId = merged.imageSources[0].id;
            }
        }
        var allowedIntervals = [-1, 0, 86400000, 259200000, 604800000];
        if (allowedIntervals.indexOf(parseInt(merged.refreshIntervalMs, 10)) === -1) merged.refreshIntervalMs = defaults.refreshIntervalMs;
        else merged.refreshIntervalMs = parseInt(merged.refreshIntervalMs, 10);
        if (!merged.imageSources.some(function (source) { return source.id === merged.activeImageSourceId; })) {
            merged.activeImageSourceId = merged.imageSources[0] ? merged.imageSources[0].id : '';
        }
        if (!merged.jsonSources.some(function (source) { return source.id === merged.activeJsonSourceId; })) {
            merged.activeJsonSourceId = merged.jsonSources[0] ? merged.jsonSources[0].id : '';
        }
        delete merged.url;
        delete merged.jsonPath;
        return merged;
    }

    function loadWallpaper() {
        if (_wallpaperCache !== null) return _wallpaperCache;
        _wallpaperCache = mergeDefaults(readJSON(KEYS.WALLPAPER, DEFAULT_WALLPAPER), DEFAULT_WALLPAPER);
        _wallpaperCache.activeSource = normalizeSource(_wallpaperCache.activeSource);
        _wallpaperCache.providers.rss.config = normalizeRssConfig(_wallpaperCache.providers.rss.config);
        _wallpaperCache.providers.api.config = normalizeApiConfig(_wallpaperCache.providers.api.config);
        return _wallpaperCache;
    }

    function saveWallpaper(model) {
        _wallpaperCache = mergeDefaults(model, DEFAULT_WALLPAPER);
        _wallpaperCache.activeSource = normalizeSource(_wallpaperCache.activeSource);
        _wallpaperCache.providers.rss.config = normalizeRssConfig(_wallpaperCache.providers.rss.config);
        _wallpaperCache.providers.api.config = normalizeApiConfig(_wallpaperCache.providers.api.config);
        return writeJSON(KEYS.WALLPAPER, _wallpaperCache);
    }

    function updateWallpaper(mutator) {
        var model = loadWallpaper();
        mutator(model);
        return saveWallpaper(model);
    }

    function loadRssConfig() {
        var model = loadWallpaper();
        return model.providers.rss.config;
    }

    function saveRssConfig(config) {
        updateWallpaper(function (model) {
            model.providers.rss.config = normalizeRssConfig(config);
        });
    }

    function loadApiConfig() {
        return loadWallpaper().providers.api.config;
    }

    function saveApiConfig(config) {
        updateWallpaper(function (model) {
            model.providers.api.config = normalizeApiConfig(config);
        });
    }

    function activeApiSource(config) {
        config = normalizeApiConfig(config || loadApiConfig());
        var list = config.apiType === 'json' ? config.jsonSources : config.imageSources;
        var activeId = config.apiType === 'json' ? config.activeJsonSourceId : config.activeImageSourceId;
        return list.filter(function (source) { return source.id === activeId; })[0] || list[0] || null;
    }

    function loadUI() {
        if (_uiCache !== null) return _uiCache;
        _uiCache = mergeDefaults(readJSON(KEYS.UI, DEFAULT_UI), DEFAULT_UI);
        return _uiCache;
    }

    function saveUI(ui) {
        _uiCache = mergeDefaults(ui, DEFAULT_UI);
        return writeJSON(KEYS.UI, _uiCache);
    }

    function loadShortcutsModel() {
        if (_shortcutsCache !== null) return _shortcutsCache;
        _shortcutsCache = mergeDefaults(readJSON(KEYS.SHORTCUTS, DEFAULT_SHORTCUTS), DEFAULT_SHORTCUTS);
        return _shortcutsCache;
    }

    function saveShortcutsModel(model) {
        _shortcutsCache = mergeDefaults(model, DEFAULT_SHORTCUTS);
        return writeJSON(KEYS.SHORTCUTS, _shortcutsCache);
    }

    function loadOrder() {
        var order = loadWallpaper().cache.order || [];
        return order.filter(function (id) {
            return id !== 'bing' && id !== 'api' && !isRssId(id) && String(id || '').indexOf('folder:') !== 0;
        });
    }
    function saveOrder(order) {
        updateWallpaper(function (model) {
            model.activeSource = order && order.length ? 'upload' : 'bing';
            model.cache.order = (order || []).map(uploadId);
            if (!model.cache.order.length) model.cache.order = ['bing'];
            model.cache.index = Math.min(model.cache.index || 0, Math.max(model.cache.order.length - 1, 0));
        });
    }

    function loadThumbs() {
        if (_thumbsCache !== null) return _thumbsCache;
        _thumbsCache = readJSON(KEYS.WALLPAPER_THUMBS, {});
        return _thumbsCache;
    }
    function saveThumbs(thumbs) {
        _thumbsCache = thumbs;
        writeJSON(KEYS.WALLPAPER_THUMBS, thumbs);
    }

    function normalizeWallpaperBlur(value) {
        var n = parseInt(value, 10);
        if (isNaN(n) || n <= 0) return 0;
        if (n < 5) return 5;
        return Math.max(5, Math.min(15, n));
    }

    function loadBlurThumbs() {
        if (_blurThumbsCache !== null) return _blurThumbsCache;
        _blurThumbsCache = readJSON(KEYS.WALLPAPER_BLUR_THUMBS, {});
        return _blurThumbsCache;
    }

    function saveBlurThumbs(thumbs) {
        _blurThumbsCache = thumbs || {};
        writeJSON(KEYS.WALLPAPER_BLUR_THUMBS, _blurThumbsCache);
    }

    function blurThumbFor(id, blur) {
        var entry = loadBlurThumbs()[id];
        var normalized = normalizeWallpaperBlur(blur);
        if (!entry || !normalized) return null;
        if (typeof entry === 'string') return entry;
        return entry.blur === normalized && entry.thumb ? entry.thumb : null;
    }

    function saveBlurThumb(id, blur, thumb) {
        if (!id || !thumb) return;
        var normalized = normalizeWallpaperBlur(blur);
        if (!normalized) return;
        var thumbs = loadBlurThumbs();
        thumbs[id] = { blur: normalized, thumb: thumb };
        saveBlurThumbs(thumbs);
    }

    function deleteBlurThumb(id) {
        var thumbs = loadBlurThumbs();
        if (!thumbs[id]) return;
        delete thumbs[id];
        saveBlurThumbs(thumbs);
    }

    function loadMeta() {
        return loadWallpaper().cache.meta || {};
    }
    function saveMeta(meta) {
        updateWallpaper(function (model) { model.cache.meta = meta || {}; });
    }

    function isRssId(id) {
        return !!(id && id.indexOf('rss_') === 0);
    }

    function rssBlobKey(id) {
        return DB.RSS_PREFIX + String(id || '').replace(/^rss_/, '');
    }

    function activeRssOrder(sourceId) {
        var config = loadRssConfig();
        var activeSourceId = sourceId || config.activeSourceId;
        var meta = loadMeta();
        return (loadWallpaper().cache.order || []).filter(isRssId).filter(function (id) {
            return !activeSourceId || !meta[id] || meta[id].sourceId === activeSourceId;
        });
    }

    function resetWallpaperDefaults() {
        var previous = loadWallpaper();
        var previousThumbs = loadThumbs();
        var previousBlurThumbs = loadBlurThumbs();
        var previousMeta = previous.cache && previous.cache.meta ? previous.cache.meta : {};

        var model = clone(DEFAULT_WALLPAPER);
        model.activeSource = 'bing';
        model.providers.bing.state = mergeDefaults(previous.providers && previous.providers.bing ? previous.providers.bing.state : {}, DEFAULT_WALLPAPER.providers.bing.state);
        model.cache.meta = { bing: previousMeta.bing || {} };
        saveWallpaper(model);

        var nextThumbs = {};
        if (previousThumbs.bing) nextThumbs.bing = previousThumbs.bing;
        saveThumbs(nextThumbs);

        var nextBlurThumbs = {};
        if (previousBlurThumbs.bing) nextBlurThumbs.bing = previousBlurThumbs.bing;
        saveBlurThumbs(nextBlurThumbs);

        var blur = loadUI().wallpaper ? normalizeWallpaperBlur(loadUI().wallpaper.blur) : 0;
        var preview = null;
        var blurEntry = nextBlurThumbs.bing;
        if (blur >= 5 && blurEntry) preview = typeof blurEntry === 'string' ? blurEntry : blurEntry.thumb;
        if (!preview) preview = nextThumbs.bing || null;
        savePreview(preview);

        return idbDeleteMatching(function (key) {
            return key === DB.API_BLOB ||
                key === DB.FOLDER_HANDLE ||
                key === DB.FOLDER_FILES ||
                String(key).indexOf(DB.UPLOAD_PREFIX) === 0 ||
                String(key).indexOf(DB.RSS_PREFIX) === 0;
        }).then(function () {
            clearCaches();
            return model;
        });
    }

    // ================================================================
    // Bing 元数据
    // ================================================================

    function loadBingMeta() {
        return loadWallpaper().providers.bing.state || {};
    }
    function saveBingMeta(meta) {
        updateWallpaper(function (model) {
            model.providers.bing.state = mergeDefaults(meta || {}, DEFAULT_WALLPAPER.providers.bing.state);
        });
    }

    function getActiveSource() {
        return loadWallpaper().activeSource || 'bing';
    }

    function setActiveSource(source) {
        updateWallpaper(function (model) {
            model.activeSource = normalizeSource(source);
            if (model.activeSource === 'bing') {
                model.cache.order = ['bing'];
                model.cache.index = 0;
                if (!model.cache.meta) model.cache.meta = {};
                if (!model.cache.meta.bing) model.cache.meta.bing = {};
            }
        });
    }

    function getActiveIndex() {
        return parseInt(loadWallpaper().cache.index, 10) || 0;
    }

    function saveActiveIndex(index) {
        updateWallpaper(function (model) { model.cache.index = parseInt(index, 10) || 0; });
    }

    function loadPreview() {
        return localStorage.getItem(KEYS.WALLPAPER_PREVIEW);
    }

    function savePreview(thumb) {
        try {
            if (thumb) localStorage.setItem(KEYS.WALLPAPER_PREVIEW, thumb);
            else localStorage.removeItem(KEYS.WALLPAPER_PREVIEW);
        } catch (e) { }
    }

    function loadLocale() {
        return localStorage.getItem(KEYS.LOCALE);
    }

    function saveLocale(locale) {
        try { localStorage.setItem(KEYS.LOCALE, locale); return true; } catch (e) { return false; }
    }

    // ================================================================
    // 存储基线
    // ================================================================

    function ensureBaselineSchema() {
        var stored = parseInt(localStorage.getItem(KEYS.SCHEMA_VERSION), 10) || 0;
        if (stored >= LS_VERSION) return Promise.resolve();
        try { localStorage.setItem(KEYS.SCHEMA_VERSION, LS_VERSION); } catch (e) { }
        return Promise.resolve();
    }

    // ================================================================
    // 公开 API
    // ================================================================

    window.WallpaperData = {
        KEYS: KEYS,
        DB: DB,
        LS_VERSION: LS_VERSION,
        BASELINE_APP_VERSION: BASELINE_APP_VERSION,

        // IDB 操作
        openDB: openDB,
        idbPut: idbPut,
        idbGet: idbGet,
        idbDelete: idbDelete,
        idbDeleteMany: idbDeleteMany,
        idbKeys: idbKeys,
        idbDeleteMatching: idbDeleteMatching,

        // 本地图片
        imgKey: imgKey,
        imageBlob: imageBlob,
        imageRecord: imageRecord,
        loadOrder: loadOrder,
        saveOrder: saveOrder,
        loadThumbs: loadThumbs,
        saveThumbs: saveThumbs,
        loadBlurThumbs: loadBlurThumbs,
        saveBlurThumbs: saveBlurThumbs,
        blurThumbFor: blurThumbFor,
        saveBlurThumb: saveBlurThumb,
        deleteBlurThumb: deleteBlurThumb,
        normalizeWallpaperBlur: normalizeWallpaperBlur,
        loadMeta: loadMeta,
        saveMeta: saveMeta,
        legacyUploadId: legacyUploadId,
        getActiveSource: getActiveSource,
        setActiveSource: setActiveSource,
        compatMode: compatMode,
        getActiveIndex: getActiveIndex,
        saveActiveIndex: saveActiveIndex,
        loadPreview: loadPreview,
        savePreview: savePreview,
        loadWallpaper: loadWallpaper,
        saveWallpaper: saveWallpaper,
        updateWallpaper: updateWallpaper,
        defaultRssConfig: defaultRssConfig,
        rssFieldHash: rssFieldHash,
        apiFieldHash: apiFieldHash,
        isTestPassed: isTestPassed,
        normalizeSource: normalizeSource,
        loadRssConfig: loadRssConfig,
        saveRssConfig: saveRssConfig,
        loadApiConfig: loadApiConfig,
        saveApiConfig: saveApiConfig,
        activeApiSource: activeApiSource,
        normalizeApiConfig: normalizeApiConfig,
        isRssId: isRssId,
        rssBlobKey: rssBlobKey,
        activeRssOrder: activeRssOrder,
        resetWallpaperDefaults: resetWallpaperDefaults,
        loadUI: loadUI,
        saveUI: saveUI,
        loadShortcutsModel: loadShortcutsModel,
        saveShortcutsModel: saveShortcutsModel,
        loadLocale: loadLocale,
        saveLocale: saveLocale,

        // Bing 元数据
        loadBingMeta: loadBingMeta,
        saveBingMeta: saveBingMeta,

        // 迁移
        migrate: ensureBaselineSchema,

        // 缓存清空（源切换时调用）
        clearCaches: clearCaches
    };

})();
