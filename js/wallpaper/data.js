/**
 * WallpaperData —— 壁纸存储层
 * 所有 LS + IDB 读写的唯一入口。挂载到 window.WallpaperData。
 */
(function () {
    'use strict';

    // ================================================================
    // 常量
    // ================================================================

    var LS_VERSION = 2;
    var DB_VERSION = 1;

    var KEYS = {
        VERSION: 'ptab_version',
        BING_THUMB: 'ptab_bing_thumb',
        MODE: 'ptab_mode',
        BING_META: 'ptab_bing_meta',
        IMG_ORDER: 'ptab_img_order',
        IMG_THUMBS: 'ptab_img_thumbs',
        LOCAL_INDEX: 'ptab_local_index',
        PREVIEW_THUMB: 'ptab_preview_thumb',
        IMG_META: 'ptab_img_meta'
    };

    var DB = {
        NAME: 'PlainTab',
        STORE: 'wallpaper',
        BING_BLOB: 'ptab_bing_blob',
        IMG_PREFIX: 'ptab_img_'
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
    // 本地图片 order 与缩略图
    // ================================================================

    var _thumbsCache = null;
    var _metaCache = null;

    function imgKey(id) { return DB.IMG_PREFIX + id; }

    function loadOrder() {
        try { return JSON.parse(localStorage.getItem(KEYS.IMG_ORDER) || '[]'); }
        catch (e) { return []; }
    }
    function saveOrder(order) {
        try { localStorage.setItem(KEYS.IMG_ORDER, JSON.stringify(order)); }
        catch (e) { /* quota */ }
    }

    function loadThumbs() {
        if (_thumbsCache !== null) return _thumbsCache;
        try { _thumbsCache = JSON.parse(localStorage.getItem(KEYS.IMG_THUMBS) || '{}'); }
        catch (e) { _thumbsCache = {}; }
        return _thumbsCache;
    }
    function saveThumbs(thumbs) {
        try { localStorage.setItem(KEYS.IMG_THUMBS, JSON.stringify(thumbs)); }
        catch (e) { /* quota */ }
        _thumbsCache = thumbs;
    }

    function loadMeta() {
        if (_metaCache !== null) return _metaCache;
        try { _metaCache = JSON.parse(localStorage.getItem(KEYS.IMG_META) || '{}'); }
        catch (e) { _metaCache = {}; }
        return _metaCache;
    }
    function saveMeta(meta) {
        try { localStorage.setItem(KEYS.IMG_META, JSON.stringify(meta)); } catch (e) { }
        _metaCache = meta;
    }

    // ================================================================
    // Bing 元数据
    // ================================================================

    function loadBingMeta() {
        try { var raw = localStorage.getItem(KEYS.BING_META); return raw ? JSON.parse(raw) : {}; }
        catch (e) { return {}; }
    }
    function saveBingMeta(meta) {
        try { localStorage.setItem(KEYS.BING_META, JSON.stringify(meta)); }
        catch (e) { /* quota 满了 */ }
    }

    // ================================================================
    // 存储迁移
    // ================================================================

    var log = function (tag, msg) { console.log('[' + tag + '] ' + msg); };
    var warn = function (tag, msg) { console.warn('[' + tag + '] ' + msg); };

    var MIGRATIONS = {
        1: migrate_1_to_2
    };

    function migrate_1_to_2() {
        var oldThumbs = [];
        try { oldThumbs = JSON.parse(localStorage.getItem('local_thumbs') || '[]'); } catch (e) { }

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

        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB.STORE, 'readwrite');
                var store = tx.objectStore(DB.STORE);
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
                    }
                };

                tx.oncomplete = function () { resolve(result); };
                tx.onerror = function (e) { reject(e.target.error); };
            });
        }).then(function (result) {
            if (result.order.length) {
                localStorage.setItem('ptab_img_order', JSON.stringify(result.order));
                var thumbs = {};
                for (var i = 0; i < oldThumbs.length && i < result.order.length; i++) {
                    thumbs[result.order[i]] = oldThumbs[i];
                }
                localStorage.setItem('ptab_img_thumbs', JSON.stringify(thumbs));
            }

            return openDB().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var tx = db.transaction(DB.STORE, 'readwrite');
                    var store = tx.objectStore(DB.STORE);
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

    function migrateStorage() {
        var stored = parseInt(localStorage.getItem(KEYS.VERSION)) || 0;
        if (stored >= LS_VERSION) return Promise.resolve();

        if (stored === 0) {
            localStorage.setItem(KEYS.VERSION, LS_VERSION);
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
            localStorage.setItem(KEYS.VERSION, LS_VERSION);
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
        loadOrder: loadOrder,
        saveOrder: saveOrder,
        loadThumbs: loadThumbs,
        saveThumbs: saveThumbs,
        loadMeta: loadMeta,
        saveMeta: saveMeta,

        // Bing 元数据
        loadBingMeta: loadBingMeta,
        saveBingMeta: saveBingMeta,

        // 迁移
        migrate: migrateStorage,

        // 缓存清空（源切换时调用）
        clearCaches: function () {
            _thumbsCache = null;
            _metaCache = null;
        }
    };

})();
