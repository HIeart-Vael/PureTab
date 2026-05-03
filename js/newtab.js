(function () {
    'use strict';

    // ========== 常量 ==========
    var BING_PRIMARY = function (mkt) { return 'https://bing.biturl.top/?resolution=1920x1080&format=image&index=0&mkt=' + mkt; };
    var BING_FALLBACK = 'https://bing.img.run/1920x1080.php';
    var DB_NAME = 'PlainTabV3';
    var DB_VERSION = 1;
    var STORE = 'wallpaper';
    var THUMB_KEY = '__pt3_thumb';
    var LANG_KEY = 'pt3_lang';
    var SOURCE_KEY = 'pt3_source';
    var SEARCH_MODE_KEY = 'pt3_search_mode';
    var OPACITY_KEY = 'pt3_opacity';
    var ENGINE_KEY = 'pt3_engine';
    var CACHE_URL_KEY = 'pt3_bing_url';
    var CACHE_DATE_KEY = 'pt3_bing_date';
    var BING_BLOB_KEY = 'bing_blob';
    var BING_DATE_KEY = 'bing_date';
    var LOCAL_BLOB_KEY = 'local_blob';
    var LOCAL_MIME_KEY = 'local_mime';
    var TRANSITION_MS = 500;

    // ========== DOM ==========
    var back = document.getElementById('wallpaperBack');
    var front = document.getElementById('wallpaperFront');
    var searchBar = document.getElementById('searchBar');
    var searchInput = document.getElementById('searchInput');
    var engineIcon = document.getElementById('searchEngineIcon');
    var settingsBtn = document.getElementById('settingsBtn');
    var langBtn = document.getElementById('langBtn');
    var settingsPanel = document.getElementById('settingsPanel');
    var langPanel = document.getElementById('langPanel');
    var langOptions = document.getElementById('langOptions');
    var wpInfo = document.getElementById('wpInfo');
    var uploadBtn = document.getElementById('uploadBtn');
    var fileInput = document.getElementById('fileInput');
    var resetBtn = document.getElementById('resetBtn');
    var advToggle = document.getElementById('advToggle');
    var advSection = document.getElementById('advSection');
    var searchModeSel = document.getElementById('searchModeSel');
    var opacityRange = document.getElementById('opacityRange');
    var opacityNum = document.getElementById('opacityNum');
    var engineSel = document.getElementById('engineSel');
    var resetAdvBtn = document.getElementById('resetAdvBtn');

    // ========== 状态 ==========
    var currentSource = 'bing';
    var currentLang = 'en';
    var searchMode = 'always';
    var currentOpacity = 0.45;
    var currentEngine = 'google';
    var engineIndex = 0;
    var mouseNearCorner = false;
    var mouseOnSearch = false;
    var panelOpen = false;
    var langOpen = false;
    var hideTimeout = null;
    var searchTimeout = null;
    var localBlobUrl = null;
    var I18N = window.I18N || {};
    var LanguageList = window.LanguageList || [];
    var ENGINES = ['google', 'bing', 'baidu', 'duckduckgo'];
    var ENGINE_SVG = {
        google: '<svg height="1em" viewBox="0 0 24 24" width="1em"><path d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z" fill="#4285F4"/><path d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z" fill="#34A853"/><path d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z" fill="#FBBC05"/><path d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z" fill="#EB4335"/></svg>',
        bing: '<svg height="1em" viewBox="0 0 24 24" width="1em"><defs><radialGradient cx="93.7%" cy="77.8%" r="143.7%" id="b0"><stop offset="0%" stop-color="#00CACC"/><stop offset="100%" stop-color="#048FCE"/></radialGradient><radialGradient cx="13.9%" cy="71.4%" r="149.2%" id="b1"><stop offset="0%" stop-color="#00BBEC"/><stop offset="100%" stop-color="#2756A9"/></radialGradient><linearGradient id="b2" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#00BBEC"/><stop offset="100%" stop-color="#2756A9"/></linearGradient></defs><path d="M11.97 7.57a.92.92 0 00-.805.863c-.013.195-.01.209.43 1.347 1 2.59 1.242 3.214 1.283 3.302.099.213.237.413.41.592.134.138.222.212.37.311.26.176.39.224 1.405.527.989.295 1.529.49 1.994.723.603.302 1.024.644 1.29 1.051.191.292.36.815.434 1.342.029.206.029.661 0 .847a2.491 2.491 0 01-.376 1.026c-.1.151-.065.126.081-.058.415-.52.838-1.408 1.054-2.213a6.728 6.728 0 00.102-3.012 6.626 6.626 0 00-3.291-4.53l-1.322-.698-.254-.133-1.575-.827c-.548-.29-.78-.406-.846-.426a1.376 1.376 0 00-.29-.045l-.093.01z" fill="url(#b0)"/><path d="M13.164 17.24l-.202.125-1.795 1.115-.989.614-.463.288-1.502.941c-.326.2-.704.334-1.09.387-.18.024-.52.024-.7 0a2.807 2.807 0 01-1.318-.538 3.665 3.665 0 01-.543-.545 2.837 2.837 0 01-.506-1.141l-.041-.182c-.008-.008.006.138.032.33.027.199.085.487.147.733.482 1.907 1.85 3.457 3.705 4.195a6.31 6.31 0 001.658.412c.22.025.844.035 1.074.017 1.054-.08 1.972-.393 2.913-.992l.937-.596.384-.244.684-.435.234-.149.009-.005.025-.017.013-.007.172-.11.597-.38c.76-.481.987-.65 1.34-.998.148-.146.37-.394.381-.425l.088-.136a2.49 2.49 0 00.373-1.023 4.181 4.181 0 000-.847 4.336 4.336 0 00-.318-1.137c-.224-.472-.7-.9-1.383-1.245l-.406-.181c-.01 0-.646.392-1.413.87l-1.658 1.031-.439.274z" fill="url(#b1)"/><path d="M4.003 14.946l.004 3.33.042.193c.134.604.366 1.04.77 1.445a2.701 2.701 0 001.955.814c.536 0 1-.135 1.479-.43l.703-.435.556-.346V8.003c0-2.306-.004-3.675-.012-3.782a2.734 2.734 0 00-.797-1.765c-.145-.144-.268-.24-.637-.496L5.762.362C5.406.115 5.38.098 5.271.059a.943.943 0 00-1.254.696C4.003.818 4 1.659 4 6.223v5.394H4l.003 3.329z" fill="url(#b2)"/></svg>',
        duckduckgo: '<svg viewBox="0 0 122.88 122.88"><defs><style>.a{fill:#d53}.b{fill:#fff}.c{fill:#ddd}.d{fill:#fc0}.e{fill:#6b5}.f{fill:#4a4}.g{fill:#148}</style></defs><path class="a" d="M122.88 61.44a61.44 61.44 0 10-61.44 61.44 61.44 61.44 0 0061.44-61.44z"/><path class="b" d="M114.37 61.44a52.92 52.92 0 10-15.5 37.43 52.76 52.76 0 0015.5-37.43zm-13.12-39.8A56.29 56.29 0 1161.44 5.15a56.12 56.12 0 0139.81 16.49z"/><path class="c" d="M43.24 30.15C26.17 34.13 32.43 58 32.43 58l10.81 52.9 4 1.71-4-82.49zm-4-10.24H34.7L41 22.19s-6.26 0-6.26 4C48.36 25.6 54.61 29 54.61 29l-15.36-9.1z"/><path class="b" d="M75.66 115.48S62 93.87 62 79.64c0-26.73 17.63-4 17.63-25S62 28.44 62 28.44c-8.53-10.8-25-8.53-25-8.53l4 2.28s-4 1.13-5.12 2.27 10.81-1.7 15.93 2.85C30.72 29 34.13 46.08 34.13 46.08l11.95 68.27 29.58 1.13z"/><path class="d" d="M75.66 60.87l21.62-5.69C116.62 58 80.78 68.84 78.51 68.27c-17.07-2.85-12 11.37 8.53 6.82s5.12 11.38-13.65 5.12c-26.74-7.39-12.52-20.48 2.27-19.34z"/><path class="e" d="M70 105.81l1.14-1.7c12.52 4.55 13.09 6.25 12.52-5.12s0-11.38-13.09-1.71c0-2.84-7.39-1.71-8.53 0-11.95-5.12-13.09-6.83-12.52 1.14 1.14 16.5.57 13.65 11.95 8l8.53-.57z"/><path class="f" d="M60.87 99.56v6.82c.57 1.14 9.67 1.14 9.67-1.14s-4.55 1.71-7.39.57S62 98.42 62 98.42l-1.14 1.14z"/><path class="g" d="M48.36 43.24c-2.85-3.42-10.24-.57-8.54 4 .57-2.28 4.55-5.69 8.54-4zm18.2 0c.57-3.42 6.26-4 8-.57a8 8 0 00-8 .57zm-18.77 9.1a1.14 1.14 0 110 .57v-.57zm-4.55 2.27a4 4 0 100-.57v.57zm29.58-4a1.14 1.14 0 110 .57v-.57zM69.4 52.91a3.42 3.42 0 100-.57v.57z"/></svg>',
        baidu: '<svg height="1em" viewBox="0 0 24 24" width="1em"><path d="M8.859 11.735c1.017-1.71 4.059-3.083 6.202.286 1.579 2.284 4.284 4.397 4.284 4.397s2.027 1.601.73 4.684c-1.24 2.956-5.64 1.607-6.005 1.49l-.024-.009s-1.746-.568-3.776-.112c-2.026.458-3.773.286-3.773.286l-.045-.001c-.328-.01-2.38-.187-3.001-2.968-.675-3.028 2.365-4.687 2.592-4.968.226-.288 1.802-1.37 2.816-3.085zm.986 1.738v2.032h-1.64s-1.64.138-2.213 2.014c-.2 1.252.177 1.99.242 2.148.067.157.596 1.073 1.927 1.342h3.078v-7.514l-1.394-.022zm3.588 2.191l-1.44.024v3.956s.064.985 1.44 1.344h3.541v-5.3h-1.528v3.979h-1.46s-.466-.068-.553-.447v-3.556zM9.82 16.715v3.06H8.58s-.863-.045-1.126-1.049c-.136-.445.02-.959.088-1.16.063-.203.353-.671.951-.85H9.82zm9.525-9.036c2.086 0 2.646 2.06 2.646 2.742 0 .688.284 3.597-2.309 3.655-2.595.057-2.704-1.77-2.704-3.08 0-1.374.277-3.317 2.367-3.317zM4.24 6.08c1.523-.135 2.645 1.55 2.762 2.513.07.625.393 3.486-1.975 4-2.364.515-3.244-2.249-2.984-3.544 0 0 .28-2.797 2.197-2.969zm8.847-1.483c.14-1.31 1.69-3.316 2.931-3.028 1.236.285 2.367 1.944 2.137 3.37-.224 1.428-1.345 3.313-3.095 3.082-1.748-.226-2.143-1.823-1.973-3.424zM9.425 1c1.307 0 2.364 1.519 2.364 3.398 0 1.879-1.057 3.4-2.364 3.4s-2.367-1.521-2.367-3.4C7.058 2.518 8.118 1 9.425 1z" fill="#2932E1"/></svg>'
    };

    // ========== i18n ==========
    function t(key) {
        if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
            var msg = chrome.i18n.getMessage(key);
            if (msg) return msg;
        }
        return (I18N[currentLang] && I18N[currentLang][key]) || (I18N['en'] && I18N['en'][key]) || key;
    }

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

    function updateLangUI() {
        document.title = t('extName');
        searchInput.placeholder = t('searchPlaceholder');
        engineIcon.setAttribute('title', t('engineTitle'));
        langBtn.setAttribute('title', t('langTitle'));
        settingsBtn.setAttribute('title', t('settingsTitle'));
        document.querySelector('.settings-panel h3').textContent = t('panelTitle');
        wpInfo.textContent = currentSource === 'local' ? t('wpLocal') : t('wpBing');
        uploadBtn.textContent = t('uploadBtn');
        resetBtn.textContent = t('resetBtn');
        advToggle.textContent = t('advToggle');
        var labels = document.querySelectorAll('.setting-row label');
        if (labels.length >= 3) {
            labels[0].textContent = t('searchLabel');
            labels[1].textContent = t('opacityLabel');
            labels[2].textContent = t('engineLabel');
        }
        var opts = searchModeSel.options;
        if (opts.length >= 3) { opts[0].textContent = t('searchHover'); opts[1].textContent = t('searchAlways'); opts[2].textContent = t('searchNever'); }
        resetAdvBtn.textContent = t('resetAdv');
        renderLangPanel();
    }

    function renderLangPanel() {
        document.querySelector('.lang-title').textContent = t('langPanelTitle');
        langOptions.innerHTML = '';
        LanguageList.forEach(function (lang) {
            var btn = document.createElement('button');
            btn.className = 'lang-option' + (lang.code === currentLang ? ' current' : '');
            btn.textContent = lang.name;
            btn.addEventListener('click', function () {
                if (lang.code !== currentLang) {
                    localStorage.setItem(LANG_KEY, lang.code);
                    currentLang = lang.code;
                    updateLangUI();
                }
                closeLangPanel();
            });
            langOptions.appendChild(btn);
        });
    }

    // ========== IDB ==========
    function openDB() {
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function (e) {
                if (!e.target.result.objectStoreNames.contains(STORE)) e.target.result.createObjectStore(STORE);
            };
            req.onsuccess = function (e) { resolve(e.target.result); };
            req.onerror = function (e) { reject(e.target.error); };
        });
    }

    function idbPut(key, value) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE, 'readwrite');
                tx.objectStore(STORE).put(value, key);
                tx.oncomplete = resolve;
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function idbGet(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve) {
                var tx = db.transaction(STORE, 'readonly');
                var req = tx.objectStore(STORE).get(key);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function () { resolve(null); };
            });
        });
    }

    function idbDelete(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE, 'readwrite');
                tx.objectStore(STORE).delete(key);
                tx.oncomplete = resolve;
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    // ========== 双层壁纸核心 ==========
    // preload.js 已将缩略图写入 #wallpaperBack（通过 <style id="__pt3_wp">）
    // 本模块将完整壁纸通过 #wallpaperFront 淡入，然后固化到 back 层
    function setWallpaperStyle(url) {
        var style = document.getElementById('__pt3_wp');
        if (!style) {
            style = document.createElement('style');
            style.id = '__pt3_wp';
            document.head.appendChild(style);
        }
        var escaped = url.replace(/['"\\]/g, function (c) {
            if (c === "'") return "\\'";
            if (c === '"') return '\\"';
            if (c === '\\') return '\\\\';
            return c;
        });
        style.textContent = '#wallpaperBack{background-image:url(\'' + escaped + '\')}';
    }

    function preloadImage(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () {
                img.decode().then(function () { resolve(true); }, function () { resolve(true); });
            };
            img.onerror = function () { resolve(false); };
            img.src = url;
        });
    }

    function applyWallpaper(url, source) {
        // 1. 预加载图片确保已解码
        return preloadImage(url).then(function () {
            // 2. 将新图设到 front 层（当前 opacity:0 不可见）
            var escaped = url.replace(/'/g, "\\'");
            front.style.backgroundImage = 'url(\'' + escaped + '\')';

            // 3. 等待浏览器完成样式计算和至少一次绘制
            return new Promise(function (resolve) {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        // 4. 淡入 front 层，覆盖 back 层
                        front.classList.add('active');
                        // 5. 过渡结束后固化到 back 层，重置 front
                        setTimeout(function () {
                            setWallpaperStyle(url);
                            front.classList.remove('active');
                            front.style.backgroundImage = '';
                            resolve();
                        }, TRANSITION_MS + 50);
                    });
                });
            });
        }).then(function () {
            currentSource = source;
            wpInfo.textContent = source === 'local' ? t('wpLocal') : t('wpBing');
            generateThumbnail(url);
        });
    }

    function generateThumbnail(url) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            var canvas = document.createElement('canvas');
            var MAX_W = 640;
            var scale = MAX_W / img.width;
            canvas.width = MAX_W;
            canvas.height = Math.floor(img.height * scale);
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            try {
                var base64 = canvas.toDataURL('image/jpeg', 0.55);
                localStorage.setItem(THUMB_KEY, base64);
            } catch (e) { /* canvas tainted or quota exceeded */ }
        };
        img.onerror = function () { /* ignore */ };
        img.src = url;
    }

    // ========== Bing 壁纸 ==========
    function bingMkt(lang) {
        var map = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', 'en': 'en-US', 'ja': 'ja-JP', 'ko': 'ko-KR', 'fr': 'fr-FR', 'de': 'de-DE', 'es': 'es-ES', 'it': 'it-IT', 'pt': 'pt-BR', 'ru': 'ru-RU', 'ar': 'ar-SA', 'hi': 'hi-IN', 'tr': 'tr-TR', 'pl': 'pl-PL', 'vi': 'vi-VN' };
        return map[lang] || 'en-US';
    }

    function testUrl(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            var timer = setTimeout(function () { img.src = ''; resolve(false); }, 8000);
            img.onload = function () { clearTimeout(timer); resolve(true); };
            img.onerror = function () { clearTimeout(timer); resolve(false); };
            img.src = url;
        });
    }

    function fetchBingUrl() {
        var mkt = bingMkt(currentLang);
        var primary = BING_PRIMARY(mkt) + '&t=' + Date.now();
        return testUrl(primary).then(function (ok) {
            if (ok) return primary;
            return testUrl(BING_FALLBACK + '?t=' + Date.now()).then(function (ok2) {
                if (ok2) return BING_FALLBACK;
                throw new Error('Bing unavailable');
            });
        });
    }

    function downloadBingBlob(url) {
        return fetch(url, { mode: 'cors' }).then(function (r) {
            if (!r.ok) throw new Error('fetch failed');
            return r.blob();
        });
    }

    function cacheBingInBackground() {
        var today = new Date().toDateString();
        if (localStorage.getItem(CACHE_DATE_KEY) === today && localStorage.getItem(CACHE_URL_KEY)) return;
        fetchBingUrl().then(function (newUrl) {
            localStorage.setItem(CACHE_URL_KEY, newUrl);
            localStorage.setItem(CACHE_DATE_KEY, today);
            return downloadBingBlob(newUrl).then(function (blob) {
                return idbPut(BING_BLOB_KEY, blob).then(function () {
                    return idbPut(BING_DATE_KEY, today);
                }).then(function () {
                    if (currentSource === 'bing') {
                        var url = URL.createObjectURL(blob);
                        applyWallpaper(url, 'bing');
                    }
                });
            });
        }).catch(function () { /* silent */ });
    }

    // ========== 主加载流程 ==========
    function loadWallpaper() {
        var lastSource = localStorage.getItem(SOURCE_KEY) || 'bing';

        // 并行读取 IDB 中的本地和 Bing 壁纸
        return Promise.all([
            Promise.all([idbGet(LOCAL_BLOB_KEY), idbGet(LOCAL_MIME_KEY)]),
            Promise.all([idbGet(BING_BLOB_KEY), idbGet(BING_DATE_KEY)])
        ]).then(function (results) {
            var localData = results[0];
            var bingData = results[1];
            var localBlob = localData[0];
            var localMime = localData[1];
            var bingBlob = bingData[0];
            var bingDate = bingData[1];
            var today = new Date().toDateString();

            // 1) 本地壁纸优先
            if (lastSource === 'local' && localBlob) {
                var blob = localBlob;
                if ((!blob.type || blob.type === '') && localMime) {
                    try { blob = new Blob([blob], { type: localMime }); } catch (e) { }
                }
                var url = URL.createObjectURL(blob);
                return applyWallpaper(url, 'local').then(function () {
                    cacheBingInBackground();
                });
            }

            // 2) 今日 Bing blob
            if (bingBlob && bingDate === today) {
                var url = URL.createObjectURL(bingBlob);
                return applyWallpaper(url, 'bing').then(function () {
                    cacheBingInBackground();
                });
            }

            // 3) 网络路径
            currentSource = 'bing';
            wpInfo.textContent = t('wpBing');

            var cachedUrl = localStorage.getItem(CACHE_URL_KEY);
            var cachedDate = localStorage.getItem(CACHE_DATE_KEY);

            if (cachedUrl && cachedDate === today) {
                // 今日缓存 URL 直接可用
                return applyWallpaper(cachedUrl, 'bing').then(function () {
                    downloadBingBlob(cachedUrl).then(function (blob) {
                        return idbPut(BING_BLOB_KEY, blob).then(function () {
                            return idbPut(BING_DATE_KEY, today);
                        }).then(function () {
                            var blobUrl = URL.createObjectURL(blob);
                            setWallpaperStyle(blobUrl);
                        });
                    }).catch(function () { });
                });
            }

            // 过期缓存占位（仅在无缩略图时）
            if (cachedUrl && !document.getElementById('__pt3_wp')) {
                setWallpaperStyle(cachedUrl);
            }

            // 获取新 URL
            return fetchBingUrl().then(function (newUrl) {
                localStorage.setItem(CACHE_URL_KEY, newUrl);
                localStorage.setItem(CACHE_DATE_KEY, today);
                return applyWallpaper(newUrl, 'bing').then(function () {
                    downloadBingBlob(newUrl).then(function (blob) {
                        return idbPut(BING_BLOB_KEY, blob).then(function () {
                            return idbPut(BING_DATE_KEY, today);
                        }).then(function () {
                            var blobUrl = URL.createObjectURL(blob);
                            setWallpaperStyle(blobUrl);
                        });
                    }).catch(function () { });
                });
            }).catch(function () {
                if (!document.getElementById('__pt3_wp')) {
                    setWallpaperStyle(BING_PRIMARY(bingMkt(currentLang)));
                }
            });
        });
    }

    // ========== 本地壁纸 ==========
    function setLocalWallpaper(file) {
        // 从 File 对象直接生成缩略图，比 blob URL 路径更快
        var reader = new FileReader();
        reader.onload = function () {
            var img = new Image();
            img.onload = function () {
                var canvas = document.createElement('canvas');
                var MAX_W = 640;
                var scale = MAX_W / img.width;
                canvas.width = MAX_W;
                canvas.height = Math.floor(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                try {
                    localStorage.setItem(THUMB_KEY, canvas.toDataURL('image/jpeg', 0.55));
                } catch (e) { }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);

        // 显示并保存
        var blobUrl = URL.createObjectURL(file);
        applyWallpaper(blobUrl, 'local');
        idbPut(LOCAL_BLOB_KEY, file).catch(function () { });
        if (file.type) idbPut(LOCAL_MIME_KEY, file.type).catch(function () { });
        localStorage.setItem(SOURCE_KEY, 'local');
        closeSettings();
    }

    function resetToBing() {
        Promise.all([idbDelete(LOCAL_BLOB_KEY), idbDelete(LOCAL_MIME_KEY)]).then(function () {
            if (localBlobUrl) { URL.revokeObjectURL(localBlobUrl); localBlobUrl = null; }
            localStorage.removeItem(THUMB_KEY);
            localStorage.setItem(SOURCE_KEY, 'bing');
            closeSettings();
            loadWallpaper();
        });
    }

    // ========== 面板管理 ==========
    function openSettings() {
        if (langOpen) closeLangPanel();
        if (panelOpen) return;
        panelOpen = true;
        settingsPanel.classList.add('active');
        settingsBtn.classList.add('panel-open');
        clearTimeout(hideTimeout);
    }

    function closeSettings() {
        if (!panelOpen) return;
        panelOpen = false;
        settingsPanel.classList.remove('active');
        settingsBtn.classList.remove('panel-open');
    }

    function openLangPanel() {
        if (panelOpen) closeSettings();
        if (langOpen) return;
        langOpen = true;
        langPanel.classList.add('active');
        clearTimeout(hideTimeout);
    }

    function closeLangPanel() {
        if (!langOpen) return;
        langOpen = false;
        langPanel.classList.remove('active');
    }

    function closeAll() { closeSettings(); closeLangPanel(); }

    // ========== UI 辅助 ==========
    function showCorners() {
        settingsBtn.classList.add('visible');
        langBtn.classList.add('visible');
    }

    function hideCorners() {
        if (panelOpen || langOpen) return;
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(function () {
            if (!mouseNearCorner && !panelOpen && !langOpen) {
                settingsBtn.classList.remove('visible');
                langBtn.classList.remove('visible');
            }
        }, 400);
    }

    function isNearTopRight(x, y) { return x > window.innerWidth - 180 && y < 130; }
    function isInCenter(x, y) {
        var w = window.innerWidth, h = window.innerHeight;
        return x > w * 0.3 && x < w * 0.7 && y > h * 0.42 && y < h * 0.58;
    }

    function showSearch() {
        if (searchMode === 'never') return;
        if (searchMode === 'always') { searchBar.classList.add('visible'); return; }
        clearTimeout(searchTimeout);
        searchBar.classList.add('visible');
    }

    function hideSearch() {
        if (searchMode === 'always') return;
        if (document.activeElement === searchInput) return;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            if (!mouseOnSearch && document.activeElement !== searchInput) searchBar.classList.remove('visible');
        }, 150);
    }

    function applySearchMode(mode) {
        searchMode = mode;
        searchBar.classList.toggle('visible', mode === 'always');
    }

    function applyOpacity(val) {
        currentOpacity = parseFloat(val);
        document.documentElement.style.setProperty('--icon-opacity', currentOpacity);
        opacityRange.value = currentOpacity;
        opacityNum.value = currentOpacity;
    }

    function applyEngine(engine) {
        currentEngine = engine;
        engineIndex = ENGINES.indexOf(engine);
        engineIcon.innerHTML = ENGINE_SVG[engine] || ENGINE_SVG.google;
        engineSel.value = engine;
        saveSettings();
    }

    function nextEngine() {
        engineIndex = (engineIndex + 1) % ENGINES.length;
        applyEngine(ENGINES[engineIndex]);
    }

    function doSearch(query) {
        if (!query.trim()) return;
        var urls = { google: 'https://www.google.com/search?q=', bing: 'https://www.bing.com/search?q=', baidu: 'https://www.baidu.com/s?wd=', duckduckgo: 'https://duckduckgo.com/?q=' };
        window.open(urls[currentEngine] + encodeURIComponent(query), '_self');
    }

    function saveSettings() {
        localStorage.setItem(SEARCH_MODE_KEY, searchMode);
        localStorage.setItem(OPACITY_KEY, currentOpacity);
        localStorage.setItem(ENGINE_KEY, currentEngine);
    }

    function loadSettings() {
        var mode = localStorage.getItem(SEARCH_MODE_KEY) || 'always';
        var opacity = parseFloat(localStorage.getItem(OPACITY_KEY)) || 0.45;
        var engine = localStorage.getItem(ENGINE_KEY) || 'google';
        searchModeSel.value = mode;
        applySearchMode(mode);
        applyOpacity(opacity);
        applyEngine(engine);
    }

    // ========== 事件绑定 ==========
    settingsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        panelOpen ? closeSettings() : openSettings();
    });
    settingsBtn.addEventListener('mouseenter', function () { mouseNearCorner = true; showCorners(); });
    settingsBtn.addEventListener('mouseleave', function () { mouseNearCorner = false; if (!panelOpen && !langOpen) hideCorners(); });

    langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        langOpen ? closeLangPanel() : openLangPanel();
    });
    langBtn.addEventListener('mouseenter', function () { mouseNearCorner = true; showCorners(); });
    langBtn.addEventListener('mouseleave', function () { mouseNearCorner = false; if (!panelOpen && !langOpen) hideCorners(); });

    document.addEventListener('mousemove', function (e) {
        if (isNearTopRight(e.clientX, e.clientY)) showCorners();
        else if (!mouseNearCorner && !panelOpen && !langOpen) hideCorners();
        if (isInCenter(e.clientX, e.clientY)) showSearch();
        else hideSearch();
    });

    searchBar.addEventListener('mouseenter', function () { mouseOnSearch = true; clearTimeout(searchTimeout); });
    searchBar.addEventListener('mouseleave', function () { mouseOnSearch = false; hideSearch(); });
    searchInput.addEventListener('focus', function () { searchBar.classList.add('visible'); clearTimeout(searchTimeout); });
    searchInput.addEventListener('blur', function () { hideSearch(); });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closeAll(); hideCorners(); }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'W') { e.preventDefault(); panelOpen ? closeSettings() : openSettings(); }
        if (e.key === 'Enter' && document.activeElement === searchInput) doSearch(searchInput.value);
    });

    document.addEventListener('click', function (e) {
        if (panelOpen && !settingsPanel.contains(e.target) && e.target !== settingsBtn && !settingsBtn.contains(e.target)) closeSettings();
        if (langOpen && !langPanel.contains(e.target) && e.target !== langBtn && !langBtn.contains(e.target)) closeLangPanel();
        hideCorners();
    });

    settingsPanel.addEventListener('mouseenter', function () { clearTimeout(hideTimeout); mouseNearCorner = true; });
    settingsPanel.addEventListener('mouseleave', function () { mouseNearCorner = false; hideTimeout = setTimeout(function () { closeSettings(); hideCorners(); }, 500); });
    settingsPanel.addEventListener('click', function (e) { e.stopPropagation(); });

    langPanel.addEventListener('mouseenter', function () { clearTimeout(hideTimeout); mouseNearCorner = true; });
    langPanel.addEventListener('mouseleave', function () { mouseNearCorner = false; hideTimeout = setTimeout(function () { closeLangPanel(); hideCorners(); }, 500); });
    langPanel.addEventListener('click', function (e) { e.stopPropagation(); });

    uploadBtn.addEventListener('click', function (e) { e.stopPropagation(); fileInput.click(); });
    fileInput.addEventListener('change', function () {
        var file = fileInput.files[0];
        if (!file) return;
        if (!file.type.match(/^image\//)) { alert(t('fileError')); fileInput.value = ''; return; }
        setLocalWallpaper(file);
        fileInput.value = '';
    });
    resetBtn.addEventListener('click', function (e) { e.stopPropagation(); resetToBing(); });
    advToggle.addEventListener('click', function (e) { e.stopPropagation(); advSection.classList.toggle('show'); });
    searchModeSel.addEventListener('change', function () { applySearchMode(searchModeSel.value); saveSettings(); });
    opacityRange.addEventListener('input', function () { applyOpacity(opacityRange.value); saveSettings(); });
    opacityNum.addEventListener('change', function () {
        var val = parseFloat(opacityNum.value);
        if (isNaN(val)) val = 0.45;
        val = Math.min(1, Math.max(0, val));
        applyOpacity(val);
        saveSettings();
    });
    engineSel.addEventListener('change', function () { applyEngine(engineSel.value); });
    resetAdvBtn.addEventListener('click', function () { applySearchMode('always'); searchModeSel.value = 'always'; applyEngine('google'); applyOpacity(0.45); saveSettings(); });
    engineIcon.addEventListener('click', function (e) { e.stopPropagation(); nextEngine(); });

    // ========== 启动 ==========
    function init() {
        currentLang = localStorage.getItem(LANG_KEY) || detectLang();
        if (!I18N[currentLang]) currentLang = 'en';
        loadSettings();
        updateLangUI();
        loadWallpaper();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
