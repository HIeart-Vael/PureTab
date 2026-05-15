(function () {
    'use strict';

    // ================================================================
    // 命名空间别名
    // ================================================================
    var D = window.WallpaperData;
    var S = window.WallpaperShow;
    var F = window.WallpaperFetch;

    // ================================================================
    // 1. 常量
    // ================================================================

    // localStorage key（非壁纸部分）
    var LS_KEY_LANG = 'ptab_lang';
    var LS_KEY_SEARCH_MODE = 'ptab_search_mode';
    var LS_KEY_ICON_OPACITY = 'ptab_icon_opacity';
    var LS_KEY_SEARCH_ENGINE = 'ptab_search_engine';

    var DEFAULT_SEARCH_MODE = 'always';
    var DEFAULT_OPACITY = 0.45;
    var DEFAULT_ENGINE = 'google';

    var log = function (tag, msg) { console.log('[' + tag + '] ' + msg); };
    var warn = function (tag, msg) { console.warn('[' + tag + '] ' + msg); };

    // 导出给其他模块使用
    window.log = log;
    window.warn = warn;

    // ================================================================
    // 2. 运行环境
    // ================================================================

    var IS_EXTENSION = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;

    // ================================================================
    // 3. DOM 元素
    // ================================================================

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
    var cpHotkeyInput = document.getElementById('cpHotkeyInput');
    var cpRecommendCheck = document.getElementById('cpRecommendCheck');

    // ================================================================
    // 4. 状态变量
    // ================================================================

    var currentMode = 'bing';             // 'bing' | 'local'
    var currentLang = 'en';
    var I18N = window.I18N || {};
    var LanguageList = window.LanguageList || [];

    var isMouseInCornerZone = false;
    var isMouseInSearchZone = false;
    var isSettingsPanelOpen = false;
    var isLangPanelOpen = false;
    var cornerHideTimer = null;
    var searchHideTimer = null;

    var searchMode = DEFAULT_SEARCH_MODE;
    var currentOpacity = DEFAULT_OPACITY;

    var currentEngine = DEFAULT_ENGINE;
    var engineIndex = 0;
    var langBtns = null;

    // ================================================================
    // 5. 国际化 (i18n)
    // ================================================================

    function t(key) {
        if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
            var msg = chrome.i18n.getMessage(key);
            if (msg) return msg;
        }
        return (I18N[currentLang] && I18N[currentLang][key]) || (I18N['en'] && I18N['en'][key]) || key;
    }
    window.t = t;

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
        if (currentMode === 'local') refreshLocalGallery();
        else wallpaperInfoEl.textContent = t('wpBing');
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' && el.type === 'text') return;
            el.textContent = t(key);
        });
        searchModeSelect.querySelectorAll('option[data-i18n]').forEach(function (opt) {
            opt.textContent = t(opt.getAttribute('data-i18n'));
        });
        if (window.Palette) {
            var cpSearchInputEl = document.getElementById('cpSearchInput');
            if (cpSearchInputEl) cpSearchInputEl.placeholder = t('cpSearchPlaceholder');
        }
        renderLangPanel();
    }

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

    // ================================================================
    // 6. 壁纸 — 主加载流程（编排层）
    // ================================================================

    function cacheBingInBackground() {
        var today = new Date().toDateString();
        var meta = D.loadBingMeta();
        if (meta.date === today && meta.src) return;
        F.fetchBingUrl(currentLang).then(function (r) {
            return F.cacheBingBlob(r.url, r.api, today).then(function (blob) {
                if (blob && currentMode === 'bing') {
                    S.applyAndSavePreview(URL.createObjectURL(blob));
                }
            });
        }).catch(function () { warn('Bing', 'background: failed, will retry later'); });
    }

    function tryLoadLocalWallpaper(order) {
        if (!order || !order.length) return Promise.resolve(false);

        currentMode = 'local';

        var idx = (parseInt(localStorage.getItem(D.KEYS.LOCAL_INDEX)) || 0) % order.length;
        var id = order[idx];

        return D.idbGet(D.imgKey(id)).then(function (img) {
            if (!img || !img.blob) { warn('Local', 'image ' + id + ' missing, skipping'); return false; }

            var blob = img.blob;
            if ((!blob.type || blob.type === '') && img.mime) {
                try { blob = new Blob([blob], { type: img.mime }); } catch (e) { }
            }

            localStorage.setItem(D.KEYS.LOCAL_INDEX, (idx + 1) % order.length);

            var nextIdx = (idx + 1) % order.length;
            var nextId = order[nextIdx];
            var previewThumbs = D.loadThumbs();
            if (previewThumbs[nextId]) {
                try { localStorage.setItem(D.KEYS.PREVIEW_THUMB, previewThumbs[nextId]); } catch (e) { /* quota */ }
            } else {
                try { localStorage.removeItem(D.KEYS.PREVIEW_THUMB); } catch (e) { }
            }

            log('Local', 'image ' + (idx + 1) + '/' + order.length + (img.name ? '  ·  ' + img.name : ''));

            return S.apply(URL.createObjectURL(blob), 'local').then(function () {
                cacheBingInBackground();
                return true;
            });
        });
    }

    function tryLoadCachedBing(bingBlob, meta, today) {
        if (!bingBlob || meta.date !== today) return Promise.resolve(false);

        log('Bing', 'wallpaper is fresh  ·  date: ' + meta.date + ', nothing to do');
        return S.applyAndSavePreview(URL.createObjectURL(bingBlob)).then(function () { return true; });
    }

    function loadBingFromNetwork(meta, today) {
        currentMode = 'bing';
        wallpaperInfoEl.textContent = t('wpBing');
        log('Bing', meta.date ? 'wallpaper is old (cache: ' + meta.date + ', today: ' + today + '), fetching...' : 'no wallpaper cached, fetching...');

        if (meta.src && meta.date === today) {
            return S.applyAndSavePreview(meta.src).then(function () {
                return F.cacheBingBlob(meta.src, meta.provider || 'primary', today);
            });
        }

        if (meta.src && !wallpaperBackEl.style.backgroundImage) {
            wallpaperBackEl.style.backgroundImage = 'url(' + meta.src + ')';
        }

        return F.fetchBingUrl(currentLang).then(function (r) {
            return S.applyAndSavePreview(r.url).then(function () {
                return F.cacheBingBlob(r.url, r.api, today);
            });
        }).catch(function () {
            if (!wallpaperBackEl.style.backgroundImage && meta.src) {
                wallpaperBackEl.style.backgroundImage = 'url(' + meta.src + ')';
            }
        });
    }

    function loadWallpaper() {
        var lastMode = localStorage.getItem(D.KEYS.MODE) || 'bing';
        var meta = D.loadBingMeta();
        var today = new Date().toDateString();
        var order = D.loadOrder();

        return D.idbGet(D.DB.BING_BLOB).then(function (bingBlob) {
            if (lastMode === 'local') {
                return tryLoadLocalWallpaper(order).then(function (loaded) {
                    if (loaded) return;
                    return tryLoadCachedBing(bingBlob, meta, today).then(function (loaded) {
                        if (!loaded) return loadBingFromNetwork(meta, today);
                    });
                });
            }

            return tryLoadCachedBing(bingBlob, meta, today).then(function (loaded) {
                if (loaded) return;
                return loadBingFromNetwork(meta, today);
            });
        });
    }

    // ================================================================
    // 7. 壁纸 — 本地上传、删除与画廊
    // ================================================================

    function saveLocalImage(file, show) {
        var id = F.generateId();
        var blobUrl = URL.createObjectURL(file);

        if (show) currentMode = 'local';

        var start = show
            ? (localStorage.setItem(D.KEYS.MODE, 'local'), S.apply(blobUrl, 'local').then(function (img) {
                return img ? S.thumbnail(img) : null;
              }))
            : S.thumbnail(blobUrl).then(function (thumb) {
                URL.revokeObjectURL(blobUrl);
                return thumb;
              });

        return start.then(function (thumb) {
            if (!thumb) { warn('Local', 'thumbnail failed for ' + file.name); return false; }

            return D.idbPut(D.imgKey(id), { blob: file, mime: file.type || '', name: file.name || '' }).then(function () {
                var order = D.loadOrder();
                var thumbs = D.loadThumbs();
                order.push(id);
                thumbs[id] = thumb;
                D.saveOrder(order);
                D.saveThumbs(thumbs);

                var meta = D.loadMeta();
                meta[id] = { name: file.name || '', size: file.size || 0 };
                D.saveMeta(meta);

                if (show && order.length) {
                    var curIdx = (parseInt(localStorage.getItem(D.KEYS.LOCAL_INDEX)) || 0) % order.length;
                    var nextId = order[curIdx];
                    if (thumbs[nextId]) {
                        try { localStorage.setItem(D.KEYS.PREVIEW_THUMB, thumbs[nextId]); } catch (e) { /* quota */ }
                    }
                }

                return true;
            });
        }).catch(function (e) { warn('Local', 'save failed: ' + e.message); return false; });
    }

    function deleteLocalImage(id) {
        var order = D.loadOrder();
        if (!order.length) return;

        var newOrder = order.filter(function (oid) { return oid !== id; });
        D.saveOrder(newOrder);

        var thumbs = D.loadThumbs();
        delete thumbs[id];
        D.saveThumbs(thumbs);

        var meta = D.loadMeta();
        delete meta[id];
        D.saveMeta(meta);

        if (newOrder.length === 0) {
            localStorage.removeItem(D.KEYS.LOCAL_INDEX);
            localStorage.removeItem(D.KEYS.PREVIEW_THUMB);
            localStorage.setItem(D.KEYS.MODE, 'bing');
            currentMode = 'bing';
            wallpaperInfoEl.textContent = t('wpBing');
            removeLocalGallery();
            return D.idbDelete(D.imgKey(id)).then(function () { loadWallpaper(); }).catch(function () { });
        }

        return D.idbDelete(D.imgKey(id)).then(function () {
            refreshLocalGallery();
        }).catch(function (e) { warn('Local', 'delete blob failed: ' + (e && e.message)); });
    }

    function resetToBing() {
        var order = D.loadOrder();
        var count = order.length;
        if (count > 1 && !confirm(t('resetConfirm'))) return;

        currentMode = 'bing';
        removeLocalGallery();
        localStorage.removeItem(D.KEYS.BING_THUMB);
        localStorage.removeItem(D.KEYS.PREVIEW_THUMB);
        localStorage.removeItem(D.KEYS.IMG_THUMBS);
        D.clearCaches();
        localStorage.removeItem(D.KEYS.IMG_META);
        localStorage.removeItem(D.KEYS.IMG_ORDER);
        localStorage.removeItem(D.KEYS.LOCAL_INDEX);
        localStorage.setItem(D.KEYS.MODE, 'bing');

        return D.idbDeleteMany(order.map(function (id) { return D.imgKey(id); })).then(function () {
            return loadWallpaper();
        }).then(function () {
            wallpaperInfoEl.textContent = t('wpBing');
            closeSettings();
        }).catch(function () { closeSettings(); });
    }

    // ================================================================
    // 8. UI — 设置面板与语言面板
    // ================================================================

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

    function closeSettings() {
        if (!isSettingsPanelOpen) return;
        isSettingsPanelOpen = false;
        settingsPanel.classList.remove('active');
        settingsBtn.classList.remove('panel-open');
        revokeGalleryUrls();
    }

    function openLangPanel() {
        if (isSettingsPanelOpen) closeSettings();
        if (isLangPanelOpen) return;
        isLangPanelOpen = true;
        langPanel.classList.add('active');
        clearTimeout(cornerHideTimer);
    }

    function closeLangPanel() {
        if (!isLangPanelOpen) return;
        isLangPanelOpen = false;
        langPanel.classList.remove('active');
    }

    function closeAll() { closeSettings(); closeLangPanel(); }

    // ================================================================
    // 9. UI — 本地壁纸画廊
    // ================================================================

    var _galleryBlobUrls = [];

    function revokeGalleryUrls() {
        _galleryBlobUrls.forEach(function (url) { URL.revokeObjectURL(url); });
        _galleryBlobUrls = [];
    }

    function removeLocalGallery() {
        revokeGalleryUrls();
        var gallery = document.getElementById('localGallery');
        if (gallery) gallery.style.display = 'none';
        uploadBtn.style.display = '';
        resetBtn.style.display = '';
    }

    function refreshLocalGallery() {
        if (currentMode !== 'local') return;
        var order = D.loadOrder();
        if (!order.length) return;
        var thumbs = D.loadThumbs();
        var meta = D.loadMeta();

        var allCached = order.every(function (id) { return meta[id] && thumbs[id]; });
        if (allCached) {
            renderLocalGallery(order, order.map(function (id) { return meta[id]; }), thumbs);
            return;
        }

        var reads = order.map(function (id) { return D.idbGet(D.imgKey(id)); });
        Promise.all(reads).then(function (images) {
            if (!isSettingsPanelOpen) return;
            var m = D.loadMeta();
            var changed = false;
            images.forEach(function (img, i) {
                if (img && !m[order[i]]) {
                    m[order[i]] = { name: img.name || '', size: img.size || 0 };
                    changed = true;
                }
            });
            if (changed) D.saveMeta(m);
            renderLocalGallery(order, images, thumbs);
        }).catch(function (err) {
            console.error('PlainTab: IDB read failed in refreshLocalGallery, falling back to localStorage', err);
            if (!isSettingsPanelOpen) return;
            renderLocalGallery(order, order.map(function (id) { return meta[id] || { name: '', size: 0 }; }), thumbs);
        });
    }

    function ensureGalleryContainer() {
        var gallery = document.getElementById('localGallery');
        if (!gallery) {
            gallery = document.createElement('div');
            gallery.id = 'localGallery';
            gallery.className = 'local-gallery';
            wallpaperInfoEl.parentNode.insertBefore(gallery, uploadBtn);
        }
        gallery.replaceChildren();
        gallery.style.display = 'block';
        return gallery;
    }

    function buildGalleryGrid(order, images, thumbs) {
        var grid = document.createElement('div');
        grid.className = 'local-gallery-grid';

        order.forEach(function (id, i) {
            var card = document.createElement('div');
            card.className = 'local-thumb';
            card.setAttribute('data-id', id);
            card.setAttribute('draggable', 'false');

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

    function setupGalleryDrag(grid) {
        var pressTimer = null;
        grid.style.touchAction = 'none';

        function getCard(e) {
            var el = e.target;
            while (el && el !== grid) {
                if (el.classList && el.classList.contains('local-thumb')) return el;
                el = el.parentNode;
            }
            return null;
        }

        function onPointerDown(e) {
            if (e.button !== 0) return;
            var card = getCard(e);
            if (!card || e.target.classList.contains('local-thumb-del')) return;

            var startX = e.clientX, startY = e.clientY;

            pressTimer = setTimeout(function () {
                pressTimer = null;

                try { card.setPointerCapture(e.pointerId); } catch (ex) { }

                var placeholder = document.createElement('div');
                placeholder.className = 'local-thumb drag-placeholder';
                placeholder.style.height = card.offsetHeight + 'px';
                card.parentNode.insertBefore(placeholder, card);

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
                    animating: false
                };

                function onMove(ev) {
                    ev.preventDefault();
                    var now = Date.now();
                    var dt = Math.max(now - dragState.lastTime, 1);
                    var vx = (ev.clientX - dragState.lastX) / dt;
                    dragState.lastX = ev.clientX;
                    dragState.lastTime = now;

                    dragState.card.style.left = (ev.clientX - rect.width / 2) + 'px';
                    dragState.card.style.top = (ev.clientY - rect.height / 2) + 'px';

                    var targetTilt = Math.max(-3, Math.min(3, vx * 8));
                    var prevTilt = parseFloat(dragState.card.dataset.tilt) || 0;
                    var tilt = prevTilt + (targetTilt - prevTilt) * 0.3;
                    dragState.card.dataset.tilt = tilt;
                    var scale = 1.08;
                    dragState.card.style.transform = 'scale(' + scale + ') rotate(' + tilt + 'deg)';

                    var children = Array.prototype.slice.call(grid.children);
                    var phIdx = children.indexOf(dragState.placeholder);
                    for (var i = 0; i < children.length; i++) {
                        if (children[i] === dragState.placeholder) continue;
                        var r = children[i].getBoundingClientRect();
                        if (ev.clientX >= r.left && ev.clientX <= r.right &&
                            ev.clientY >= r.top && ev.clientY <= r.bottom) {
                            var targetIdx = i;
                            if (dragState.animating) break;
                            dragState.animating = true;
                            var cards = Array.prototype.filter.call(grid.children, function (c) {
                                return c !== dragState.placeholder && c !== dragState.card;
                            });
                            var oldPos = {};
                            for (var ci = 0; ci < cards.length; ci++) {
                                var cr = cards[ci].getBoundingClientRect();
                                oldPos[cards[ci].dataset.id] = { left: cr.left, top: cr.top };
                            }
                            if (targetIdx < phIdx) {
                                grid.insertBefore(dragState.placeholder, children[targetIdx]);
                            } else {
                                grid.insertBefore(dragState.placeholder, children[targetIdx + 1] || null);
                            }
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
                            void grid.offsetHeight;
                            for (var ci = 0; ci < cards.length; ci++) {
                                cards[ci].style.transition = 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)';
                                cards[ci].style.transform = '';
                            }
                            setTimeout(function () { dragState.animating = false; }, 260);
                            break;
                        }
                    }
                }

                function onUp() {
                    var phRect = dragState.placeholder.getBoundingClientRect();
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
                        dragState.card.classList.remove('dragging');
                        var s = dragState.card.style;
                        s.position = ''; s.width = ''; s.height = '';
                        s.left = ''; s.top = ''; s.margin = '';
                        s.transition = ''; s.opacity = ''; s.transform = '';
                        s.zIndex = ''; s.pointerEvents = ''; s.boxShadow = '';
                        grid.insertBefore(dragState.card, dragState.placeholder);
                        grid.removeChild(dragState.placeholder);

                        var allCards = grid.querySelectorAll('.local-thumb');
                        for (var ci = 0; ci < allCards.length; ci++) {
                            allCards[ci].style.transition = '';
                            allCards[ci].style.transform = '';
                        }

                        var newOrder = [];
                        Array.prototype.forEach.call(grid.querySelectorAll('.local-thumb[data-id]'), function (c) {
                            newOrder.push(c.dataset.id);
                        });
                        var oldOrder = D.loadOrder();
                        if (newOrder.length === oldOrder.length &&
                            newOrder.some(function (id, i) { return id !== oldOrder[i]; })) {
                            D.saveOrder(newOrder);
                            var idx = parseInt(localStorage.getItem(D.KEYS.LOCAL_INDEX)) || 0;
                            var thumbs = D.loadThumbs();
                            var nextId = newOrder[idx % newOrder.length];
                            if (thumbs[nextId]) {
                                try { localStorage.setItem(D.KEYS.PREVIEW_THUMB, thumbs[nextId]); } catch (ex) { }
                            }
                        }
                    }, 300);

                    document.removeEventListener('pointermove', onMove);
                    document.removeEventListener('pointerup', onUp);
                }

                document.addEventListener('pointermove', onMove);
                document.addEventListener('pointerup', onUp);
            }, 300);

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

    function renderLocalGallery(order, images, thumbs) {
        revokeGalleryUrls();
        var gallery = ensureGalleryContainer();

        wallpaperInfoEl.textContent = t('wpLocal') + ' · ' + order.length + ' ' + t('imageCount');

        var grid = buildGalleryGrid(order, images, thumbs);
        gallery.appendChild(grid);
        setupGalleryDrag(grid);

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

    // ================================================================
    // 10. UI — 角落按钮与搜索栏显隐逻辑
    // ================================================================

    function showCorners() {
        if (settingsBtn.classList.contains('visible')) return;
        settingsBtn.classList.add('visible');
        langBtn.classList.add('visible');
    }

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

    function isNearTopRight(x, y) { return x > window.innerWidth - 180 && y < 130; }

    function isInCenter(x, y) {
        var w = window.innerWidth, h = window.innerHeight;
        return x > w * 0.3 && x < w * 0.7 && y > h * 0.42 && y < h * 0.58;
    }

    function showSearch() {
        if (searchMode === 'never') return;
        if (searchBar.classList.contains('visible')) return;
        if (searchMode === 'always') { searchBar.classList.add('visible'); return; }
        clearTimeout(searchHideTimer);
        searchBar.classList.add('visible');
    }

    function hideSearch() {
        if (searchMode === 'always') return;
        if (document.activeElement === searchInput) return;
        clearTimeout(searchHideTimer);
        searchHideTimer = setTimeout(function () {
            if (!isMouseInSearchZone && document.activeElement !== searchInput) searchBar.classList.remove('visible');
        }, 150);
    }

    // ================================================================
    // 11. UI — 搜索设置控件
    // ================================================================

    function applySearchMode(mode) {
        searchMode = mode;
        searchBar.classList.toggle('visible', mode === 'always');
    }

    function applyOpacity(val) {
        currentOpacity = parseFloat(val);
        document.documentElement.style.setProperty('--icon-opacity', currentOpacity);
        opacityRange.value = currentOpacity;
        opacityNumInput.value = currentOpacity;
    }

    function applyEngine(engine) {
        currentEngine = engine;
        engineIndex = ENGINES.indexOf(engine);
        engineIcon.innerHTML = ENGINE_SVG[engine] || ENGINE_SVG.google;
        engineSelect.value = engine;
        saveSettings();
    }

    function nextEngine() {
        engineIndex = (engineIndex + 1) % ENGINES.length;
        applyEngine(ENGINES[engineIndex]);
    }

    function saveSettings() {
        localStorage.setItem(LS_KEY_SEARCH_MODE, searchMode);
        localStorage.setItem(LS_KEY_ICON_OPACITY, currentOpacity);
        localStorage.setItem(LS_KEY_SEARCH_ENGINE, currentEngine);
    }

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

    // ================================================================
    // 12. 搜索引擎配置
    // ================================================================

    var ENGINES = ['google', 'bing', 'baidu', 'duckduckgo'];

    var ENGINE_SVG = {
        google: '<svg height="1em" viewBox="0 0 24 24" width="1em"><path d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z" fill="#4285F4"/><path d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z" fill="#34A853"/><path d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z" fill="#FBBC05"/><path d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z" fill="#EB4335"/></svg>',
        bing: '<svg height="1em" viewBox="0 0 24 24" width="1em"><defs><radialGradient cx="93.7%" cy="77.8%" r="143.7%" id="b0"><stop offset="0%" stop-color="#00CACC"/><stop offset="100%" stop-color="#048FCE"/></radialGradient><radialGradient cx="13.9%" cy="71.4%" r="149.2%" id="b1"><stop offset="0%" stop-color="#00BBEC"/><stop offset="100%" stop-color="#2756A9"/></radialGradient><linearGradient id="b2" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#00BBEC"/><stop offset="100%" stop-color="#2756A9"/></linearGradient></defs><path d="M11.97 7.57a.92.92 0 00-.805.863c-.013.195-.01.209.43 1.347 1 2.59 1.242 3.214 1.283 3.302.099.213.237.413.41.592.134.138.222.212.37.311.26.176.39.224 1.405.527.989.295 1.529.49 1.994.723.603.302 1.024.644 1.29 1.051.191.292.36.815.434 1.342.029.206.029.661 0 .847a2.491 2.491 0 01-.376 1.026c-.1.151-.065.126.081-.058.415-.52.838-1.408 1.054-2.213a6.728 6.728 0 00.102-3.012 6.626 6.626 0 00-3.291-4.53l-1.322-.698-.254-.133-1.575-.827c-.548-.29-.78-.406-.846-.426a1.376 1.376 0 00-.29-.045l-.093.01z" fill="url(#b0)"/><path d="M13.164 17.24l-.202.125-1.795 1.115-.989.614-.463.288-1.502.941c-.326.2-.704.334-1.09.387-.18.024-.52.024-.7 0a2.807 2.807 0 01-1.318-.538 3.665 3.665 0 01-.543-.545 2.837 2.837 0 01-.506-1.141l-.041-.182c-.008-.008.006.138.032.33.027.199.085.487.147.733.482 1.907 1.85 3.457 3.705 4.195a6.31 6.31 0 001.658.412c.22.025.844.035 1.074.017 1.054-.08 1.972-.393 2.913-.992l.937-.596.384-.244.684-.435.234-.149.009-.005.025-.017.013-.007.172-.11.597-.38c.76-.481.987-.65 1.34-.998.148-.146.37-.394.381-.425l.088-.136a2.49 2.49 0 00.373-1.023 4.181 4.181 0 000-.847 4.336 4.336 0 00-.318-1.137c-.224-.472-.7-.9-1.383-1.245l-.406-.181c-.01 0-.646.392-1.413.87l-1.658 1.031-.439.274z" fill="url(#b1)"/><path d="M4.003 14.946l.004 3.33.042.193c.134.604.366 1.04.77 1.445a2.701 2.701 0 001.955.814c.536 0 1-.135 1.479-.43l.703-.435.556-.346V8.003c0-2.306-.004-3.675-.012-3.782a2.734 2.734 0 00-.797-1.765c-.145-.144-.268-.24-.637-.496L5.762.362C5.406.115 5.38.098 5.271.059a.943.943 0 00-1.254.696C4.003.818 4 1.659 4 6.223v5.394H4l.003 3.329z" fill="url(#b2)"/></svg>',
        duckduckgo: '<svg viewBox="0 0 122.88 122.88"><defs><style>.a{fill:#d53}.b{fill:#fff}.c{fill:#ddd}.d{fill:#fc0}.e{fill:#6b5}.f{fill:#4a4}.g{fill:#148}</style></defs><path class="a" d="M122.88 61.44a61.44 61.44 0 10-61.44 61.44 61.44 61.44 0 0061.44-61.44z"/><path class="b" d="M114.37 61.44a52.92 52.92 0 10-15.5 37.43 52.76 52.76 0 0015.5-37.43zm-13.12-39.8A56.29 56.29 0 1161.44 5.15a56.12 56.12 0 0139.81 16.49z"/><path class="c" d="M43.24 30.15C26.17 34.13 32.43 58 32.43 58l10.81 52.9 4 1.71-4-82.49zm-4-10.24H34.7L41 22.19s-6.26 0-6.26 4C48.36 25.6 54.61 29 54.61 29l-15.36-9.1z"/><path class="b" d="M75.66 115.48S62 93.87 62 79.64c0-26.73 17.63-4 17.63-25S62 28.44 62 28.44c-8.53-10.8-25-8.53-25-8.53l4 2.28s-4 1.13-5.12 2.27 10.81-1.7 15.93 2.85C30.72 29 34.13 46.08 34.13 46.08l11.95 68.27 29.58 1.13z"/><path class="d" d="M75.66 60.87l21.62-5.69C116.62 58 80.78 68.84 78.51 68.27c-17.07-2.85-12 11.37 8.53 6.82s5.12 11.38-13.65 5.12c-26.74-7.39-12.52-20.48 2.27-19.34z"/><path class="e" d="M70 105.81l1.14-1.7c12.52 4.55 13.09 6.25 12.52-5.12s0-11.38-13.09-1.71c0-2.84-7.39-1.71-8.53 0-11.95-5.12-13.09-6.83-12.52 1.14 1.14 16.5.57 13.65 11.95 8l8.53-.57z"/><path class="f" d="M60.87 99.56v6.82c.57 1.14 9.67 1.14 9.67-1.14s-4.55 1.71-7.39.57S62 98.42 62 98.42l-1.14 1.14z"/><path class="g" d="M48.36 43.24c-2.85-3.42-10.24-.57-8.54 4 .57-2.28 4.55-5.69 8.54-4zm18.2 0c.57-3.42 6.26-4 8-.57a8 8 0 00-8 .57zm-18.77 9.1a1.14 1.14 0 110 .57v-.57zm-4.55 2.27a4 4 0 100-.57v.57zm29.58-4a1.14 1.14 0 110 .57v-.57zM69.4 52.91a3.42 3.42 0 100-.57v.57z"/></svg>',
        baidu: '<svg height="1em" viewBox="0 0 24 24" width="1em"><path d="M8.859 11.735c1.017-1.71 4.059-3.083 6.202.286 1.579 2.284 4.284 4.397 4.284 4.397s2.027 1.601.73 4.684c-1.24 2.956-5.64 1.607-6.005 1.49l-.024-.009s-1.746-.568-3.776-.112c-2.026.458-3.773.286-3.773.286l-.045-.001c-.328-.01-2.38-.187-3.001-2.968-.675-3.028 2.365-4.687 2.592-4.968.226-.288 1.802-1.37 2.816-3.085zm.986 1.738v2.032h-1.64s-1.64.138-2.213 2.014c-.2 1.252.177 1.99.242 2.148.067.157.596 1.073 1.927 1.342h3.078v-7.514l-1.394-.022zm3.588 2.191l-1.44.024v3.956s.064.985 1.44 1.344h3.541v-5.3h-1.528v3.979h-1.46s-.466-.068-.553-.447v-3.556zM9.82 16.715v3.06H8.58s-.863-.045-1.126-1.049c-.136-.445.02-.959.088-1.16.063-.203.353-.671.951-.85H9.82zm9.525-9.036c2.086 0 2.646 2.06 2.646 2.742 0 .688.284 3.597-2.309 3.655-2.595.057-2.704-1.77-2.704-3.08 0-1.374.277-3.317 2.367-3.317zM4.24 6.08c1.523-.135 2.645 1.55 2.762 2.513.07.625.393 3.486-1.975 4-2.364.515-3.244-2.249-2.984-3.544 0 0 .28-2.797 2.197-2.969zm8.847-1.483c.14-1.31 1.69-3.316 2.931-3.028 1.236.285 2.367 1.944 2.137 3.37-.224 1.428-1.345 3.313-3.095 3.082-1.748-.226-2.143-1.823-1.973-3.424zM9.425 1c1.307 0 2.364 1.519 2.364 3.398 0 1.879-1.057 3.4-2.364 3.4s-2.367-1.521-2.367-3.4C7.058 2.518 8.118 1 9.425 1z" fill="#2932E1"/></svg>'
    };

    var doSearch = function (query) {
        if (!query.trim()) return;
        var urls = { google: 'https://www.google.com/search?q=', bing: 'https://www.bing.com/search?q=', baidu: 'https://www.baidu.com/s?wd=', duckduckgo: 'https://duckduckgo.com/?q=' };
        window.open(urls[currentEngine] + encodeURIComponent(query), '_self');
    };

    // ================================================================
    // 13. 扩展模式
    // ================================================================

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
        engineIcon.style.opacity = String(DEFAULT_OPACITY);
        engineIcon.style.pointerEvents = 'none';
        engineSelect.closest('.setting-row').style.display = 'none';
    }

    // ================================================================
    // 14. 事件绑定
    // ================================================================

    var _keepGalleryOpen = false;

    function bindEvents() {
        // --- 角落按钮 ---

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

        var _lastMouseX = 0, _lastMouseY = 0, _mouseRafPending = false, _wasInCorner = false, _wasInCenter = false;
        document.addEventListener('mousemove', function (e) {
            _lastMouseX = e.clientX;
            _lastMouseY = e.clientY;
            if (_mouseRafPending) return;
            _mouseRafPending = true;
            requestAnimationFrame(function () {
                _mouseRafPending = false;
                var inCorner = isNearTopRight(_lastMouseX, _lastMouseY);
                if (inCorner && !_wasInCorner) showCorners();
                else if (!inCorner && _wasInCorner && !isMouseInCornerZone && !isSettingsPanelOpen && !isLangPanelOpen) hideCorners();
                _wasInCorner = inCorner;
                var inCenter = isInCenter(_lastMouseX, _lastMouseY);
                if (inCenter && !_wasInCenter) showSearch();
                else if (!inCenter && _wasInCenter) hideSearch();
                _wasInCenter = inCenter;
            });
        });

        // --- 搜索栏 ---

        searchBar.addEventListener('mouseenter', function () { isMouseInSearchZone = true; clearTimeout(searchHideTimer); });
        searchBar.addEventListener('mouseleave', function () { isMouseInSearchZone = false; hideSearch(); });
        searchInput.addEventListener('focus', function () { searchBar.classList.add('visible'); clearTimeout(searchHideTimer); });
        searchInput.addEventListener('blur', function () { hideSearch(); });

        // --- 键盘快捷键 ---

        document.addEventListener('keydown', function (e) {
            if (window.Palette && window.Palette.isOpen) {
                var isFormInput = document.activeElement && document.activeElement.closest('#cpFormName, #cpFormURL');
                if (!(e.key === 'Enter' && isFormInput)) {
                    window.Palette.handleKeyNav(e);
                }
                var cpSearchInputEl = document.getElementById('cpSearchInput');
                if (e.key === 'Enter' && document.activeElement === cpSearchInputEl) { e.preventDefault(); return; }
                if (e.key !== 'Escape') return;
            }
            if (e.key === 'Escape') { closeAll(); hideCorners(); }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && !e.shiftKey) { e.preventDefault(); if (window.Palette) window.Palette.open(); return; }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') { e.preventDefault(); if (window.Palette) window.Palette.openHidden(); return; }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'W') { e.preventDefault(); isSettingsPanelOpen ? closeSettings() : openSettings(); return; }
            if (e.key === 'Enter' && document.activeElement === searchInput) { doSearch(searchInput.value); return; }
        });

        // --- 鼠标快捷方式 ---

        document.addEventListener('dblclick', function (e) {
            if (window.Palette && window.Palette.isOpen) return;
            if (e.target.closest('button, input, select, .settings-panel, .language-panel')) return;
            if (window.Palette) window.Palette.open();
        });

        document.addEventListener('auxclick', function (e) {
            if (e.button !== 1) return;
            if (window.Palette && window.Palette.isOpen) return;
            e.preventDefault();
            if (window.Palette) window.Palette.openHidden();
        });

        // --- 全局点击关闭 ---

        document.addEventListener('click', function (e) {
            if (window.Palette && window.Palette.isOpen && window.Palette.el && !window.Palette.el.contains(e.target)) window.Palette.close();
            if (isSettingsPanelOpen && !settingsPanel.contains(e.target) && e.target !== settingsBtn && !settingsBtn.contains(e.target)) closeSettings();
            if (isLangPanelOpen && !langPanel.contains(e.target) && e.target !== langBtn && !langBtn.contains(e.target)) closeLangPanel();
            if (!(window.Palette && window.Palette.isOpen) && !isSettingsPanelOpen && !isLangPanelOpen && document.activeElement !== searchInput) {
                if (e.target === document.body || e.target === wallpaperBackEl || e.target === wallpaperFrontEl || !e.target.closest('button, input, select, .settings-panel, .language-panel, .cmd-palette-overlay')) {
                    searchInput.focus();
                }
            }
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

            var order = D.loadOrder();
            var slots = Math.max(0, 12 - order.length);
            if (!slots) return;

            var reads = order.map(function (id) { return D.idbGet(D.imgKey(id)); });
            return Promise.all(reads).then(function (existingImages) {
                var known = {};
                existingImages.forEach(function (img) { if (img && img.name) known[img.name] = true; });

                var seen = {};
                var deduped = files.filter(function (f) {
                    if (seen[f.name] || known[f.name]) return false;
                    seen[f.name] = true;
                    return true;
                });

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

        // 命令面板快捷键 & 推荐设置（使用 Palette 暴露的方法）
        if (window.Palette) {
            cpHotkeyInput.value = window.Palette.loadHotkey();
            cpRecommendCheck.checked = window.Palette.loadRecommend();
            cpHotkeyInput.addEventListener('change', function () { window.Palette.saveHotkey(cpHotkeyInput.value || 'ctrl+k'); });
            cpRecommendCheck.addEventListener('change', function () { window.Palette.saveRecommend(cpRecommendCheck.checked); });
        }

        resetAdvancedBtn.addEventListener('click', function () {
            applySearchMode(DEFAULT_SEARCH_MODE);
            searchModeSelect.value = DEFAULT_SEARCH_MODE;
            applyOpacity(DEFAULT_OPACITY);
            if (!IS_EXTENSION) applyEngine(DEFAULT_ENGINE);
            else saveSettings();
            cpHotkeyInput.value = 'ctrl+k';
            if (window.Palette) window.Palette.saveHotkey('ctrl+k');
            cpRecommendCheck.checked = true;
            if (window.Palette) window.Palette.saveRecommend(true);
        });

        engineIcon.addEventListener('click', function (e) { e.stopPropagation(); nextEngine(); });
    }

    // ================================================================
    // 15. 启动引导
    // ================================================================

    function init() {
        D.migrate().catch(function (e) {
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
