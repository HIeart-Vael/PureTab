(function () {
    'use strict';

    /* ================================================================
       常量
       ================================================================ */

    var BING_PRIMARY = function (mkt) { return 'https://bing.biturl.top/?resolution=1920x1080&format=json&index=0&mkt=' + mkt; };
    var BING_FALLBACK = function (mkt) { return 'https://bing.kaininx.workers.dev/?resolution=1920x1080&format=json&index=0&mkt=' + mkt; };
    var DB_NAME = 'PlainTab';
    var DB_VERSION = 1;
    var STORE = 'wallpaper';
    var BING_THUMB_KEY = 'bing_thumb';
    var LANG_KEY = 'ptab_lang';
    var MODE_KEY = 'ptab_wallpaper_source';
    var SEARCH_MODE_KEY = 'ptab_search_visibility';
    var OPACITY_KEY = 'ptab_icon_opacity';
    var ENGINE_KEY = 'ptab_search_engine';
    var META_KEY = 'ptab_bing_meta';
    var BING_KEY = 'bing';
    var LOCAL_IMAGES_KEY = 'local_images';
    var LOCAL_INDEX_KEY = 'ptab_local_index';
    var LOCAL_THUMBS_KEY = 'local_thumbs';
    var TRANSITION_MS = 500;
    var THUMB_MAX_W = 640;

    // 日志工具：log 为普通信息，warn 为警告
    var log = function (tag, msg) { console.log('[' + tag + '] ' + msg); };
    var warn = function (tag, msg) { console.warn('[' + tag + '] ' + msg); };

    /* ================================================================
       运行环境
       ================================================================ */

    var IS_EXTENSION = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;

    /* ================================================================
       DOM 元素
       ================================================================ */

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

    /* ================================================================
       状态变量
       ================================================================ */

    var currentMode = 'bing';
    var currentLang = 'en';
    var I18N = window.I18N || {};
    var LanguageList = window.LanguageList || [];

    // UI 交互状态
    var mouseNearCorner = false;
    var mouseOnSearch = false;
    var panelOpen = false;
    var langOpen = false;
    var hideTimeout = null;
    var searchTimeout = null;

    // 搜索设置（持久化）
    var searchMode = 'always';
    var currentOpacity = 0.45;
    var currentEngine = 'google';
    var engineIndex = 0;

    /* ================================================================
       国际化
       ================================================================ */

    // 获取翻译文本，优先 chrome.i18n，其次内置 I18N 表，最后回退到 key 本身
    function t(key) {
        if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
            var msg = chrome.i18n.getMessage(key);
            if (msg) return msg;
        }
        return (I18N[currentLang] && I18N[currentLang][key]) || (I18N['en'] && I18N['en'][key]) || key;
    }

    // 探测浏览器语言，在 I18N 表中找最佳匹配
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

    // 刷新整个页面的 UI 文本
    function updateLangUI() {
        document.title = t('extName');
        searchInput.placeholder = t('searchPlaceholder');
        engineIcon.setAttribute('title', t('engineTitle'));
        langBtn.setAttribute('title', t('langTitle'));
        settingsBtn.setAttribute('title', t('settingsTitle'));
        document.querySelector('.settings-panel h3').textContent = t('panelTitle');
        if (currentMode === 'local') refreshLocalGallery();
        else wpInfo.textContent = t('wpBing');
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

    // 渲染语言选择面板的按钮列表
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

    /* ================================================================
       IndexedDB 存储
       ================================================================ */

    // 获取（或创建并缓存）数据库连接
    var _db;
    function openDB() {
        if (_db) return Promise.resolve(_db);
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function (e) {
                if (!e.target.result.objectStoreNames.contains(STORE)) e.target.result.createObjectStore(STORE);
            };
            req.onsuccess = function (e) {
                _db = e.target.result;
                _db.onclose = function () { _db = null; };
                resolve(_db);
            };
            req.onerror = function (e) { reject(e.target.error); };
        });
    }

    // 写入键值对
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

    // 读取键值
    function idbGet(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE, 'readonly');
                var req = tx.objectStore(STORE).get(key);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    // 删除键值
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

    /* ================================================================
       壁纸 — 双图层核心
       ================================================================ */

    // 将图片预加载到浏览器缓存中
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

    // 展示壁纸：预加载 → front 层淡入 → 稳定到 back 层，零白屏
    function applyWallpaper(url, mode) {
        return preloadImage(url).then(function () {
            front.style.backgroundImage = 'url(' + url + ')';
            return new Promise(function (resolve) {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        front.classList.add('active');
                        setTimeout(function () {
                            back.style.backgroundImage = 'url(' + url + ')';
                            front.classList.remove('active');
                            front.style.backgroundImage = '';
                            resolve();
                        }, TRANSITION_MS + 50);
                    });
                });
            });
        }).then(function () {
            currentMode = mode;
            wpInfo.textContent = mode === 'local' ? t('wpLocal') : t('wpBing');
            return generateThumbnail(url);
        });
    }

    // 生成缩略图存入 localStorage，供 preload.js 同步绘制首帧
    function generateThumbnail(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                var canvas = document.createElement('canvas');
                var scale = THUMB_MAX_W / img.width;
                canvas.width = THUMB_MAX_W;
                canvas.height = Math.floor(img.height * scale);
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                var thumb = 'url(' + canvas.toDataURL('image/jpeg', 0.55) + ')';
                try { localStorage.setItem(BING_THUMB_KEY, thumb); } catch (e) { /* quota 满了 */ }
                resolve(thumb);
            };
            img.onerror = function () { resolve(null); };
            img.src = url;
        });
    }

    // 读取/写入缩略图数组（与 local_images 数组索引对齐）
    function loadThumbs() {
        try { return JSON.parse(localStorage.getItem(LOCAL_THUMBS_KEY) || '[]'); }
        catch (e) { return []; }
    }
    function saveThumbs(thumbs) {
        try { localStorage.setItem(LOCAL_THUMBS_KEY, JSON.stringify(thumbs)); }
        catch (e) { /* quota 满了 */ }
    }

    /* ================================================================
       壁纸 — Bing 获取与缓存
       ================================================================ */

    // 语言代码 → Bing 市场代码
    function bingMkt(lang) {
        var map = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', 'en': 'en-US', 'ja': 'ja-JP', 'ko': 'ko-KR', 'fr': 'fr-FR', 'de': 'de-DE', 'es': 'es-ES', 'it': 'it-IT', 'pt': 'pt-BR', 'ru': 'ru-RU', 'ar': 'ar-SA', 'hi': 'hi-IN', 'tr': 'tr-TR', 'pl': 'pl-PL', 'vi': 'vi-VN' };
        return map[lang] || 'en-US';
    }

    // 获取 Bing JSON API → 返回图像直链，先试主 API，不行再试备用，返回 {url, api}
    function fetchBingUrl() {
        var mkt = bingMkt(currentLang);
        function tryFetch(url, api) {
            return fetch(url).then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            }).then(function (data) {
                if (data && data.url) return { url: data.url, api: api };
                throw new Error('no url in response');
            });
        }
        var primary = BING_PRIMARY(mkt) + '&t=' + Date.now();
        return tryFetch(primary, 'primary').catch(function () {
            var fallback = BING_FALLBACK(mkt) + '&t=' + Date.now();
            return tryFetch(fallback, 'fallback');
        });
    }

    // 以 CORS 方式下载图片 Blob（用于存入 IDB）
    function downloadBingBlob(url) {
        return fetch(url, { mode: 'cors' }).then(function (r) {
            if (!r.ok) throw new Error('fetch failed');
            return r.blob();
        });
    }

    // 读取已缓存的 Bing 元数据
    function loadBingMeta() {
        try {
            var raw = localStorage.getItem(META_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }

    // 写入 Bing 元数据
    function saveBingMeta(meta) {
        try {
            localStorage.setItem(META_KEY, JSON.stringify(meta));
        } catch (e) { /* quota 满了 */ }
    }

    // 下载 Blob 并存入 IDB，同时更新 meta（src 即去重 key）
    // URL 没变时先查 IDB：blob 还在就跳过下载，丢了才回退下载
    function cacheBingBlob(url, provider, today) {
        var meta = loadBingMeta();
        var isNew = meta.src !== url;

        if (!isNew) {
            return idbGet(BING_KEY).then(function (blob) {
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
                return idbPut(BING_KEY, blob).then(function () { return blob; });
            }).catch(function (e) { warn('Bing', 'got the URL but failed to download image, kept last image'); });
        }
    }

    // 后台静默获取最新 Bing 壁纸并缓存（本地壁纸模式下使用）
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
       壁纸 — 主加载流程
       ================================================================ */

    // 主流程：并行读取本地和 Bing 缓存，按优先级决定用哪个源
    function loadWallpaper() {
        var lastMode = localStorage.getItem(MODE_KEY) || 'bing';
        var meta = loadBingMeta();
        var today = new Date().toDateString();

        return Promise.all([
            idbGet(LOCAL_IMAGES_KEY),
            idbGet(BING_KEY)
        ]).then(function (results) {
            var localImages = results[0];
            var bingBlob = results[1];

            // 分支1：本地壁纸优先（支持轮播）
            if (lastMode === 'local' && localImages && localImages.length) {
                var idx = (parseInt(localStorage.getItem(LOCAL_INDEX_KEY)) || 0) % localImages.length;
                var img = localImages[idx];
                var blob = img.blob;
                // IDB 取回的 blob 可能丢失 MIME，用存储时保存的 MIME 修复
                if ((!blob.type || blob.type === '') && img.mime) {
                    try { blob = new Blob([blob], { type: img.mime }); } catch (e) { }
                }
                localStorage.setItem(LOCAL_INDEX_KEY, (idx + 1) % localImages.length);
                log('Local', 'image ' + (idx + 1) + '/' + localImages.length + (img.name ? '  ·  ' + img.name : ''));
                return applyWallpaper(URL.createObjectURL(blob), 'local').then(function (thumb) {
                    // 自愈：长度匹配时补缺失的缩略图，防止稀疏数组覆盖正常数据
                    if (thumb) {
                        var thumbs = loadThumbs();
                        if (thumbs.length === localImages.length && !thumbs[idx]) {
                            thumbs[idx] = thumb;
                            saveThumbs(thumbs);
                        }
                    }
                    cacheBingInBackground();
                });
            }

            // 分支2：Bing blob 缓存是今天的，直接用
            if (bingBlob && meta.date === today) {
                log('Bing', 'wallpaper is fresh  ·  date: ' + meta.date + ', nothing to do');
                return applyWallpaper(URL.createObjectURL(bingBlob), 'bing');
            }

            // 分支3：没有可用缓存，走网络获取
            currentMode = 'bing';
            wpInfo.textContent = t('wpBing');
            log('Bing', meta.date ? 'wallpaper is old (cache: ' + meta.date + ', today: ' + today + '), fetching...' : 'no wallpaper cached, fetching...');

            // 3a：meta 里有今天的 src 但没 blob，先用 src 展示再异步下载 blob
            if (meta.src && meta.date === today) {
                return applyWallpaper(meta.src, 'bing').then(function () {
                    return cacheBingBlob(meta.src, meta.provider || 'primary', today);
                });
            }

            // 旧 URL 临时垫到 back 层，防止白屏（仅当缩略图也不可用时）
            if (meta.src && !back.style.backgroundImage) {
                back.style.backgroundImage = 'url(' + meta.src + ')';
            }

            // 3b：完全无缓存，从头获取 URL → 展示 → 下载 blob
            return fetchBingUrl().then(function (r) {
                return applyWallpaper(r.url, 'bing').then(function () {
                    return cacheBingBlob(r.url, r.api, today);
                });
            }).catch(function () {
                if (!back.style.backgroundImage && meta.src) {
                    back.style.backgroundImage = 'url(' + meta.src + ')';
                }
            });
        });
    }

    /* ================================================================
       壁纸 — 本地上传
       ================================================================ */

    // 生成简易唯一 ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    // 保存单张本地壁纸（show 为 true 时展示并切到本地模式，false 则只存库）
    function saveLocalImage(file, show) {
        var blobUrl = URL.createObjectURL(file);
        var newImage = { id: generateId(), blob: file, mime: file.type || '', name: file.name || '' };

        // 先查重，避免展示了重复图又跳过
        return idbGet(LOCAL_IMAGES_KEY).then(function (images) {
            images = images || [];
            if (images.some(function (img) { return img.name === file.name && img.blob.size === file.size; })) {
                log('Local', 'duplicate skipped: ' + file.name);
                return false;
            }

            var start = show
                ? (localStorage.setItem(MODE_KEY, 'local'), applyWallpaper(blobUrl, 'local'))
                : generateThumbnail(blobUrl);

            return start.then(function (thumb) {
                if (!thumb) { warn('Local', 'thumbnail failed for ' + file.name); return false; }
                // 重新读取以获取最新状态（批量导入时前一张可能已写入）
                return idbGet(LOCAL_IMAGES_KEY).then(function (imgs) {
                    imgs = imgs || [];
                    var thumbs = loadThumbs();
                    imgs.push(newImage);
                    thumbs.push(thumb);
                    return idbPut(LOCAL_IMAGES_KEY, imgs).then(function () { saveThumbs(thumbs); return true; });
                });
            });
        }).catch(function (e) { warn('Local', 'save failed: ' + e.message); return false; });
    }

    // 画廊 "+" 按钮专用：展示并刷新 UI
    function setLocalWallpaper(file, keepOpen) {
        saveLocalImage(file, true).then(function () {
            if (keepOpen) refreshLocalGallery(); else closeSettings();
        }).catch(function () {
            if (!keepOpen) closeSettings();
        });
    }

    // 删除单张本地壁纸
    function deleteLocalImage(id) {
        idbGet(LOCAL_IMAGES_KEY).then(function (images) {
            if (!images) return;
            var delIdx = -1;
            for (var i = 0; i < images.length; i++) {
                if (images[i].id === id) { delIdx = i; break; }
            }
            images = images.filter(function (img) { return img.id !== id; });
            var thumbs = loadThumbs();
            if (delIdx >= 0 && delIdx < thumbs.length) thumbs.splice(delIdx, 1);

            if (images.length === 0) {
                return idbDelete(LOCAL_IMAGES_KEY).then(function () {
                    saveThumbs([]);
                    localStorage.removeItem(LOCAL_INDEX_KEY);
                    localStorage.setItem(MODE_KEY, 'bing');
                    currentMode = 'bing';
                    wpInfo.textContent = t('wpBing');
                    removeLocalGallery();
                    loadWallpaper();
                });
            }
            return idbPut(LOCAL_IMAGES_KEY, images).then(function () {
                saveThumbs(thumbs);
                refreshLocalGallery();
            });
        }).catch(function () { });
    }

    // 重置为 Bing 每日壁纸
    function resetToBing() {
        idbGet(LOCAL_IMAGES_KEY).then(function (images) {
            var count = (images && images.length) || 0;
            if (count > 1 && !confirm(t('resetConfirm'))) return;

            currentMode = 'bing';
            removeLocalGallery();
            localStorage.removeItem(BING_THUMB_KEY);
            localStorage.removeItem(LOCAL_THUMBS_KEY);
            localStorage.removeItem(LOCAL_INDEX_KEY);
            localStorage.setItem(MODE_KEY, 'bing');

            return idbDelete(LOCAL_IMAGES_KEY).then(function () {
                return loadWallpaper();
            }).then(function () {
                wpInfo.textContent = t('wpBing');
                closeSettings();
            });
        }).catch(function () {
            closeSettings();
        });
    }

    /* ================================================================
       UI — 设置面板与语言面板
       ================================================================ */

    // 打开设置面板，互斥关闭语言面板
    function openSettings() {
        if (langOpen) closeLangPanel();
        if (panelOpen) return;
        panelOpen = true;
        settingsPanel.classList.add('active');
        settingsBtn.classList.add('panel-open');
        clearTimeout(hideTimeout);
        // 本地模式下展示画廊
        if (currentMode === 'local') refreshLocalGallery();
        else { uploadBtn.style.display = ''; resetBtn.style.display = ''; }
    }

    // 关闭设置面板
    function closeSettings() {
        if (!panelOpen) return;
        panelOpen = false;
        settingsPanel.classList.remove('active');
        settingsBtn.classList.remove('panel-open');
        revokeGalleryUrls();
    }

    // 打开语言面板，互斥关闭设置面板
    function openLangPanel() {
        if (panelOpen) closeSettings();
        if (langOpen) return;
        langOpen = true;
        langPanel.classList.add('active');
        clearTimeout(hideTimeout);
    }

    // 关闭语言面板
    function closeLangPanel() {
        if (!langOpen) return;
        langOpen = false;
        langPanel.classList.remove('active');
    }

    // 关闭所有面板
    function closeAll() { closeSettings(); closeLangPanel(); }

    // --- 本地壁纸画廊 ---

    var _galleryUrls = [];

    function revokeGalleryUrls() {
        _galleryUrls.forEach(function (url) { URL.revokeObjectURL(url); });
        _galleryUrls = [];
    }

    function removeLocalGallery() {
        revokeGalleryUrls();
        var g = document.getElementById('localGallery');
        if (g) g.style.display = 'none';
        uploadBtn.style.display = '';
        resetBtn.style.display = '';
    }

    function refreshLocalGallery() {
        if (currentMode !== 'local') return;
        idbGet(LOCAL_IMAGES_KEY).then(function (images) {
            if (images && images.length) renderLocalGallery(images, loadThumbs());
        }).catch(function () { });
    }

    function renderLocalGallery(images, thumbs) {
        revokeGalleryUrls();
        var gallery = document.getElementById('localGallery');
        if (!gallery) {
            gallery = document.createElement('div');
            gallery.id = 'localGallery';
            gallery.className = 'local-gallery';
            wpInfo.parentNode.insertBefore(gallery, uploadBtn);
        }

        while (gallery.firstChild) gallery.removeChild(gallery.firstChild);
        gallery.style.display = 'block';

        wpInfo.textContent = t('wpLocal') + ' · ' + images.length + ' ' + t('imageCount');

        var grid = document.createElement('div');
        grid.className = 'local-gallery-grid';

        images.forEach(function (img, i) {
            var card = document.createElement('div');
            card.className = 'local-thumb';
            var bg = thumbs[i];
            if (!bg && img.blob && img.blob.size > 0) {
                var url = URL.createObjectURL(img.blob);
                _galleryUrls.push(url);
                bg = 'url(' + url + ')';
            }
            if (bg) card.style.backgroundImage = bg;

            var del = document.createElement('button');
            del.className = 'local-thumb-del';
            del.title = t('deleteImage') + (img.name ? ': ' + img.name : '');
            del.setAttribute('data-id', img.id);
            del.addEventListener('click', function (e) {
                e.stopPropagation();
                deleteLocalImage(this.dataset.id);
            });
            card.appendChild(del);
            grid.appendChild(card);
        });

        gallery.appendChild(grid);

        if (images.length < 12) {
            var addBtn = document.createElement('button');
            addBtn.className = 'panel-btn primary';
            addBtn.textContent = '+ ' + t('addImage');
            addBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                _uploadKeepOpen = true;
                fileInput.click();
            });
            gallery.appendChild(addBtn);
        }

        // 画廊显示时隐藏原有的上传按钮
        uploadBtn.style.display = 'none';
    }

    /* ================================================================
       UI — 角落按钮与搜索栏显隐
       ================================================================ */

    // 显示右上角设置和语言按钮
    function showCorners() {
        settingsBtn.classList.add('visible');
        langBtn.classList.add('visible');
    }

    // 延迟隐藏角落按钮（面板打开时不隐藏）
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

    // 鼠标是否在右上角触发区域
    function isNearTopRight(x, y) { return x > window.innerWidth - 180 && y < 130; }

    // 鼠标是否在屏幕中央区域（用于触发搜索栏）
    function isInCenter(x, y) {
        var w = window.innerWidth, h = window.innerHeight;
        return x > w * 0.3 && x < w * 0.7 && y > h * 0.42 && y < h * 0.58;
    }

    // 显示搜索栏（受 searchMode 约束）
    function showSearch() {
        if (searchMode === 'never') return;
        if (searchMode === 'always') { searchBar.classList.add('visible'); return; }
        clearTimeout(searchTimeout);
        searchBar.classList.add('visible');
    }

    // 延迟隐藏搜索栏（输入框聚焦时不隐藏）
    function hideSearch() {
        if (searchMode === 'always') return;
        if (document.activeElement === searchInput) return;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            if (!mouseOnSearch && document.activeElement !== searchInput) searchBar.classList.remove('visible');
        }, 150);
    }

    /* ================================================================
       UI — 搜索设置控件
       ================================================================ */

    // 应用搜索栏显示模式：hover / always / never
    function applySearchMode(mode) {
        searchMode = mode;
        searchBar.classList.toggle('visible', mode === 'always');
    }

    // 应用图标透明度
    function applyOpacity(val) {
        currentOpacity = parseFloat(val);
        document.documentElement.style.setProperty('--icon-opacity', currentOpacity);
        opacityRange.value = currentOpacity;
        opacityNum.value = currentOpacity;
    }

    // 切换搜索引擎
    function applyEngine(engine) {
        currentEngine = engine;
        engineIndex = ENGINES.indexOf(engine);
        engineIcon.innerHTML = ENGINE_SVG[engine] || ENGINE_SVG.google;
        engineSel.value = engine;
        saveSettings();
    }

    // 轮换到下一个搜索引擎
    function nextEngine() {
        engineIndex = (engineIndex + 1) % ENGINES.length;
        applyEngine(ENGINES[engineIndex]);
    }

    // 持久化搜索设置
    function saveSettings() {
        localStorage.setItem(SEARCH_MODE_KEY, searchMode);
        localStorage.setItem(OPACITY_KEY, currentOpacity);
        localStorage.setItem(ENGINE_KEY, currentEngine);
    }

    // 从 localStorage 恢复搜索设置并应用
    function loadSettings() {
        var mode = localStorage.getItem(SEARCH_MODE_KEY) || 'always';
        var opacity = parseFloat(localStorage.getItem(OPACITY_KEY)) || 0.45;
        var engine = localStorage.getItem(ENGINE_KEY) || 'google';
        searchModeSel.value = mode;
        applySearchMode(mode);
        applyOpacity(opacity);
        applyEngine(engine);
    }

    /* ================================================================
       搜索引擎
       ================================================================ */

    var ENGINES = ['google', 'bing', 'baidu', 'duckduckgo'];

    var ENGINE_SVG = {
        google: '<svg height="1em" viewBox="0 0 24 24" width="1em"><path d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z" fill="#4285F4"/><path d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z" fill="#34A853"/><path d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z" fill="#FBBC05"/><path d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z" fill="#EB4335"/></svg>',
        bing: '<svg height="1em" viewBox="0 0 24 24" width="1em"><defs><radialGradient cx="93.7%" cy="77.8%" r="143.7%" id="b0"><stop offset="0%" stop-color="#00CACC"/><stop offset="100%" stop-color="#048FCE"/></radialGradient><radialGradient cx="13.9%" cy="71.4%" r="149.2%" id="b1"><stop offset="0%" stop-color="#00BBEC"/><stop offset="100%" stop-color="#2756A9"/></radialGradient><linearGradient id="b2" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#00BBEC"/><stop offset="100%" stop-color="#2756A9"/></linearGradient></defs><path d="M11.97 7.57a.92.92 0 00-.805.863c-.013.195-.01.209.43 1.347 1 2.59 1.242 3.214 1.283 3.302.099.213.237.413.41.592.134.138.222.212.37.311.26.176.39.224 1.405.527.989.295 1.529.49 1.994.723.603.302 1.024.644 1.29 1.051.191.292.36.815.434 1.342.029.206.029.661 0 .847a2.491 2.491 0 01-.376 1.026c-.1.151-.065.126.081-.058.415-.52.838-1.408 1.054-2.213a6.728 6.728 0 00.102-3.012 6.626 6.626 0 00-3.291-4.53l-1.322-.698-.254-.133-1.575-.827c-.548-.29-.78-.406-.846-.426a1.376 1.376 0 00-.29-.045l-.093.01z" fill="url(#b0)"/><path d="M13.164 17.24l-.202.125-1.795 1.115-.989.614-.463.288-1.502.941c-.326.2-.704.334-1.09.387-.18.024-.52.024-.7 0a2.807 2.807 0 01-1.318-.538 3.665 3.665 0 01-.543-.545 2.837 2.837 0 01-.506-1.141l-.041-.182c-.008-.008.006.138.032.33.027.199.085.487.147.733.482 1.907 1.85 3.457 3.705 4.195a6.31 6.31 0 001.658.412c.22.025.844.035 1.074.017 1.054-.08 1.972-.393 2.913-.992l.937-.596.384-.244.684-.435.234-.149.009-.005.025-.017.013-.007.172-.11.597-.38c.76-.481.987-.65 1.34-.998.148-.146.37-.394.381-.425l.088-.136a2.49 2.49 0 00.373-1.023 4.181 4.181 0 000-.847 4.336 4.336 0 00-.318-1.137c-.224-.472-.7-.9-1.383-1.245l-.406-.181c-.01 0-.646.392-1.413.87l-1.658 1.031-.439.274z" fill="url(#b1)"/><path d="M4.003 14.946l.004 3.33.042.193c.134.604.366 1.04.77 1.445a2.701 2.701 0 001.955.814c.536 0 1-.135 1.479-.43l.703-.435.556-.346V8.003c0-2.306-.004-3.675-.012-3.782a2.734 2.734 0 00-.797-1.765c-.145-.144-.268-.24-.637-.496L5.762.362C5.406.115 5.38.098 5.271.059a.943.943 0 00-1.254.696C4.003.818 4 1.659 4 6.223v5.394H4l.003 3.329z" fill="url(#b2)"/></svg>',
        duckduckgo: '<svg viewBox="0 0 122.88 122.88"><defs><style>.a{fill:#d53}.b{fill:#fff}.c{fill:#ddd}.d{fill:#fc0}.e{fill:#6b5}.f{fill:#4a4}.g{fill:#148}</style></defs><path class="a" d="M122.88 61.44a61.44 61.44 0 10-61.44 61.44 61.44 61.44 0 0061.44-61.44z"/><path class="b" d="M114.37 61.44a52.92 52.92 0 10-15.5 37.43 52.76 52.76 0 0015.5-37.43zm-13.12-39.8A56.29 56.29 0 1161.44 5.15a56.12 56.12 0 0139.81 16.49z"/><path class="c" d="M43.24 30.15C26.17 34.13 32.43 58 32.43 58l10.81 52.9 4 1.71-4-82.49zm-4-10.24H34.7L41 22.19s-6.26 0-6.26 4C48.36 25.6 54.61 29 54.61 29l-15.36-9.1z"/><path class="b" d="M75.66 115.48S62 93.87 62 79.64c0-26.73 17.63-4 17.63-25S62 28.44 62 28.44c-8.53-10.8-25-8.53-25-8.53l4 2.28s-4 1.13-5.12 2.27 10.81-1.7 15.93 2.85C30.72 29 34.13 46.08 34.13 46.08l11.95 68.27 29.58 1.13z"/><path class="d" d="M75.66 60.87l21.62-5.69C116.62 58 80.78 68.84 78.51 68.27c-17.07-2.85-12 11.37 8.53 6.82s5.12 11.38-13.65 5.12c-26.74-7.39-12.52-20.48 2.27-19.34z"/><path class="e" d="M70 105.81l1.14-1.7c12.52 4.55 13.09 6.25 12.52-5.12s0-11.38-13.09-1.71c0-2.84-7.39-1.71-8.53 0-11.95-5.12-13.09-6.83-12.52 1.14 1.14 16.5.57 13.65 11.95 8l8.53-.57z"/><path class="f" d="M60.87 99.56v6.82c.57 1.14 9.67 1.14 9.67-1.14s-4.55 1.71-7.39.57S62 98.42 62 98.42l-1.14 1.14z"/><path class="g" d="M48.36 43.24c-2.85-3.42-10.24-.57-8.54 4 .57-2.28 4.55-5.69 8.54-4zm18.2 0c.57-3.42 6.26-4 8-.57a8 8 0 00-8 .57zm-18.77 9.1a1.14 1.14 0 110 .57v-.57zm-4.55 2.27a4 4 0 100-.57v.57zm29.58-4a1.14 1.14 0 110 .57v-.57zM69.4 52.91a3.42 3.42 0 100-.57v.57z"/></svg>',
        baidu: '<svg height="1em" viewBox="0 0 24 24" width="1em"><path d="M8.859 11.735c1.017-1.71 4.059-3.083 6.202.286 1.579 2.284 4.284 4.397 4.284 4.397s2.027 1.601.73 4.684c-1.24 2.956-5.64 1.607-6.005 1.49l-.024-.009s-1.746-.568-3.776-.112c-2.026.458-3.773.286-3.773.286l-.045-.001c-.328-.01-2.38-.187-3.001-2.968-.675-3.028 2.365-4.687 2.592-4.968.226-.288 1.802-1.37 2.816-3.085zm.986 1.738v2.032h-1.64s-1.64.138-2.213 2.014c-.2 1.252.177 1.99.242 2.148.067.157.596 1.073 1.927 1.342h3.078v-7.514l-1.394-.022zm3.588 2.191l-1.44.024v3.956s.064.985 1.44 1.344h3.541v-5.3h-1.528v3.979h-1.46s-.466-.068-.553-.447v-3.556zM9.82 16.715v3.06H8.58s-.863-.045-1.126-1.049c-.136-.445.02-.959.088-1.16.063-.203.353-.671.951-.85H9.82zm9.525-9.036c2.086 0 2.646 2.06 2.646 2.742 0 .688.284 3.597-2.309 3.655-2.595.057-2.704-1.77-2.704-3.08 0-1.374.277-3.317 2.367-3.317zM4.24 6.08c1.523-.135 2.645 1.55 2.762 2.513.07.625.393 3.486-1.975 4-2.364.515-3.244-2.249-2.984-3.544 0 0 .28-2.797 2.197-2.969zm8.847-1.483c.14-1.31 1.69-3.316 2.931-3.028 1.236.285 2.367 1.944 2.137 3.37-.224 1.428-1.345 3.313-3.095 3.082-1.748-.226-2.143-1.823-1.973-3.424zM9.425 1c1.307 0 2.364 1.519 2.364 3.398 0 1.879-1.057 3.4-2.364 3.4s-2.367-1.521-2.367-3.4C7.058 2.518 8.118 1 9.425 1z" fill="#2932E1"/></svg>'
    };

    // Web 模式搜索行为
    var doSearch = function (query) {
        if (!query.trim()) return;
        var urls = { google: 'https://www.google.com/search?q=', bing: 'https://www.bing.com/search?q=', baidu: 'https://www.baidu.com/s?wd=', duckduckgo: 'https://duckduckgo.com/?q=' };
        window.open(urls[currentEngine] + encodeURIComponent(query), '_self');
    };

    /* ================================================================
       扩展模式 — 覆盖搜索行为
       ================================================================ */

    // 扩展模式：用 chrome.search.query 替代多引擎选择，符合 CWS 单一用途政策
    function setupExtensionMode() {
        doSearch = function (query) {
            if (!query.trim()) return;
            try {
                chrome.search.query({ text: query, disposition: 'CURRENT_TAB' });
            } catch (e) {
                window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_self');
            }
        };
        engineIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><g clip-path="url(#a)"><path d="M14 12.94 10.16 9.1c1.25-1.76 1.1-4.2-.48-5.78a4.49 4.49 0 0 0-6.36 0 4.49 4.49 0 0 0 0 6.36 4.486 4.486 0 0 0 5.78.48L12.94 14 14 12.94ZM4.38 8.62a3 3 0 0 1 0-4.24 3 3 0 0 1 4.24 0 3 3 0 0 1 0 4.24 3 3 0 0 1-4.24 0Z"/></g><defs><clipPath id="a"><path d="M0 0h16v16H0z"/></clipPath></defs></svg>';
        engineIcon.style.opacity = '0.45';
        engineIcon.style.pointerEvents = 'none';
        engineSel.closest('.setting-row').style.display = 'none';
    }

    /* ================================================================
       事件绑定
       ================================================================ */

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

    var _uploadKeepOpen = false;

    uploadBtn.addEventListener('click', function (e) { e.stopPropagation(); _uploadKeepOpen = false; fileInput.click(); });
    fileInput.addEventListener('change', function () {
        var all = Array.from(fileInput.files || []);
        var files = all.filter(function (f) { return f.type && f.type.match(/^image\//); });
        fileInput.value = '';
        if (!files.length) return;

        idbGet(LOCAL_IMAGES_KEY).then(function (images) {
            images = images || [];
            var slots = Math.max(0, 12 - images.length);
            if (!slots) return;

            var saved = 0;
            var p = Promise.resolve();
            files.forEach(function (file) {
                p = p.then(function () {
                    if (saved >= slots) return;
                    var show = saved === 0;
                    return saveLocalImage(file, show).then(function (ok) { if (ok) saved++; });
                });
            });
            return p.then(function () {
                log('Local', 'saved ' + saved + ' of ' + files.length + ' selected (slots: ' + slots + ')');
                if (_uploadKeepOpen) refreshLocalGallery(); else closeSettings();
            });
        }).catch(function (e) {
            warn('Local', 'batch save failed: ' + e.message);
            if (!_uploadKeepOpen) closeSettings();
        });
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

    /* ================================================================
       启动
       ================================================================ */

    // 初始化：确定语言 → 恢复设置 → 刷新 UI → 加载壁纸 → 扩展模式覆盖
    function init() {
        currentLang = localStorage.getItem(LANG_KEY) || detectLang();
        if (!I18N[currentLang]) currentLang = 'en';
        log('PlainTab', 'PlainTab started  ·  ' + (IS_EXTENSION ? 'extension' : 'web') + '  ·  ' + currentLang);
        loadSettings();
        updateLangUI();
        loadWallpaper();
        if (IS_EXTENSION) setupExtensionMode();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();