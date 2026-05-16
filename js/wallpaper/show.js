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
    var _themeLoadPromise = null;

    // DOM 元素（在脚本加载时获取一次）
    var wallpaperBackEl = document.getElementById('wallpaperBack');
    var wallpaperFrontEl = document.getElementById('wallpaperFront');

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
            img.src = url;
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

    /**
     * 应用壁纸并执行双层交叉淡入过渡。
     */
    function applyWallpaper(url, transitionMs) {
        if (transitionMs === undefined) transitionMs = 200;
        var isBlobUrl = url.indexOf('blob:') === 0;

        return preloadImage(url).then(function (img) {
            var themeEnabled = false;
            if (window.WallpaperData && window.WallpaperData.loadUI) {
                themeEnabled = window.WallpaperData.loadUI().wallpaper.themeEnabled === true;
            }
            if (img && themeEnabled) {
                ensureThemeModule().then(function (theme) {
                    if (!theme) return;
                    theme.extract(img);
                    if (theme.hasCurrent()) theme.applyCurrent();
                }).catch(function () { });
            }
            wallpaperFrontEl.style.backgroundImage = 'url(' + url + ')';
            void wallpaperFrontEl.offsetWidth;
            wallpaperFrontEl.style.transition = 'opacity ' + transitionMs + 'ms ease-out';
            wallpaperFrontEl.classList.add('active');

            return new Promise(function (resolve) {
                function onTransitionEnd(e) {
                    if (e.propertyName !== 'opacity') return;
                    wallpaperBackEl.style.backgroundImage = wallpaperFrontEl.style.backgroundImage;
                    wallpaperFrontEl.classList.remove('active');
                    wallpaperFrontEl.style.backgroundImage = '';
                    wallpaperFrontEl.removeEventListener('transitionend', onTransitionEnd);
                    resolve(img);
                }
                wallpaperFrontEl.addEventListener('transitionend', onTransitionEnd);
            });
        }).then(function (img) {
            if (isBlobUrl) {
                var oldUrl = _currentWallpaperBlobUrl;
                _currentWallpaperBlobUrl = url;
                if (oldUrl && oldUrl !== url) {
                    try { URL.revokeObjectURL(oldUrl); } catch (e) { }
                }
            } else {
                if (_currentWallpaperBlobUrl) {
                    try { URL.revokeObjectURL(_currentWallpaperBlobUrl); } catch (e) { }
                    _currentWallpaperBlobUrl = null;
                }
            }
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
            img.src = source;
        });
    }

    // ================================================================
    // 公开 API
    // ================================================================

    function applyAndSavePreview(url) {
        return applyWallpaper(url).then(function (img) {
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

    window.WallpaperShow = {
        TRANSITION_MS: TRANSITION_MS,
        THUMB_MAX_W: THUMB_MAX_W,

        apply: applyWallpaper,
        applyAndSavePreview: applyAndSavePreview,
        thumbnail: generateThumbnail,
        preloadImage: preloadImage,
        ensureTheme: ensureThemeModule,

        get currentBlobUrl() { return _currentWallpaperBlobUrl; },
        set currentBlobUrl(v) { _currentWallpaperBlobUrl = v; },

        revokeBlobUrls: function () {
            if (_currentWallpaperBlobUrl) {
                try { URL.revokeObjectURL(_currentWallpaperBlobUrl); } catch (e) { }
                _currentWallpaperBlobUrl = null;
            }
        }
    };

})();
