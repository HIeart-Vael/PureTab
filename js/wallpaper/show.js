/**
 * WallpaperShow —— 壁纸渲染层
 * 双图层交叉淡入 + 缩略图生成。所有 5 个壁纸源共用。
 * 挂载到 window.WallpaperShow。
 */
(function () {
    'use strict';

    var TRANSITION_MS = 500; // 壁纸淡入过渡时长（ms），必须与 CSS 中的 transition-duration 保持一致
    var THUMB_MAX_W = 640;   // 生成缩略图的最大宽度（px）

    // 追踪当前壁纸的 blob URL，用于在切换壁纸时 revoke 旧 URL 释放内存
    var _currentWallpaperBlobUrl = null;
    var _currentWallpaperSourceUrl = null;
    var _currentWallpaperSourceId = null;
    var _themeLoadPromise = null;
    var BLUR_THUMB_MAX_W = 960;

    // DOM 元素（在脚本加载时获取一次）
    var wallpaperBackEl = document.getElementById('wallpaperBack');
    var wallpaperFrontEl = document.getElementById('wallpaperFront');

    function imageSourceFromCssValue(value) {
        if (typeof value !== 'string') return value;
        var match = value.match(/^url\(["']?(.*?)["']?\)$/);
        return match && match[1] ? match[1] : value;
    }

    function trackCurrentWallpaperUrl(url, id) {
        var oldUrl = _currentWallpaperBlobUrl;
        _currentWallpaperSourceUrl = url || null;
        _currentWallpaperSourceId = id || null;
        _currentWallpaperBlobUrl = url && url.indexOf('blob:') === 0 ? url : null;
        if (oldUrl && oldUrl !== url) {
            try { URL.revokeObjectURL(oldUrl); } catch (e) { }
        }
    }

    function currentDisplaySource() {
        var background = (wallpaperFrontEl && wallpaperFrontEl.style.backgroundImage) ||
            (wallpaperBackEl && wallpaperBackEl.style.backgroundImage);
        return imageSourceFromCssValue(background);
    }

    // ================================================================
    // 壁纸核心 — 双图层零白屏系统
    // ================================================================

    /**
     * 将图片预加载到浏览器缓存，返回已解码的 Image 对象。
     */
    function preloadImage(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                img.decode().then(function () { resolve(img); }, function () { resolve(img); });
            };
            img.onerror = function () { resolve(null); };
            img.src = imageSourceFromCssValue(url);
        });
    }

    function ensureThemeModule() {
        if (window.WallpaperTheme) return Promise.resolve(window.WallpaperTheme);
        if (!_themeLoadPromise) {
            _themeLoadPromise = new Promise(function (resolve, reject) {
                var existing = document.querySelector('script[src="js/wallpaper/theme.js"]');
                if (existing) {
                    existing.addEventListener('load', function () { resolve(window.WallpaperTheme); }, { once: true });
                    existing.addEventListener('error', function () { reject(new Error('failed to load wallpaper theme')); }, { once: true });
                    return;
                }
                var script = document.createElement('script');
                script.src = 'js/wallpaper/theme.js';
                script.onload = function () { resolve(window.WallpaperTheme); };
                script.onerror = function () { reject(new Error('failed to load wallpaper theme')); };
                document.body.appendChild(script);
            });
        }
        return _themeLoadPromise;
    }

    function afterAnimationFrame(callback) {
        requestAnimationFrame(function () {
            requestAnimationFrame(callback);
        });
    }

    function scheduleIdle(callback) {
        if (window.requestIdleCallback) {
            requestIdleCallback(callback, { timeout: 1200 });
            return;
        }
        setTimeout(callback, 0);
    }

    function applyExtractedTheme(img) {
        if (!img) return;
        ensureThemeModule().then(function (theme) {
            if (!theme) return;
            theme.extract(img);
            if (theme.hasCurrent()) theme.applyCurrent();
        }).catch(function () { });
    }

    function scheduleThemeExtraction(img) {
        afterAnimationFrame(function () {
            scheduleIdle(function () {
                applyExtractedTheme(img);
            });
        });
    }

    function refreshThemeFromCurrentWallpaper(force) {
        if (!(window.WallpaperData && window.WallpaperData.loadUI)) return Promise.resolve(false);
        if (force !== true && window.WallpaperData.loadUI().wallpaper.themeEnabled !== true) return Promise.resolve(false);

        var background = wallpaperBackEl && wallpaperBackEl.style.backgroundImage;
        var match = background && background.match(/^url\(["']?(.*?)["']?\)$/);
        if (!match || !match[1]) return Promise.resolve(false);

        return preloadImage(match[1]).then(function (img) {
            if (!img) return false;
            return new Promise(function (resolve) {
                afterAnimationFrame(function () {
                    scheduleIdle(function () {
                        applyExtractedTheme(img);
                        resolve(true);
                    });
                });
            });
        }).catch(function () { return false; });
    }

    /**
     * 应用壁纸并执行双层交叉淡入过渡。
     */
    function applyWallpaper(url, transitionMs, sourceId) {
        if (typeof transitionMs !== 'number' || !isFinite(transitionMs)) transitionMs = 200;

        return preloadImage(url).then(function (img) {
            var themeEnabled = false;
            if (window.WallpaperData && window.WallpaperData.loadUI) {
                themeEnabled = window.WallpaperData.loadUI().wallpaper.themeEnabled === true;
            }
            if (img && themeEnabled) {
                scheduleThemeExtraction(img);
            }
            wallpaperFrontEl.style.backgroundImage = 'url(' + url + ')';
            void wallpaperFrontEl.offsetWidth;
            wallpaperFrontEl.style.transition = 'opacity ' + transitionMs + 'ms ease-out';
            wallpaperFrontEl.classList.add('active');

            return new Promise(function (resolve) {
                var done = false;
                function onTransitionEnd(e) {
                    if (e.propertyName !== 'opacity') return;
                    finishTransition();
                }
                function finishTransition() {
                    if (done) return;
                    done = true;
                    wallpaperBackEl.style.backgroundImage = wallpaperFrontEl.style.backgroundImage;
                    wallpaperFrontEl.classList.remove('active');
                    wallpaperFrontEl.style.backgroundImage = '';
                    wallpaperFrontEl.removeEventListener('transitionend', onTransitionEnd);
                    resolve(img);
                }
                wallpaperFrontEl.addEventListener('transitionend', onTransitionEnd);
                window.setTimeout(finishTransition, transitionMs + 100);
            });
        }).then(function (img) {
            trackCurrentWallpaperUrl(url, sourceId);
            return img;
        });
    }

    /**
     * 生成缩略图（纯计算，不写 localStorage）。
     */
    function generateThumbnail(source) {
        function processImage(img) {
            var canvas = document.createElement('canvas');
            var scale = THUMB_MAX_W / img.width;
            canvas.width = THUMB_MAX_W;
            canvas.height = Math.floor(img.height * scale);
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            var thumb = 'url(' + canvas.toDataURL('image/jpeg', 0.55) + ')';
            canvas.width = 0;
            canvas.height = 0;
            return thumb;
        }

        if (source && typeof source !== 'string') {
            return Promise.resolve(processImage(source));
        }

        return new Promise(function (resolve) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () { var r = processImage(img); img.src = ''; resolve(r); };
            img.onerror = function () { resolve(null); };
            img.src = imageSourceFromCssValue(source);
        });
    }

    function normalizeBlur(value) {
        if (window.WallpaperData && window.WallpaperData.normalizeWallpaperBlur) {
            return window.WallpaperData.normalizeWallpaperBlur(value);
        }
        var n = parseInt(value, 10);
        if (isNaN(n) || n <= 0) return 0;
        if (n < 5) return 5;
        return Math.max(5, Math.min(15, n));
    }

    function drawImageCover(ctx, img, width, height, overscan) {
        var scale = Math.max((width + overscan * 2) / img.width, (height + overscan * 2) / img.height);
        var drawW = img.width * scale;
        var drawH = img.height * scale;
        var x = (width - drawW) / 2;
        var y = (height - drawH) / 2;
        ctx.drawImage(img, x, y, drawW, drawH);
    }

    function generateBlurredThumbnail(source, blur) {
        blur = normalizeBlur(blur);
        if (!blur) return generateThumbnail(source);

        function processImage(img) {
            var scale = Math.min(1, BLUR_THUMB_MAX_W / img.width);
            var width = Math.max(1, Math.round(img.width * scale));
            var height = Math.max(1, Math.round(img.height * scale));
            var pad = Math.ceil(blur * 3);
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');
            ctx.save();
            ctx.filter = 'blur(' + blur + 'px)';
            drawImageCover(ctx, img, width, height, pad);
            ctx.restore();
            var thumb = 'url(' + canvas.toDataURL('image/jpeg', 0.62) + ')';
            canvas.width = 0;
            canvas.height = 0;
            return thumb;
        }

        if (source && typeof source !== 'string') {
            return Promise.resolve(processImage(source));
        }

        return new Promise(function (resolve) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () { var r = processImage(img); img.src = ''; resolve(r); };
            img.onerror = function () { resolve(null); };
            img.src = imageSourceFromCssValue(source);
        });
    }

    // ================================================================
    // 公开 API
    // ================================================================

    function applyAndSavePreview(url, sourceId) {
        return applyWallpaper(url, undefined, sourceId).then(function (img) {
            if (!img) return;
            return generateThumbnail(img).then(function (thumb) {
                if (thumb) {
                    if (window.WallpaperData && window.WallpaperData.savePreview) {
                        window.WallpaperData.savePreview(thumb);
                    } else {
                        try { localStorage.setItem('ptab_wallpaper_preview', thumb); } catch (e) { }
                    }
                }
            });
        });
    }

    function showPreparedPreview(preview, options) {
        if (!preview || !wallpaperBackEl) return;
        wallpaperBackEl.style.backgroundImage = preview;
        wallpaperFrontEl.classList.remove('active');
        wallpaperFrontEl.style.backgroundImage = '';
        if (!(options && options.keepCurrentUrl)) {
            if (_currentWallpaperBlobUrl) {
                try { URL.revokeObjectURL(_currentWallpaperBlobUrl); } catch (e) { }
            }
            _currentWallpaperBlobUrl = null;
            _currentWallpaperSourceUrl = null;
            _currentWallpaperSourceId = null;
        }
    }

    function showPreparedUrl(url, id) {
        if (!url || !wallpaperBackEl) return;
        wallpaperBackEl.style.backgroundImage = 'url(' + url + ')';
        wallpaperFrontEl.classList.remove('active');
        wallpaperFrontEl.style.backgroundImage = '';
        trackCurrentWallpaperUrl(url, id);
    }

    window.WallpaperShow = {
        TRANSITION_MS: TRANSITION_MS,
        THUMB_MAX_W: THUMB_MAX_W,
        BLUR_THUMB_MAX_W: BLUR_THUMB_MAX_W,

        apply: applyWallpaper,
        applyAndSavePreview: applyAndSavePreview,
        thumbnail: generateThumbnail,
        blurredThumbnail: generateBlurredThumbnail,
        showPreparedPreview: showPreparedPreview,
        showPreparedUrl: showPreparedUrl,
        currentDisplaySource: currentDisplaySource,
        keepCurrentUrl: trackCurrentWallpaperUrl,
        preloadImage: preloadImage,
        ensureTheme: ensureThemeModule,
        refreshTheme: refreshThemeFromCurrentWallpaper,

        get currentBlobUrl() { return _currentWallpaperBlobUrl; },
        set currentBlobUrl(v) { _currentWallpaperBlobUrl = v; },
        get currentOriginalUrl() { return _currentWallpaperSourceUrl || _currentWallpaperBlobUrl; },
        get currentOriginalId() { return _currentWallpaperSourceId; },

        revokeBlobUrls: function () {
            if (_currentWallpaperBlobUrl) {
                try { URL.revokeObjectURL(_currentWallpaperBlobUrl); } catch (e) { }
                _currentWallpaperBlobUrl = null;
            }
            _currentWallpaperSourceUrl = null;
            _currentWallpaperSourceId = null;
        }
    };

})();
