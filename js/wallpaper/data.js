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
    var DB_VERSION = 1;

    var KEYS = {
        SCHEMA_VERSION: 'ptab_schema_version',
        LOCALE: 'ptab_locale',
        WALLPAPER: 'ptab_wallpaper',
        WALLPAPER_THUMBS: 'ptab_wallpaper_thumbs',
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
                config: { url: '', strategy: 'latest', refreshIntervalMs: 300000 },
                state: { lastCheckedAt: 0, lastSuccessAt: 0, lastImageUrl: '', lastError: '' }
            },
            api: {
                config: { url: '', jsonPath: '', refreshIntervalMs: 300000 },
                state: { lastCheckedAt: 0, lastSuccessAt: 0, lastImageUrl: '', lastError: '' }
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
    var _wallpaperCache = null;
    var _uiCache = null;
    var _shortcutsCache = null;

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

    function loadWallpaper() {
        if (_wallpaperCache !== null) return _wallpaperCache;
        _wallpaperCache = mergeDefaults(readJSON(KEYS.WALLPAPER, DEFAULT_WALLPAPER), DEFAULT_WALLPAPER);
        _wallpaperCache.activeSource = normalizeSource(_wallpaperCache.activeSource);
        return _wallpaperCache;
    }

    function saveWallpaper(model) {
        _wallpaperCache = mergeDefaults(model, DEFAULT_WALLPAPER);
        return writeJSON(KEYS.WALLPAPER, _wallpaperCache);
    }

    function updateWallpaper(mutator) {
        var model = loadWallpaper();
        mutator(model);
        return saveWallpaper(model);
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
        return order.filter(function (id) { return id !== 'bing' && id !== 'api'; });
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

    function loadMeta() {
        return loadWallpaper().cache.meta || {};
    }
    function saveMeta(meta) {
        updateWallpaper(function (model) { model.cache.meta = meta || {}; });
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
    // 存储迁移
    // ================================================================

    var log = function (tag, msg) { console.log('[' + tag + '] ' + msg); };
    var warn = function (tag, msg) { console.warn('[' + tag + '] ' + msg); };

    var LEGACY_KEYS = {
        V2: {
            VERSION: 'ptab_version',
            MODE: 'ptab_mode',
            BING_THUMB: 'ptab_bing_thumb',
            BING_META: 'ptab_bing_meta',
            IMG_ORDER: 'ptab_img_order',
            IMG_THUMBS: 'ptab_img_thumbs',
            IMG_META: 'ptab_img_meta',
            LOCAL_INDEX: 'ptab_local_index',
            PREVIEW_THUMB: 'ptab_preview_thumb',
            LANG: 'ptab_lang',
            SEARCH_MODE: 'ptab_search_mode',
            SEARCH_ENGINE: 'ptab_search_engine',
            SEARCH_POSITION: 'ptab_search_position',
            SEARCH_RADIUS: 'ptab_search_radius',
            ICON_OPACITY: 'ptab_icon_opacity',
            OVERLAY_OPACITY: 'ptab_overlay_opacity',
            PANEL_OPACITY: 'ptab_panel_opacity',
            WP_THEME_ENABLED: 'ptab_wp_theme_enabled',
            WP_THEME: 'ptab_wp_theme',
            SHORTCUT_RECENTS: 'ptab_shortcut_recents',
            SHORTCUT_HIDDEN: 'ptab_shortcut_hidden',
            SHORTCUT_HOTKEY: 'ptab_shortcut_hotkey',
            SHORTCUT_HIDDEN_HOTKEY: 'ptab_shortcut_hidden_hotkey',
            SHORTCUT_RECOMMEND: 'ptab_shortcut_recommend',
            SHORTCUT_VIEW: 'ptab_shortcut_view'
        },
        V1: {
            THUMB: '__pt3_thumb',
            SOURCE: 'pt3_source',
            LANG: 'pt3_lang',
            SEARCH_MODE: 'pt3_search_mode',
            OPACITY: 'pt3_opacity',
            ENGINE: 'pt3_engine',
            BING_URL: 'pt3_bing_url',
            BING_DATE: 'pt3_bing_date',
            LOCAL_THUMBS: 'local_thumbs',
            BING_THUMB: 'bing_thumb',
            WALLPAPER_SOURCE: 'ptab_wallpaper_source',
            SEARCH_VISIBILITY: 'ptab_search_visibility'
        }
    };

    var LEGACY_DB = {
        V2_BING_BLOB: 'ptab_bing_blob',
        V2_IMG_PREFIX: 'ptab_img_',
        V1_BING_BLOB: 'bing',
        V1_LOCAL_IMAGES: 'local_images'
    };

    var MIGRATIONS = {
        1: migrate_1_to_2,
        2: migrate_2_to_3
    };

    function legacyV2ImgKey(id) {
        return LEGACY_DB.V2_IMG_PREFIX + legacyUploadId(id);
    }

    function migrate_1_to_2() {
        var oldThumbs = [];
        try { oldThumbs = JSON.parse(localStorage.getItem(LEGACY_KEYS.V1.LOCAL_THUMBS) || '[]'); } catch (e) { }

        var lsRenames = [
            [LEGACY_KEYS.V1.BING_THUMB, LEGACY_KEYS.V2.BING_THUMB],
            [LEGACY_KEYS.V1.THUMB, LEGACY_KEYS.V2.BING_THUMB],
            [LEGACY_KEYS.V1.WALLPAPER_SOURCE, LEGACY_KEYS.V2.MODE],
            [LEGACY_KEYS.V1.SOURCE, LEGACY_KEYS.V2.MODE],
            [LEGACY_KEYS.V1.SEARCH_VISIBILITY, LEGACY_KEYS.V2.SEARCH_MODE],
            [LEGACY_KEYS.V1.SEARCH_MODE, LEGACY_KEYS.V2.SEARCH_MODE],
            [LEGACY_KEYS.V1.LANG, LEGACY_KEYS.V2.LANG],
            [LEGACY_KEYS.V1.OPACITY, LEGACY_KEYS.V2.ICON_OPACITY],
            [LEGACY_KEYS.V1.ENGINE, LEGACY_KEYS.V2.SEARCH_ENGINE]
        ];
        lsRenames.forEach(function (pair) {
            var val = localStorage.getItem(pair[0]);
            if (val !== null) {
                localStorage.setItem(pair[1], val);
                localStorage.removeItem(pair[0]);
            }
        });

        var pt3BingUrl = localStorage.getItem(LEGACY_KEYS.V1.BING_URL);
        var pt3BingDate = localStorage.getItem(LEGACY_KEYS.V1.BING_DATE);
        if (pt3BingUrl || pt3BingDate) {
            writeJSON(LEGACY_KEYS.V2.BING_META, {
                src: pt3BingUrl || '',
                date: pt3BingDate || '',
                provider: ''
            });
            localStorage.removeItem(LEGACY_KEYS.V1.BING_URL);
            localStorage.removeItem(LEGACY_KEYS.V1.BING_DATE);
        }

        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB.STORE, 'readwrite');
                var store = tx.objectStore(DB.STORE);
                var result = { order: [] };

                var bingReq = store.get(LEGACY_DB.V1_BING_BLOB);
                bingReq.onsuccess = function () {
                    if (bingReq.result !== undefined) {
                        store.put(normalizeImageRecord(bingReq.result, 'bing'), LEGACY_DB.V2_BING_BLOB);
                        store.delete(LEGACY_DB.V1_BING_BLOB);
                    }
                };

                var liReq = store.get(LEGACY_DB.V1_LOCAL_IMAGES);
                liReq.onsuccess = function () {
                    var images = liReq.result;
                    if (images && images.length) {
                        images.forEach(function (img) {
                            var id = img.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
                            result.order.push(id);
                            store.put(
                                { blob: img.blob, mime: img.mime, name: img.name },
                                LEGACY_DB.V2_IMG_PREFIX + id
                            );
                        });
                    }
                };

                tx.oncomplete = function () { resolve(result); };
                tx.onerror = function (e) { reject(e.target.error); };
            });
        }).then(function (result) {
            if (result.order.length) {
                localStorage.setItem(LEGACY_KEYS.V2.IMG_ORDER, JSON.stringify(result.order));
                var thumbs = {};
                for (var i = 0; i < oldThumbs.length && i < result.order.length; i++) {
                    thumbs[result.order[i]] = oldThumbs[i];
                }
                localStorage.setItem(LEGACY_KEYS.V2.IMG_THUMBS, JSON.stringify(thumbs));
            }

            return openDB().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var tx = db.transaction(DB.STORE, 'readwrite');
                    var store = tx.objectStore(DB.STORE);
                    var liReq = store.get(LEGACY_DB.V1_LOCAL_IMAGES);
                    liReq.onsuccess = function () {
                        if (liReq.result !== undefined) store.delete(LEGACY_DB.V1_LOCAL_IMAGES);
                    };
                    tx.oncomplete = resolve;
                    tx.onerror = function (e) { reject(e.target.error); };
                });
            }).then(function () {
                localStorage.removeItem(LEGACY_KEYS.V1.LOCAL_THUMBS);
                cleanupPt3Keys();
            });
        });
    }

    function migrate_2_to_3() {
        var oldMode = normalizeSource(localStorage.getItem(LEGACY_KEYS.V2.MODE) || 'bing');
        var oldOrder = readJSON(LEGACY_KEYS.V2.IMG_ORDER, []).map(uploadId);
        var oldThumbs = readJSON(LEGACY_KEYS.V2.IMG_THUMBS, {});
        var oldMeta = readJSON(LEGACY_KEYS.V2.IMG_META, {});
        var oldBingMeta = readJSON(LEGACY_KEYS.V2.BING_META, {});
        var oldIndex = parseInt(localStorage.getItem(LEGACY_KEYS.V2.LOCAL_INDEX), 10) || 0;
        var oldPreview = localStorage.getItem(LEGACY_KEYS.V2.PREVIEW_THUMB);
        var oldBingThumb = localStorage.getItem(LEGACY_KEYS.V2.BING_THUMB);

        var thumbs = {};
        oldOrder.forEach(function (newId) {
            var oldId = legacyUploadId(newId);
            if (oldThumbs[oldId]) thumbs[newId] = oldThumbs[oldId];
        });
        if (oldBingThumb) thumbs.bing = oldBingThumb;

        var meta = {};
        oldOrder.forEach(function (newId) {
            var oldId = legacyUploadId(newId);
            if (oldMeta[oldId]) meta[newId] = oldMeta[oldId];
        });
        meta.bing = meta.bing || {};

        var activeSource = oldMode === 'upload' && oldOrder.length ? 'upload' : 'bing';
        var wallpaper = clone(DEFAULT_WALLPAPER);
        wallpaper.activeSource = activeSource;
        wallpaper.providers.bing.state = mergeDefaults(oldBingMeta, DEFAULT_WALLPAPER.providers.bing.state);
        wallpaper.cache.order = activeSource === 'upload' ? oldOrder : ['bing'];
        wallpaper.cache.index = oldOrder.length ? oldIndex % oldOrder.length : 0;
        wallpaper.cache.meta = meta;

        saveWallpaper(wallpaper);
        saveThumbs(thumbs);

        var preview = null;
        if (activeSource === 'upload' && oldOrder.length) {
            preview = thumbs[oldOrder[wallpaper.cache.index]] || oldPreview;
        } else {
            preview = oldPreview || oldBingThumb;
        }
        if (preview) savePreview(preview);

        var ui = clone(DEFAULT_UI);
        ui.search.visibility = localStorage.getItem(LEGACY_KEYS.V2.SEARCH_MODE) || DEFAULT_UI.search.visibility;
        ui.search.engine = localStorage.getItem(LEGACY_KEYS.V2.SEARCH_ENGINE) || DEFAULT_UI.search.engine;
        ui.search.position = localStorage.getItem(LEGACY_KEYS.V2.SEARCH_POSITION) || DEFAULT_UI.search.position;
        ui.search.radius = localStorage.getItem(LEGACY_KEYS.V2.SEARCH_RADIUS) || DEFAULT_UI.search.radius;
        var iconOpacity = localStorage.getItem(LEGACY_KEYS.V2.ICON_OPACITY);
        ui.icon.opacity = iconOpacity !== null ? parseFloat(iconOpacity) : DEFAULT_UI.icon.opacity;
        ui.wallpaper.overlayOpacity = parseFloat(localStorage.getItem(LEGACY_KEYS.V2.OVERLAY_OPACITY)) || DEFAULT_UI.wallpaper.overlayOpacity;
        ui.wallpaper.themeEnabled = localStorage.getItem(LEGACY_KEYS.V2.WP_THEME_ENABLED) === 'true';
        ui.panel.opacity = parseFloat(localStorage.getItem(LEGACY_KEYS.V2.PANEL_OPACITY)) || DEFAULT_UI.panel.opacity;
        saveUI(ui);

        var locale = localStorage.getItem(LEGACY_KEYS.V2.LANG);
        if (locale) saveLocale(locale);

        var shortcuts = clone(DEFAULT_SHORTCUTS);
        shortcuts.items = readJSON(KEYS.SHORTCUTS, []);
        shortcuts.recents = readJSON(LEGACY_KEYS.V2.SHORTCUT_RECENTS, []);
        shortcuts.hidden = readJSON(LEGACY_KEYS.V2.SHORTCUT_HIDDEN, []);
        shortcuts.settings.primaryHotkey = localStorage.getItem(LEGACY_KEYS.V2.SHORTCUT_HOTKEY) || DEFAULT_SHORTCUTS.settings.primaryHotkey;
        shortcuts.settings.hiddenHotkey = localStorage.getItem(LEGACY_KEYS.V2.SHORTCUT_HIDDEN_HOTKEY) || DEFAULT_SHORTCUTS.settings.hiddenHotkey;
        var recommend = localStorage.getItem(LEGACY_KEYS.V2.SHORTCUT_RECOMMEND);
        shortcuts.settings.recommendEnabled = recommend === null ? true : recommend === 'true';
        shortcuts.settings.viewMode = localStorage.getItem(LEGACY_KEYS.V2.SHORTCUT_VIEW) || DEFAULT_SHORTCUTS.settings.viewMode;
        saveShortcutsModel(shortcuts);

        var oldIcons = readJSON(KEYS.SHORTCUT_ICONS, {});
        writeJSON(KEYS.SHORTCUT_ICONS, oldIcons);

        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB.STORE, 'readwrite');
                var store = tx.objectStore(DB.STORE);

                var bingReq = store.get(LEGACY_DB.V2_BING_BLOB);
                bingReq.onsuccess = function () {
                    if (bingReq.result !== undefined) {
                        store.put(normalizeImageRecord(bingReq.result, 'bing'), DB.BING_BLOB);
                        store.delete(LEGACY_DB.V2_BING_BLOB);
                    }
                };

                oldOrder.forEach(function (newId) {
                    var oldId = legacyUploadId(newId);
                    var req = store.get(legacyV2ImgKey(oldId));
                    req.onsuccess = function () {
                        if (req.result !== undefined) {
                            store.put(normalizeImageRecord(req.result, newId), imgKey(newId));
                            store.delete(legacyV2ImgKey(oldId));
                        }
                    };
                });

                tx.oncomplete = resolve;
                tx.onerror = function (e) { reject(e.target.error); };
            });
        }).then(function () {
            cleanupLegacyKeys();
        });
    }

    function normalizeImageRecord(value, id) {
        var record = imageRecord(value, id);
        if (record && !record.id) record.id = id;
        return record;
    }

    function cleanupLegacyKeys() {
        [
            LEGACY_KEYS.V2.VERSION,
            LEGACY_KEYS.V2.MODE,
            LEGACY_KEYS.V2.BING_THUMB,
            LEGACY_KEYS.V2.BING_META,
            LEGACY_KEYS.V2.IMG_ORDER,
            LEGACY_KEYS.V2.IMG_THUMBS,
            LEGACY_KEYS.V2.IMG_META,
            LEGACY_KEYS.V2.LOCAL_INDEX,
            LEGACY_KEYS.V2.PREVIEW_THUMB,
            LEGACY_KEYS.V2.LANG,
            LEGACY_KEYS.V2.SEARCH_MODE,
            LEGACY_KEYS.V2.ICON_OPACITY,
            LEGACY_KEYS.V2.SEARCH_ENGINE,
            LEGACY_KEYS.V2.SEARCH_POSITION,
            LEGACY_KEYS.V2.OVERLAY_OPACITY,
            LEGACY_KEYS.V2.SEARCH_RADIUS,
            LEGACY_KEYS.V2.PANEL_OPACITY,
            LEGACY_KEYS.V2.WP_THEME_ENABLED,
            LEGACY_KEYS.V2.WP_THEME,
            LEGACY_KEYS.V2.SHORTCUT_RECENTS,
            LEGACY_KEYS.V2.SHORTCUT_HIDDEN,
            LEGACY_KEYS.V2.SHORTCUT_HOTKEY,
            LEGACY_KEYS.V2.SHORTCUT_HIDDEN_HOTKEY,
            LEGACY_KEYS.V2.SHORTCUT_RECOMMEND,
            LEGACY_KEYS.V2.SHORTCUT_VIEW
        ].forEach(function (key) { try { localStorage.removeItem(key); } catch (e) { } });
    }

    function cleanupPt3Keys() {
        [
            LEGACY_KEYS.V1.THUMB,
            LEGACY_KEYS.V1.SOURCE,
            LEGACY_KEYS.V1.LANG,
            LEGACY_KEYS.V1.SEARCH_MODE,
            LEGACY_KEYS.V1.OPACITY,
            LEGACY_KEYS.V1.ENGINE,
            LEGACY_KEYS.V1.BING_URL,
            LEGACY_KEYS.V1.BING_DATE,
            LEGACY_KEYS.V1.BING_THUMB,
            LEGACY_KEYS.V1.WALLPAPER_SOURCE,
            LEGACY_KEYS.V1.SEARCH_VISIBILITY,
            LEGACY_KEYS.V1.LOCAL_THUMBS
        ].forEach(function (key) { try { localStorage.removeItem(key); } catch (e) { } });
    }

    function hasPt3LegacyData() {
        return [
            LEGACY_KEYS.V1.THUMB,
            LEGACY_KEYS.V1.SOURCE,
            LEGACY_KEYS.V1.LANG,
            LEGACY_KEYS.V1.SEARCH_MODE,
            LEGACY_KEYS.V1.OPACITY,
            LEGACY_KEYS.V1.ENGINE,
            LEGACY_KEYS.V1.BING_URL,
            LEGACY_KEYS.V1.BING_DATE,
            LEGACY_KEYS.V1.LOCAL_THUMBS,
            LEGACY_KEYS.V1.BING_THUMB,
            LEGACY_KEYS.V1.WALLPAPER_SOURCE,
            LEGACY_KEYS.V1.SEARCH_VISIBILITY
        ].some(function (key) { return localStorage.getItem(key) !== null; });
    }

    function migrateStorage() {
        var stored = parseInt(localStorage.getItem(KEYS.SCHEMA_VERSION), 10);
        if (!stored) stored = parseInt(localStorage.getItem(LEGACY_KEYS.V2.VERSION), 10) || 0;
        if (!stored && hasPt3LegacyData()) stored = 1;
        if (stored >= LS_VERSION) return Promise.resolve();

        if (stored === 0) {
            localStorage.setItem(KEYS.SCHEMA_VERSION, LS_VERSION);
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
            localStorage.setItem(KEYS.SCHEMA_VERSION, LS_VERSION);
            log('Migrate', 'done, now at v' + LS_VERSION);
        }).catch(function (e) {
            warn('Migrate', 'failed: ' + e.message);
            throw e;
        });
    }

    // ================================================================
    // 公开 API
    // ================================================================

    window.WallpaperData = {
        KEYS: KEYS,
        DB: DB,
        LS_VERSION: LS_VERSION,

        // IDB 操作
        openDB: openDB,
        idbPut: idbPut,
        idbGet: idbGet,
        idbDelete: idbDelete,
        idbDeleteMany: idbDeleteMany,

        // 本地图片
        imgKey: imgKey,
        imageBlob: imageBlob,
        imageRecord: imageRecord,
        loadOrder: loadOrder,
        saveOrder: saveOrder,
        loadThumbs: loadThumbs,
        saveThumbs: saveThumbs,
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
        migrate: migrateStorage,

        // 缓存清空（源切换时调用）
        clearCaches: function () {
            _thumbsCache = null;
            _wallpaperCache = null;
            _uiCache = null;
            _shortcutsCache = null;
        }
    };

})();
