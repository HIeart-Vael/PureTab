/**
 * WallpaperFetch —— 壁纸数据源
 * Bing 每日壁纸获取、图片下载、Blob 缓存等纯数据操作。
 * 不直接操作 DOM —— 由 newtab.js 负责编排。
 * 挂载到 window.WallpaperFetch。
 */
(function () {
    'use strict';

    // 引用其他模块
    var D = window.WallpaperData;
    var S = window.WallpaperShow;
    function log() { window.log.apply(window, arguments); }
    function warn() { window.warn.apply(window, arguments); }

    // ================================================================
    // Bing 端点
    // ================================================================

    var BING_PRIMARY = function (mkt) { return 'https://bing.kaininx.workers.dev/?resolution=1920x1080&format=json&index=0&mkt=' + mkt; };
    var BING_FALLBACK = function (mkt) { return 'https://bing.biturl.top/?resolution=1920x1080&format=json&index=0&mkt=' + mkt; };

    // ================================================================
    // Bing 每日壁纸获取与缓存
    // ================================================================

    function bingMkt(lang) {
        var map = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', 'en': 'en-US', 'ja': 'ja-JP', 'ko': 'ko-KR', 'fr': 'fr-FR', 'de': 'de-DE', 'es': 'es-ES', 'it': 'it-IT', 'pt': 'pt-BR', 'ru': 'ru-RU', 'ar': 'ar-SA', 'hi': 'hi-IN', 'tr': 'tr-TR', 'pl': 'pl-PL', 'vi': 'vi-VN' };
        return map[lang] || 'en-US';
    }

    function fetchBingUrl(lang) {
        var mkt = bingMkt(lang);
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
        var t = '&t=' + Date.now();
        return Promise.any([
            tryFetch(BING_PRIMARY(mkt) + t, 'primary', 8000),
            tryFetch(BING_FALLBACK(mkt) + t, 'fallback', 8000)
        ]).finally(function () { shared.abort(); });
    }

    function downloadBingBlob(url) {
        return fetch(url, { mode: 'cors' }).then(function (r) {
            if (!r.ok) throw new Error('fetch failed');
            return r.blob();
        });
    }

    function cacheBingBlob(url, provider, today) {
        var meta = D.loadBingMeta();
        var isNew = meta.src !== url;

        if (!isNew) {
            return D.idbGet(D.DB.BING_BLOB).then(function (record) {
                var blob = D.imageBlob(record);
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
                var kb = (blob.size / 1024).toFixed(0);
                log('Bing', 'fetched new wallpaper from ' + provider + '  ·  ' + kb + ' KB');
                return D.idbPut(D.DB.BING_BLOB, D.imageRecord(blob, 'bing')).then(function () {
                    meta.src = url;
                    meta.date = today;
                    meta.provider = provider;
                    D.saveBingMeta(meta);
                    return blob;
                });
            }).catch(function () { warn('Bing', 'got the URL but failed to download image, kept last image'); });
        }
    }

    // ================================================================
    // 通用工具
    // ================================================================

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    // ================================================================
    // 公开 API
    // ================================================================

    window.WallpaperFetch = {
        bingMkt: bingMkt,
        fetchBingUrl: fetchBingUrl,
        downloadBingBlob: downloadBingBlob,
        cacheBingBlob: cacheBingBlob,
        generateId: generateId
    };

})();
