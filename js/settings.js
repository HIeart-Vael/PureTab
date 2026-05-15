/**
 * Settings —— 设置面板
 * 管理：一级设置面板、语言面板、本地画廊、高级设置、角落按钮。
 * 挂载到 window.SettingsPanel。
 */
(function () {
    'use strict';

    // ================================================================
    // 依赖
    // ================================================================
    var D = window.WallpaperData;
    var S = window.WallpaperShow;
    var F = window.WallpaperFetch;
    var I18N = window.I18N || {};
    var LanguageList = window.LanguageList || [];

    var log = window.log || function (tag, msg) { console.log('[' + tag + '] ' + msg); };
    var warn = window.warn || function (tag, msg) { console.warn('[' + tag + '] ' + msg); };

    // ================================================================
    // 常量
    // ================================================================
    var LS_KEY_LANG = 'ptab_lang';
    var LS_KEY_SEARCH_MODE = 'ptab_search_mode';
    var LS_KEY_ICON_OPACITY = 'ptab_icon_opacity';
    var LS_KEY_SEARCH_ENGINE = 'ptab_search_engine';

    var DEFAULT_SEARCH_MODE = 'always';
    var DEFAULT_OPACITY = 0.45;
    var DEFAULT_ENGINE = 'google';

    var IS_EXTENSION = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;

    // ================================================================
    // 搜索引擎图标 SVG
    // ================================================================

    var ENGINES = ['google', 'bing', 'baidu', 'duckduckgo'];

    // ================================================================
    // DOM 元素
    // ================================================================
    var settingsBtn, langBtn, settingsPanel, langPanel, langOptions;
    var wallpaperInfoEl, uploadBtn, fileInput, resetBtn;
    var advancedToggleEl, advancedSectionEl;
    var searchModeSelect, opacityRange, opacityNumInput, engineSelect;
    var resetAdvancedBtn, cpHotkeyInput, cpRecommendCheck;
    var searchBar, engineIcon;

    function cacheDom() {
        settingsBtn = document.getElementById('settingsBtn');
        langBtn = document.getElementById('langBtn');
        settingsPanel = document.getElementById('settingsPanel');
        langPanel = document.getElementById('langPanel');
        langOptions = document.getElementById('langOptions');
        wallpaperInfoEl = document.getElementById('wpInfo');
        uploadBtn = document.getElementById('uploadBtn');
        fileInput = document.getElementById('fileInput');
        resetBtn = document.getElementById('resetBtn');
        advancedToggleEl = document.getElementById('advToggle');
        advancedSectionEl = document.getElementById('advSection');
        searchModeSelect = document.getElementById('searchModeSel');
        opacityRange = document.getElementById('opacityRange');
        opacityNumInput = document.getElementById('opacityNum');
        engineSelect = document.getElementById('engineSel');
        resetAdvancedBtn = document.getElementById('resetAdvBtn');
        cpHotkeyInput = document.getElementById('cpHotkeyInput');
        cpRecommendCheck = document.getElementById('cpRecommendCheck');
        searchBar = document.getElementById('searchBar');
        engineIcon = document.getElementById('searchEngineIcon');
    }

    // ================================================================
    // 状态
    // ================================================================
    var currentMode = 'bing';
    var currentLang = 'en';
    var isMouseInCornerZone = false;
    var isOpen = false;
    var isLangPanelOpen = false;
    var cornerHideTimer = null;
    var searchMode = DEFAULT_SEARCH_MODE;
    var currentOpacity = DEFAULT_OPACITY;
    var currentEngine = DEFAULT_ENGINE;
    var engineIndex = 0;
    var langBtns = null;

    // ================================================================
    // i18n
    // ================================================================

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
        var searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.placeholder = t('searchPlaceholder');
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
                        if (window.onLangChange) window.onLangChange(lang.code);
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
    // 设置面板 开/关
    // ================================================================

    function openSettings() {
        if (isLangPanelOpen) closeLangPanel();
        if (isOpen) return;
        isOpen = true;
        settingsPanel.classList.add('active');
        settingsBtn.classList.add('panel-open');
        clearTimeout(cornerHideTimer);
        if (currentMode === 'local') refreshLocalGallery();
        else { uploadBtn.style.display = ''; resetBtn.style.display = ''; }
    }

    function closeSettings() {
        if (!isOpen) return;
        isOpen = false;
        settingsPanel.classList.remove('active');
        settingsBtn.classList.remove('panel-open');
        revokeGalleryUrls();
    }

    function toggleSettings() {
        isOpen ? closeSettings() : openSettings();
    }

    // ================================================================
    // 语言面板 开/关
    // ================================================================

    function openLangPanel() {
        if (isOpen) closeSettings();
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
    // 本地画廊
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
            if (!isOpen) return;
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
            if (!isOpen) return;
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
    // 数据操作：上传 / 删除 / 重置
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
            return D.idbDelete(D.imgKey(id)).then(function () {
                if (window.reloadWallpaper) window.reloadWallpaper();
            }).catch(function () { });
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
            if (window.reloadWallpaper) window.reloadWallpaper();
        }).then(function () {
            wallpaperInfoEl.textContent = t('wpBing');
            closeSettings();
        }).catch(function () { closeSettings(); });
    }

    // ================================================================
    // 角落按钮显隐
    // ================================================================

    function showCorners() {
        if (settingsBtn.classList.contains('visible')) return;
        settingsBtn.classList.add('visible');
        langBtn.classList.add('visible');
    }

    function hideCorners() {
        if (isOpen || isLangPanelOpen) return;
        clearTimeout(cornerHideTimer);
        cornerHideTimer = setTimeout(function () {
            if (!isMouseInCornerZone && !isOpen && !isLangPanelOpen) {
                settingsBtn.classList.remove('visible');
                langBtn.classList.remove('visible');
            }
        }, 400);
    }

    function isNearTopRight(x, y) { return x > window.innerWidth - 180 && y < 130; }

    // ================================================================
    // 搜索设置
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
        var svgMap = window.ENGINE_SVG || {};
        engineIcon.innerHTML = svgMap[engine] || svgMap.google || '';
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
    // 扩展模式
    // ================================================================

    function setupExtensionMode() {
        engineIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><g clip-path="url(#a)"><path d="M14 12.94 10.16 9.1c1.25-1.76 1.1-4.2-.48-5.78a4.49 4.49 0 0 0-6.36 0 4.49 4.49 0 0 0 0 6.36 4.486 4.486 0 0 0 5.78.48L12.94 14 14 12.94ZM4.38 8.62a3 3 0 0 1 0-4.24 3 3 0 0 1 4.24 0 3 3 0 0 1 0 4.24 3 3 0 0 1-4.24 0Z"/></g><defs><clipPath id="a"><path d="M0 0h16v16H0z"/></clipPath></defs></svg>';
        engineIcon.style.opacity = String(DEFAULT_OPACITY);
        engineIcon.style.pointerEvents = 'none';
        engineSelect.closest('.setting-row').style.display = 'none';
    }

    // ================================================================
    // 事件绑定
    // ================================================================

    var _keepGalleryOpen = false;

    function bindEvents() {
        settingsBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleSettings();
        });
        settingsBtn.addEventListener('mouseenter', function () { isMouseInCornerZone = true; showCorners(); });
        settingsBtn.addEventListener('mouseleave', function () { isMouseInCornerZone = false; if (!isOpen && !isLangPanelOpen) hideCorners(); });

        langBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            isLangPanelOpen ? closeLangPanel() : openLangPanel();
        });
        langBtn.addEventListener('mouseenter', function () { isMouseInCornerZone = true; showCorners(); });
        langBtn.addEventListener('mouseleave', function () { isMouseInCornerZone = false; if (!isOpen && !isLangPanelOpen) hideCorners(); });

        settingsPanel.addEventListener('mouseenter', function () { clearTimeout(cornerHideTimer); isMouseInCornerZone = true; });
        settingsPanel.addEventListener('mouseleave', function () { isMouseInCornerZone = false; cornerHideTimer = setTimeout(function () { closeSettings(); hideCorners(); }, 500); });
        settingsPanel.addEventListener('click', function (e) { e.stopPropagation(); });

        langPanel.addEventListener('mouseenter', function () { clearTimeout(cornerHideTimer); isMouseInCornerZone = true; });
        langPanel.addEventListener('mouseleave', function () { isMouseInCornerZone = false; cornerHideTimer = setTimeout(function () { closeLangPanel(); hideCorners(); }, 500); });
        langPanel.addEventListener('click', function (e) { e.stopPropagation(); });

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
    // 初始化
    // ================================================================

    function init() {
        cacheDom();
        bindEvents();
        loadSettings();

        currentLang = localStorage.getItem(LS_KEY_LANG) || detectLang();
        if (!I18N[currentLang]) currentLang = 'en';
        updateLangUI();

        if (IS_EXTENSION) setupExtensionMode();
    }

    // ================================================================
    // 公开 API
    // ================================================================

    window.SettingsPanel = {
        init: init,
        isOpen: function () { return isOpen; },
        isLangPanelOpen: function () { return isLangPanelOpen; },
        open: openSettings,
        close: closeSettings,
        toggle: toggleSettings,
        closeAll: closeAll,
        updateLangUI: updateLangUI,
        getSearchMode: function () { return searchMode; },
        getOpacity: function () { return currentOpacity; },
        getEngine: function () { return currentEngine; },
        getCurrentMode: function () { return currentMode; },
        setCurrentMode: function (m) { currentMode = m; },
        getCurrentLang: function () { return currentLang; },
        setWallpaperInfo: function (text) { wallpaperInfoEl.textContent = text; },
        getEngineIndex: function () { return engineIndex; },
        setEngineIndex: function (i) { engineIndex = i; },
        isNearTopRight: isNearTopRight,
        showCorners: showCorners,
        hideCorners: hideCorners,
        isExtension: IS_EXTENSION,
        refresh: refreshLocalGallery
    };

    // 导出关键函数给全局使用
    window.t = t;

})();
