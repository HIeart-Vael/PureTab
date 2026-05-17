/**
 * Palette —— 命令面板
 * 快捷链接管理：10 种命令、搜索过滤、列表/图标双视图。
 * 完全独立，不依赖壁纸系统。挂载到 window.Palette。
 */
(function () {
    'use strict';

    function t() { return window.t.apply(window, arguments); }
    function log() { window.log.apply(window, arguments); }
    function warn() { window.warn.apply(window, arguments); }

    // ================================================================
    // 常量
    // ================================================================

    var LS_KEY_SHORTCUT_ICONS = 'ptab_shortcut_icons';

    var CP_COMMANDS_NORMAL = ['add', 'edit', 'delete', 'hide', 'recent', 'import', 'export', 'reset', 'clear', 'help'];
    var CP_COMMANDS_HIDDEN = ['add', 'edit', 'delete', 'unhide', 'recent', 'import', 'export', 'reset', 'clear', 'help'];

    // ================================================================
    // DOM 元素
    // ================================================================

    var cmdOverlay = document.getElementById('cmdOverlay');
    var cmdPalette = document.getElementById('cmdPalette');
    var cpPinnedBar = document.getElementById('cpPinnedBar');
    var cpSearchInput = document.getElementById('cpSearchInput');
    var cpContent = document.getElementById('cpContent');

    // ================================================================
    // 状态变量
    // ================================================================

    var isPaletteOpen = false;
    var isHiddenMode = false;
    var cpSearchTerm = '';
    var cpKeyIndex = 0;
    var cpCurrentPage = 1;
    var cpItemsPerPage = 15;
    var cpViewMode = loadShortcutSettings().viewMode || 'list';
    var cpCurrentMode = 'list';
    var cpEditTarget = null;

    // 内存缓存
    var _shortcutsCache = null;
    var _iconsCache = null;
    var _recentsCache = null;
    var _hiddenCache = null;

    // ================================================================
    // 数据层：读写快捷链接相关 localStorage
    // ================================================================

    function loadShortcuts() {
        if (_shortcutsCache !== null) return _shortcutsCache;
        _shortcutsCache = loadShortcutModel().items || [];
        return _shortcutsCache;
    }
    function saveShortcuts(arr) {
        _shortcutsCache = arr;
        return updateShortcutModel(function (model) { model.items = arr; });
    }
    function loadIcons() {
        if (_iconsCache !== null) return _iconsCache;
        try { _iconsCache = JSON.parse(localStorage.getItem(LS_KEY_SHORTCUT_ICONS) || '{}'); } catch (e) { _iconsCache = {}; }
        return _iconsCache;
    }
    function saveIcons(obj) {
        _iconsCache = obj;
        try { localStorage.setItem(LS_KEY_SHORTCUT_ICONS, JSON.stringify(obj)); return true; } catch (e) { return false; }
    }
    function loadRecents() {
        if (_recentsCache !== null) return _recentsCache;
        _recentsCache = loadShortcutModel().recents || [];
        return _recentsCache;
    }
    function saveRecents(arr) {
        _recentsCache = arr;
        return updateShortcutModel(function (model) { model.recents = arr; });
    }
    function loadHotkey() { return loadShortcutSettings().primaryHotkey || 'ctrl+k'; }
    function saveHotkey(key) { return updateShortcutSettings(function (settings) { settings.primaryHotkey = key; }); }
    function loadRecommend() { return loadShortcutSettings().recommendEnabled !== false; }
    function saveRecommend(bool) { updateShortcutSettings(function (settings) { settings.recommendEnabled = !!bool; }); }
    function loadHidden() {
        if (_hiddenCache !== null) return _hiddenCache;
        _hiddenCache = loadShortcutModel().hidden || [];
        return _hiddenCache;
    }
    function saveHidden(arr) {
        _hiddenCache = arr;
        return updateShortcutModel(function (model) { model.hidden = arr; });
    }
    function loadHiddenHotkey() { return loadShortcutSettings().hiddenHotkey || 'ctrl+shift+k'; }
    function saveHiddenHotkey(key) { return updateShortcutSettings(function (settings) { settings.hiddenHotkey = key; }); }

    function loadShortcutModel() {
        if (window.WallpaperData && window.WallpaperData.loadShortcutsModel) return window.WallpaperData.loadShortcutsModel();
        return { items: [], recents: [], hidden: [], settings: { primaryHotkey: 'ctrl+k', hiddenHotkey: 'ctrl+shift+k', recommendEnabled: true, viewMode: 'list' } };
    }
    function saveShortcutModel(model) {
        if (window.WallpaperData && window.WallpaperData.saveShortcutsModel) return window.WallpaperData.saveShortcutsModel(model);
        return false;
    }
    function updateShortcutModel(mutator) {
        var model = loadShortcutModel();
        mutator(model);
        return saveShortcutModel(model);
    }
    function loadShortcutSettings() {
        return loadShortcutModel().settings || {};
    }
    function updateShortcutSettings(mutator) {
        return updateShortcutModel(function (model) {
            if (!model.settings) model.settings = {};
            mutator(model.settings);
        });
    }

    function recordAccess(id) {
        var shortcuts = loadShortcuts();
        var found = false;
        for (var i = 0; i < shortcuts.length; i++) {
            if (shortcuts[i].id === id) { shortcuts[i].freq = (shortcuts[i].freq || 0) + 1; found = true; break; }
        }
        if (found) saveShortcuts(shortcuts);
        var recents = loadRecents().filter(function (rid) { return rid !== id; });
        recents.unshift(id);
        if (recents.length > 10) recents.pop();
        saveRecents(recents);
    }

    // ================================================================
    // 工具函数
    // ================================================================

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function getFaviconUrl(url) {
        try {
            var host = url.match(/^https?:\/\/([^\/]+)/);
            if (!host) return null;
            return 'https://icons.duckduckgo.com/ip3/' + host[1] + '.ico';
        } catch (e) { return null; }
    }

    function letterColor(letter) {
        var colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#34495e',
            '#c0392b', '#d35400', '#27ae60', '#2980b9', '#8e44ad', '#16a085', '#f39c12', '#2c3e50'];
        var idx = (letter || 'A').toUpperCase().charCodeAt(0) % colors.length;
        return colors[idx];
    }

    function renderIconEl(iconData, name, cls) {
        cls = cls || 'cp-item-icon';
        var el = document.createElement('div');
        el.className = cls;
        if (iconData && iconData.indexOf('LETTER:') !== 0) {
            var img = document.createElement('img');
            img.src = iconData;
            img.onerror = function () {
                var letter = (name || '?')[0].toUpperCase();
                el.style.background = letterColor(letter);
                el.textContent = letter;
                img.remove();
            };
            el.appendChild(img);
        } else {
            var letter = (name || '?')[0].toUpperCase();
            el.style.background = letterColor(letter);
            el.textContent = letter;
        }
        return el;
    }

    function isDDGPlaceholder(img) {
        if (img.naturalWidth !== 48 || img.naturalHeight !== 48) return false;
        try {
            var canvas = document.createElement('canvas');
            canvas.width = 48;
            canvas.height = 48;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var data = ctx.getImageData(0, 0, 48, 48).data;
            var hash = 0;
            for (var i = 0; i < 256; i++) {
                hash = ((hash << 5) - hash) + data[i];
                hash |= 0;
            }
            return hash === -1750283373;
        } catch (e) { return false; }
    }

    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ================================================================
    // 视图渲染
    // ================================================================

    function renderPinnedBar() {
        cpPinnedBar.innerHTML = '';
        var homeBtn = document.createElement('span');
        homeBtn.className = 'cp-pinned-btn cp-home-btn';
        homeBtn.title = '返回主列表';
        homeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 5.5L7 1l5.5 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 4.5V13h3.2V8.5h1.6V13H11V4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        homeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            cpCurrentMode = 'list';
            cpCurrentPage = 1;
            cpKeyIndex = 0;
            cpSearchInput.value = '';
            cpSearchTerm = '';
            renderShortcutList('');
        });
        cpPinnedBar.appendChild(homeBtn);
        var cmds = isHiddenMode ? CP_COMMANDS_HIDDEN : CP_COMMANDS_NORMAL;
        cmds.forEach(function (cmd) {
            var btn = document.createElement('span');
            btn.className = 'cp-pinned-btn';
            btn.textContent = cmd;
            btn.addEventListener('click', function (e) { e.stopPropagation(); handleCommand(cmd); });
            cpPinnedBar.appendChild(btn);
        });
        var toggleBtn = document.createElement('span');
        toggleBtn.className = 'cp-pinned-btn cp-view-toggle';
        toggleBtn.title = '切换视图模式';
        if (cpViewMode === 'icon') {
            toggleBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/><rect x="8" y="0.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/><rect x="0.5" y="8" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/><rect x="8" y="8" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/></svg>';
        } else {
            toggleBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1.5" width="12" height="2.2" rx="1" fill="currentColor" opacity="0.9"/><rect x="1" y="5.9" width="12" height="2.2" rx="1" fill="currentColor" opacity="0.9"/><rect x="1" y="10.3" width="12" height="2.2" rx="1" fill="currentColor" opacity="0.9"/></svg>';
        }
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            cpViewMode = cpViewMode === 'icon' ? 'list' : 'icon';
            updateShortcutSettings(function (settings) { settings.viewMode = cpViewMode; });
            renderPinnedBar();
            if (cpCurrentMode === 'list' || cpCurrentMode === 'feedback') renderShortcutList(cpSearchTerm);
            else if (cpCurrentMode === 'recent') renderRecentList();
            else if (cpCurrentMode === 'deleteGrid') renderGrid('delete', cpCurrentPage);
            else if (cpCurrentMode === 'editGrid') renderGrid('edit', cpCurrentPage);
            else if (cpCurrentMode === 'hideGrid') renderHideGrid(cpCurrentPage);
            else if (cpCurrentMode === 'unhideGrid') renderUnhideGrid(cpCurrentPage);
        });
        cpPinnedBar.appendChild(toggleBtn);
    }

    function handlePinnedWheel(e) {
        e.preventDefault();
        cpPinnedBar.scrollLeft += e.deltaY;
    }

    function renderShortcutList(filter) {
        filter = (filter || '').toLowerCase();
        var hidden = loadHidden();
        var allShortcuts = loadShortcuts();
        var shortcuts;
        if (isHiddenMode) {
            shortcuts = allShortcuts.filter(function (s) { return hidden.indexOf(s.id) !== -1; });
        } else {
            shortcuts = allShortcuts.filter(function (s) { return hidden.indexOf(s.id) === -1; });
        }
        var icons = loadIcons();
        var showRec = !filter && !isHiddenMode && loadRecommend();

        var recommended = [];
        var recommendedIds = {};
        if (showRec) {
            var byFreq = shortcuts.slice().sort(function (a, b) { return (b.freq || 0) - (a.freq || 0); });
            recommended = byFreq.slice(0, 5);
            recommended.forEach(function (s) { recommendedIds[s.id] = true; });
        }

        var rest = shortcuts.filter(function (s) { return !recommendedIds[s.id]; });
        rest.sort(function (a, b) { return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });

        if (filter) {
            var allFiltered = shortcuts.filter(function (s) {
                return s.name.toLowerCase().indexOf(filter) !== -1 || s.url.toLowerCase().indexOf(filter) !== -1;
            });
            recommended = [];
            recommendedIds = {};
            rest = allFiltered;
        }

        var html = '';

        if (cpViewMode === 'icon') {
            if (recommended.length) {
                html += '<div class="cp-section-title">' + t('recommend') + '</div>';
                html += '<div class="cp-grid cp-grid-rec">';
                recommended.forEach(function (s) { html += buildGridIconHTML(s, icons[s.id]); });
                for (var j = recommended.length; j < 5; j++) html += '<div class="cp-grid-item has-label empty"></div>';
                html += '</div>';
            }
            if (rest.length > 0) {
                var iconPageSize = recommended.length ? 10 : 15;
                var totalPages = Math.ceil(rest.length / iconPageSize);
                if (cpCurrentPage > totalPages) cpCurrentPage = totalPages;
                if (cpCurrentPage < 1) cpCurrentPage = 1;
                var page = cpCurrentPage;
                var start = (page - 1) * iconPageSize;
                var pageItems = rest.slice(start, start + iconPageSize);

                if (filter) html += '<div class="cp-section-title">' + t('searchResults') + (totalPages > 1 ? ' (' + page + '/' + totalPages + ')' : '') + '</div>';
                else html += '<div class="cp-section-title">' + t('allShortcuts') + ' (A-Z)' + (totalPages > 1 ? ' ' + page + '/' + totalPages : '') + '</div>';
                html += '<div class="cp-grid">';
                pageItems.forEach(function (s) { html += buildGridIconHTML(s, icons[s.id]); });
                for (var k = pageItems.length; k < iconPageSize; k++) html += '<div class="cp-grid-item has-label empty"></div>';
                html += '</div>';
                if (totalPages > 1) html += renderPaginationHTML(page, totalPages);
            }
            if (rest.length === 0 && !recommended.length) {
                html += '<div class="cp-empty">' + (filter ? t('noResults') : t('noShortcuts')) + '</div>';
            }
        } else {
            if (recommended.length) {
                html += '<div class="cp-section-title">' + t('recommend') + '</div>';
                recommended.forEach(function (s) { html += buildItemHTML(s, icons[s.id]); });
            }
            if (filter) html += '<div class="cp-section-title">' + t('searchResults') + '</div>';
            else if (rest.length > 0) html += '<div class="cp-section-title">' + t('allShortcuts') + ' (A-Z)</div>';
            if (rest.length === 0 && !recommended.length) {
                html += '<div class="cp-empty">' + (filter ? t('noResults') : t('noShortcuts')) + '</div>';
            } else {
                rest.forEach(function (s) { html += buildItemHTML(s, icons[s.id]); });
            }
        }

        cpContent.innerHTML = html;
        applyIconStyles(cpContent);
        applyMarqueeLabels(cpContent);
        cpKeyIndex = 0;
    }

    function buildGridIconHTML(s, iconData) {
        var isLetter = !iconData || iconData.indexOf('LETTER:') === 0;
        var letter = isLetter ? (iconData ? iconData.replace('LETTER:', '') : s.name[0].toUpperCase()) : s.name[0].toUpperCase();
        var inner = !isLetter ? '<img src="' + iconData + '">' : letter;
        return '<div class="cp-grid-item has-label" data-id="' + s.id + '">' +
            '<div class="cp-grid-item-icon-wrap">' +
            '<div class="cp-grid-item-icon" data-letter="' + letter + '" data-letter-color="' + letterColor(letter) + '">' + inner + '</div>' +
            '</div>' +
            '<div class="cp-grid-item-label">' + escapeHTML(s.name) + '</div>' +
            '</div>';
    }

    function buildItemHTML(s, iconData, extraClass) {
        extraClass = extraClass || '';
        var isLetter = !iconData || iconData.indexOf('LETTER:') === 0;
        var letter = isLetter ? (iconData ? iconData.replace('LETTER:', '') : s.name[0].toUpperCase()) : s.name[0].toUpperCase();
        var inner = !isLetter ? '<img src="' + iconData + '">' : letter;
        return '<div class="cp-item' + (extraClass ? ' ' + extraClass : '') + '" data-id="' + s.id + '">' +
            '<div class="cp-item-icon" data-letter="' + letter + '" data-letter-color="' + letterColor(letter) + '">' + inner + '</div>' +
            '<span class="cp-item-name">' + escapeHTML(s.name) + '</span>' +
            '<span class="cp-item-url">' + escapeHTML(s.url.replace(/^https?:\/\//, '')) + '</span>' +
            '</div>';
    }

    function applyIconStyles(container) {
        var icons = container.querySelectorAll('.cp-item-icon, .cp-grid-item-icon, .cp-feedback-icon');
        icons.forEach(function (el) {
            if (!el.querySelector('img, .cp-icon-inner')) {
                var inner = document.createElement('span');
                inner.className = 'cp-icon-inner';
                inner.style.background = el.getAttribute('data-letter-color');
                inner.textContent = el.getAttribute('data-letter');
                el.textContent = '';
                el.appendChild(inner);
            }
        });
        var imgs = container.querySelectorAll('.cp-item-icon img, .cp-grid-item-icon img, .cp-feedback-icon img');
        imgs.forEach(function (img) {
            var fallback = function () {
                var p = img.parentElement;
                img.remove();
                var inner = document.createElement('span');
                inner.className = 'cp-icon-inner';
                inner.style.background = p.getAttribute('data-letter-color');
                inner.textContent = p.getAttribute('data-letter');
                p.appendChild(inner);
            };
            img.addEventListener('error', fallback, { once: true });
            img.addEventListener('load', function () {
                if (isDDGPlaceholder(this)) fallback();
            }, { once: true });
        });
    }

    function applyMarqueeLabels(container) {
        requestAnimationFrame(function () {
            var labels = container.querySelectorAll('.cp-item-name, .cp-grid-item-label');
            labels.forEach(function (el) {
                if (el.scrollWidth > el.clientWidth) {
                    var text = el.textContent;
                    el.innerHTML = '<span>' + text + '</span><span>' + text + '</span>';
                    el.classList.add('marquee');
                }
            });
        });
    }

    function slideInContent(fromLeft) {
        cpContent.style.transition = 'none';
        cpContent.style.transform = 'translateX(' + (fromLeft ? '-24px' : '24px') + ')';
        cpContent.style.opacity = '0';
        cpContent.offsetHeight;
        cpContent.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.28s ease';
        cpContent.style.transform = 'translateX(0)';
        cpContent.style.opacity = '1';
    }

    function renderForm(mode, item) {
        var isEdit = mode === 'edit';
        cpContent.innerHTML = '<div class="cp-form">' +
            '<span class="cp-form-label">' + (isEdit ? t('editShortcut') : t('addShortcut')) + '</span>' +
            '<input class="cp-form-input" id="cpFormName" placeholder="' + t('shortcutName') + '" value="' + (item ? escapeHTML(item.name) : '') + '" autocomplete="off">' +
            '<div class="cp-form-url-row">' +
            '<input class="cp-form-input" id="cpFormURL" placeholder="' + t('shortcutURL') + '" value="' + (item ? escapeHTML(item.url) : '') + '" autocomplete="off">' +
            '<button class="cp-form-fetch-btn" id="cpFormFetchBtn" title="' + t('fetchTitle') + '">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
            '</button>' +
            '</div>' +
            '<div class="cp-form-error" id="cpFormError"></div>' +
            '<button class="cp-form-submit" id="cpFormSubmit">' + (isEdit ? t('save') : t('add')) + '</button>' +
            '</div>';

        document.getElementById('cpFormSubmit').addEventListener('click', function () {
            if (isEdit) handleEditSubmit(item.id);
            else handleAddSubmit();
        });
        document.getElementById('cpFormName').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('cpFormURL').focus();
            }
        });
        document.getElementById('cpFormURL').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (isEdit) handleEditSubmit(item.id);
                else handleAddSubmit();
            }
        });
        document.getElementById('cpFormFetchBtn').addEventListener('click', function () {
            handleFetchTitle();
        });
        setTimeout(function () { document.getElementById('cpFormURL').focus(); }, 50);
    }

    function renderGrid(mode, page) {
        var allShortcuts = loadShortcuts();
        var hidden = loadHidden();
        var shortcuts;
        if (isHiddenMode) {
            shortcuts = allShortcuts.filter(function (s) { return hidden.indexOf(s.id) !== -1; });
        } else {
            shortcuts = allShortcuts.filter(function (s) { return hidden.indexOf(s.id) === -1; });
        }
        var icons = loadIcons();
        var totalPages = 1;
        var items = shortcuts;
        var start = 0;
        var sectionTitle;

        if (cpViewMode === 'icon') {
            totalPages = Math.max(1, Math.ceil(shortcuts.length / cpItemsPerPage));
            if (page > totalPages) page = totalPages;
            if (page < 1) page = 1;
            cpCurrentPage = page;
            start = (page - 1) * cpItemsPerPage;
            items = shortcuts.slice(start, start + cpItemsPerPage);
            sectionTitle = (mode === 'delete' ? t('deleteShortcut') : t('editShortcut')) +
                ' (' + (start + 1) + '-' + Math.min(start + cpItemsPerPage, shortcuts.length) + ' / ' + shortcuts.length + ')';
        } else {
            cpCurrentPage = 1;
            sectionTitle = (mode === 'delete' ? t('deleteShortcut') : t('editShortcut')) +
                ' (' + shortcuts.length + ')';
        }

        var html = '<div class="cp-section-title">' + sectionTitle + '</div>';

        if (cpViewMode === 'icon') {
            html += '<div class="cp-grid">';
            for (var i = 0; i < cpItemsPerPage; i++) {
                if (i < items.length) {
                    var s = items[i];
                    var letter = s.name[0].toUpperCase();
                    var iconData = icons[s.id];
                    var isLetter = !iconData || iconData.indexOf('LETTER:') === 0;
                    var inner = !isLetter ? '<img src="' + iconData + '">' : letter;
                    html += '<div class="cp-grid-item has-label" data-id="' + s.id + '">';
                    html += '<div class="cp-grid-item-icon-wrap">';
                    html += '<div class="cp-grid-item-icon" data-letter="' + letter + '" data-letter-color="' + letterColor(letter) + '">' + inner + '</div>';
                    if (mode === 'delete') html += '<button class="cp-grid-item-del" data-id="' + s.id + '"></button>';
                    html += '</div>';
                    html += '<div class="cp-grid-item-label">' + escapeHTML(s.name) + '</div>';
                    html += '</div>';
                } else {
                    html += '<div class="cp-grid-item has-label empty"></div>';
                }
            }
            html += '</div>';
        } else {
            items.forEach(function (s) {
                var letter = s.name[0].toUpperCase();
                var iconData = icons[s.id];
                var isLetter = !iconData || iconData.indexOf('LETTER:') === 0;
                var inner = !isLetter ? '<img src="' + iconData + '">' : letter;
                html += '<div class="cp-item' + (mode === 'edit' ? '' : '') + '" data-id="' + s.id + '">';
                html += '<div class="cp-item-icon" data-letter="' + letter + '" data-letter-color="' + letterColor(letter) + '">' + inner + '</div>';
                html += '<span class="cp-item-name">' + escapeHTML(s.name) + '</span>';
                html += '<span class="cp-item-url">' + escapeHTML(s.url.replace(/^https?:\/\//, '')) + '</span>';
                if (mode === 'delete') {
                    html += '<button class="cp-item-del" data-id="' + s.id + '"></button>';
                }
                html += '</div>';
            });
        }

        if (cpViewMode === 'icon' && totalPages > 1) {
            html += renderPaginationHTML(cpCurrentPage, totalPages);
        }

        cpContent.innerHTML = html;
        applyIconStyles(cpContent);
        applyMarqueeLabels(cpContent);

        if (mode === 'delete') {
            var dels = cpContent.querySelectorAll('.cp-grid-item-del, .cp-item-del');
            dels.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    handleDeleteClick(btn.dataset.id);
                });
            });
        } else {
            var targets = cpContent.querySelectorAll('.cp-grid-item:not(.empty), .cp-item');
            targets.forEach(function (el) {
                el.addEventListener('click', function (e) {
                    if (e.target.closest('.cp-grid-item-del, .cp-item-del')) return;
                    handleEditClick(el.dataset.id);
                });
            });
        }
    }

    function renderPaginationHTML(current, total) {
        var html = '<div class="cp-pagination">';
        for (var i = 1; i <= total; i++) {
            html += '<div class="cp-pagination-dot' + (i === current ? ' active' : '') + '" data-page="' + i + '"></div>';
        }
        html += '</div>';
        return html;
    }

    function renderFeedback(name, iconData) {
        var letter = name[0].toUpperCase();
        var isLetter = !iconData || iconData.indexOf('LETTER:') === 0;
        var inner = !isLetter ? '<img src="' + iconData + '">' : letter;
        cpContent.innerHTML = '<div class="cp-feedback">' +
            '<div class="cp-feedback-icon" data-letter="' + letter + '" data-letter-color="' + letterColor(letter) + '">' + inner + '</div>' +
            '<span class="cp-feedback-text">' + escapeHTML(name) + ' ' + t('added') + '</span>' +
            '</div>';
        applyIconStyles(cpContent);
    }

    function scheduleFeedbackReturn() {
        setTimeout(function () {
            if (cpCurrentMode !== 'feedback') return;
            cpCurrentMode = 'list';
            renderShortcutList('');
            cpSearchInput.value = '';
            cpSearchTerm = '';
            cpSearchInput.focus();
        }, 2000);
    }

    function showFeedbackWithFavicon(name, favUrl, letterFallback, shortcutId) {
        var letter = name[0].toUpperCase();
        renderFeedback(name, letterFallback);
        scheduleFeedbackReturn();

        var img = new Image();
        img.onload = function () {
            if (isDDGPlaceholder(this)) return;
            var icons = loadIcons();
            icons[shortcutId] = favUrl;
            saveIcons(icons);
            var fbIcon = document.querySelector('.cp-feedback-icon');
            if (fbIcon && cpCurrentMode === 'feedback') {
                fbIcon.innerHTML = '';
                var imgEl = document.createElement('img');
                imgEl.src = favUrl;
                imgEl.addEventListener('error', function () {
                    imgEl.remove();
                    var inner = document.createElement('span');
                    inner.className = 'cp-icon-inner';
                    inner.style.background = letterColor(letter);
                    inner.textContent = letter;
                    fbIcon.appendChild(inner);
                }, { once: true });
                fbIcon.appendChild(imgEl);
            }
        };
        img.onerror = function () { };
        img.src = favUrl;
    }

    function renderHelp() {
        var helpItems = [
            { cmd: '/add', desc: t('helpAdd') },
            { cmd: '/edit', desc: t('helpEdit') },
            { cmd: '/delete', desc: t('helpDelete') },
            { cmd: '/recent', desc: t('helpRecent') },
            { cmd: isHiddenMode ? '/unhide' : '/hide', desc: t(isHiddenMode ? 'helpUnhide' : 'helpHide') },
            { cmd: '/reset', desc: t('helpReset') },
            { cmd: '/import', desc: t('helpImport') },
            { cmd: '/export', desc: t('helpExport') },
            { cmd: '/clear', desc: t('helpClear') }
        ];
        var html = '<div class="cp-section-title">' + t('commands') + '</div><div class="cp-help-list">';
        helpItems.forEach(function (h) {
            html += '<div class="cp-help-item"><span class="cp-help-cmd">' + h.cmd + '</span><span class="cp-help-desc">' + h.desc + '</span></div>';
        });
        html += '</div>';
        cpContent.innerHTML = html;
    }

    function renderRecentList() {
        var allShortcuts = loadShortcuts();
        var hidden = loadHidden();
        var icons = loadIcons();
        var recents = loadRecents();
        var html = '<div class="cp-section-title">' + t('recentShortcuts') + '</div>';
        var items = [];
        recents.forEach(function (rid) {
            var s = allShortcuts.find(function (sc) { return sc.id === rid; });
            if (!s) return;
            var isHiddenItem = hidden.indexOf(s.id) !== -1;
            if (isHiddenMode) { if (isHiddenItem) items.push(s); }
            else { if (!isHiddenItem) items.push(s); }
        });
        if (!items.length) {
            html += '<div class="cp-empty">' + t('noRecentShortcuts') + '</div>';
        } else if (cpViewMode === 'icon') {
            html += '<div class="cp-grid">';
            items.forEach(function (s) { html += buildGridIconHTML(s, icons[s.id]); });
            var rem = items.length % 5;
            if (rem > 0) for (var k = rem; k < 5; k++) html += '<div class="cp-grid-item has-label empty"></div>';
            html += '</div>';
        } else {
            items.forEach(function (s) { html += buildItemHTML(s, icons[s.id]); });
        }
        cpContent.innerHTML = html;
        applyIconStyles(cpContent);
        applyMarqueeLabels(cpContent);
    }

    // ================================================================
    // 交互控制
    // ================================================================

    function showPaletteHint(msg) {
        cpContent.innerHTML = '<div class="cp-hint">' + escapeHTML(msg) + '</div>';
        setTimeout(function () { cpContent.textContent = ''; }, 2000);
    }

    function refreshShortcutSettings() {
        cpViewMode = loadShortcutSettings().viewMode || 'list';
    }

    function openPalette() {
        if (isPaletteOpen && isHiddenMode) {
            showPaletteHint(t('hiddenModeHint'));
            return;
        }
        if (isPaletteOpen) return;
        isPaletteOpen = true;
        isHiddenMode = false;
        refreshShortcutSettings();
        cmdOverlay.classList.add('active');
        cmdPalette.classList.remove('hidden-mode');
        cmdPalette.classList.add('normal-mode');
        renderPinnedBar();
        cpSearchInput.value = '';
        cpSearchTerm = '';
        cpCurrentMode = 'list';
        cpCurrentPage = 1;
        cpKeyIndex = 0;
        renderShortcutList('');
        cpSearchInput.focus();
    }

    function openHiddenPalette() {
        if (isPaletteOpen && !isHiddenMode) {
            showPaletteHint(t('normalModeHint'));
            return;
        }
        if (isPaletteOpen) return;
        isPaletteOpen = true;
        isHiddenMode = true;
        refreshShortcutSettings();
        cmdOverlay.classList.add('active');
        cmdPalette.classList.remove('normal-mode');
        cmdPalette.classList.add('hidden-mode');
        renderPinnedBar();
        cpSearchInput.value = '';
        cpSearchTerm = '';
        cpCurrentMode = 'list';
        cpCurrentPage = 1;
        cpKeyIndex = 0;
        renderShortcutList('');
        cpSearchInput.focus();
    }

    function closePalette() {
        if (!isPaletteOpen) return;
        isPaletteOpen = false;
        isHiddenMode = false;
        cmdOverlay.classList.remove('active');
        cpSearchTerm = '';
        cpKeyIndex = 0;
        cpCurrentPage = 1;
        cpCurrentMode = 'list';
        cpEditTarget = null;
        cmdPalette.classList.remove('normal-mode', 'hidden-mode');
    }

    function handleSearchInput(e) {
        var val = cpSearchInput.value.trim();
        cpSearchTerm = val;

        if (val.indexOf('/') === 0) {
            var parts = val.split(/\s+/);
            var cmd = parts[0].toLowerCase();
            if (cmd === '/') { renderShortcutList(''); return; }
            if (cmd === '/add') { handleCommand('add'); return; }
            if (cmd === '/edit') { handleCommand('edit'); return; }
            if (cmd === '/delete') { handleCommand('delete'); return; }
            if (cmd === '/help') { handleCommand('help'); return; }
            if (cmd === '/recent') { handleCommand('recent'); return; }
            if (cmd === '/hide' && !isHiddenMode) { handleCommand('hide'); return; }
            if (cmd === '/unhide' && isHiddenMode) { handleCommand('unhide'); return; }
            if (cmd === '/import') { handleCommand('import'); return; }
            if (cmd === '/export') { handleCommand('export'); return; }
            if (cmd === '/reset') { handleCommand('reset'); return; }
            if (cmd === '/clear') { handleCommand('clear'); return; }
        }

        cpCurrentMode = 'list';
        cpCurrentPage = 1;
        renderShortcutList(val);
    }

    function handleCommand(cmd) {
        cpSearchInput.value = '';
        cpSearchTerm = '';
        cpCurrentPage = 1;
        cpKeyIndex = 0;

        if (cmd === 'add') {
            cpCurrentMode = 'add';
            renderForm('add', null);
        } else if (cmd === 'edit') {
            cpCurrentMode = 'editGrid';
            renderGrid('edit', 1);
        } else if (cmd === 'delete') {
            cpCurrentMode = 'deleteGrid';
            renderGrid('delete', 1);
        } else if (cmd === 'help') {
            cpCurrentMode = 'help';
            renderHelp();
        } else if (cmd === 'recent') {
            cpCurrentMode = 'recent';
            renderRecentList();
        } else if (cmd === 'hide') {
            cpCurrentMode = 'hideGrid';
            renderHideGrid(1);
        } else if (cmd === 'unhide') {
            cpCurrentMode = 'unhideGrid';
            renderUnhideGrid(1);
        } else if (cmd === 'reset') {
            handleReset();
            cpCurrentMode = 'list';
        } else if (cmd === 'import') {
            handleImport();
        } else if (cmd === 'export') {
            handleExport();
        } else if (cmd === 'clear') {
            cpCurrentMode = 'clear';
            handleClear();
        } else if (cmd.indexOf('sort') === 0) {
            var mode = cmd.split(/\s+/)[1] || 'a-z';
            handleSort(mode);
        }
    }

    function fetchPageTitle(url, callback) {
        try {
            fetch(url, { method: 'GET', mode: 'cors' }).then(function (res) {
                if (!res.ok) { callback(null); return; }
                return res.text();
            }).then(function (html) {
                if (!html) { callback(null); return; }
                var m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
                var title = m ? m[1].trim() : null;
                callback(title);
            }).catch(function () { callback(null); });
        } catch (e) { callback(null); }
    }

    var _fetchPermRequested = false;
    var _fetchPermGranted = false;

    function handleFetchTitle() {
        var urlEl = document.getElementById('cpFormURL');
        var nameEl = document.getElementById('cpFormName');
        var btn = document.getElementById('cpFormFetchBtn');
        var url = (urlEl && urlEl.value || '').trim();
        if (!url) return;
        if (!url.match(/^https?:\/\//)) url = 'https://' + url;

        var isExt = typeof chrome !== 'undefined' && chrome.permissions && !!chrome.runtime && !!chrome.runtime.id;
        var doFetch = function () {
            btn.classList.add('loading');
            btn.disabled = true;
            nameEl.placeholder = t('fetchingTitle');
            fetchPageTitle(url, function (title) {
                btn.classList.remove('loading');
                btn.disabled = false;
                nameEl.placeholder = t('shortcutName');
                if (title) {
                    nameEl.value = title;
                } else {
                    nameEl.value = url.replace(/^https?:\/\//, '').replace(/\/.*/, '');
                }
                nameEl.focus();
            });
        };

        if (!isExt) {
            doFetch();
            return;
        }

        if (_fetchPermGranted) { doFetch(); return; }

        if (!_fetchPermRequested) {
            _fetchPermRequested = true;
            chrome.permissions.request({
                origins: ['https://*/*', 'http://*/*']
            }, function (granted) {
                _fetchPermGranted = granted;
                if (granted) {
                    doFetch();
                } else {
                    nameEl.value = url.replace(/^https?:\/\//, '').replace(/\/.*/, '');
                    nameEl.focus();
                }
            });
        } else {
            nameEl.value = url.replace(/^https?:\/\//, '').replace(/\/.*/, '');
            nameEl.focus();
        }
    }

    function doAddOrEditSubmit(isEdit, editId) {
        var nameEl = document.getElementById('cpFormName');
        var urlEl = document.getElementById('cpFormURL');
        var errorEl = document.getElementById('cpFormError');
        var name = (nameEl && nameEl.value || '').trim();
        var url = (urlEl && urlEl.value || '').trim();

        if (!url) { errorEl.textContent = t('urlRequired'); errorEl.style.display = 'block'; urlEl.classList.add('error'); return; }
        if (!url.match(/^https?:\/\//)) url = 'https://' + url;
        if (!url.match(/^https?:\/\/[^\s\/]+\.[^\s\/]+/)) { errorEl.textContent = t('urlRequired'); errorEl.style.display = 'block'; urlEl.classList.add('error'); return; }

        var shortcuts = loadShortcuts();
        if (shortcuts.some(function (s) { return s.url.toLowerCase() === url.toLowerCase() && (!isEdit || s.id !== editId); })) {
            errorEl.textContent = t('duplicateURL'); errorEl.style.display = 'block'; urlEl.classList.add('error'); return;
        }

        if (!name) name = url.replace(/^https?:\/\//, '').replace(/\/.*/, '');

        if (isEdit) {
            for (var i = 0; i < shortcuts.length; i++) {
                if (shortcuts[i].id === editId) { shortcuts[i].name = name; shortcuts[i].url = url; break; }
            }
            saveShortcuts(shortcuts);
            var editIcons = loadIcons();
            editIcons[editId] = getFaviconUrl(url) || ('LETTER:' + name[0].toUpperCase());
            saveIcons(editIcons);
            cpCurrentMode = 'list';
            cpEditTarget = null;
            renderShortcutList('');
            cpSearchInput.value = '';
            cpSearchTerm = '';
            requestAnimationFrame(function () { cpSearchInput.focus(); });
        } else {
            var id = generateId();
            var now = Date.now();
            shortcuts.push({ id: id, name: name, url: url, freq: 0, added: now });
            saveShortcuts(shortcuts);
            if (isHiddenMode) {
                var h = loadHidden();
                h.push(id);
                saveHidden(h);
            }
            var icons = loadIcons();
            var favUrl = getFaviconUrl(url);
            var letterFallback = 'LETTER:' + name[0].toUpperCase();
            icons[id] = letterFallback;
            saveIcons(icons);

            cpCurrentMode = 'feedback';
            if (favUrl) {
                showFeedbackWithFavicon(name, favUrl, letterFallback, id);
            } else {
                renderFeedback(name, letterFallback);
                scheduleFeedbackReturn();
            }
        }
    }

    function handleAddSubmit() {
        doAddOrEditSubmit(false, null);
    }

    function handleEditClick(id) {
        var shortcuts = loadShortcuts();
        var item = shortcuts.find(function (s) { return s.id === id; });
        if (!item) return;
        cpCurrentMode = 'add';
        cpEditTarget = id;
        renderForm('edit', item);
    }

    function handleEditSubmit(id) {
        doAddOrEditSubmit(true, id);
    }

    function handleDeleteClick(id) {
        var shortcuts = loadShortcuts().filter(function (s) { return s.id !== id; });
        saveShortcuts(shortcuts);
        var icons = loadIcons();
        delete icons[id];
        saveIcons(icons);
        var recents = loadRecents().filter(function (rid) { return rid !== id; });
        saveRecents(recents);
        var hidden = loadHidden().filter(function (h) { return h !== id; });
        saveHidden(hidden);
        renderGrid('delete', cpCurrentPage);
    }

    function handleGridScroll(e) {
        var modeMap = { 'deleteGrid': 'delete', 'editGrid': 'edit', 'hideGrid': 'hide', 'unhideGrid': 'unhide' };
        var mode = modeMap[cpCurrentMode];
        if (!mode) return;
        var allShortcuts = loadShortcuts();
        var hidden = loadHidden();
        var filtered;
        if (cpCurrentMode === 'unhideGrid') {
            filtered = allShortcuts.filter(function (s) { return hidden.indexOf(s.id) !== -1; });
        } else if (cpCurrentMode === 'hideGrid') {
            filtered = allShortcuts.filter(function (s) { return hidden.indexOf(s.id) === -1; });
        } else if (isHiddenMode) {
            filtered = allShortcuts.filter(function (s) { return hidden.indexOf(s.id) !== -1; });
        } else {
            filtered = allShortcuts.filter(function (s) { return hidden.indexOf(s.id) === -1; });
        }
        var totalPages = Math.max(1, Math.ceil(filtered.length / cpItemsPerPage));
        if (e.deltaY > 0 && cpCurrentPage < totalPages) {
            cpCurrentPage++;
            if (cpCurrentMode === 'hideGrid') renderHideGrid(cpCurrentPage);
            else if (cpCurrentMode === 'unhideGrid') renderUnhideGrid(cpCurrentPage);
            else renderGrid(mode, cpCurrentPage);
        } else if (e.deltaY < 0 && cpCurrentPage > 1) {
            cpCurrentPage--;
            if (cpCurrentMode === 'hideGrid') renderHideGrid(cpCurrentPage);
            else if (cpCurrentMode === 'unhideGrid') renderUnhideGrid(cpCurrentPage);
            else renderGrid(mode, cpCurrentPage);
        }
    }

    function handleIconPageScroll(e) {
        var hidden = loadHidden();
        var allShortcuts = loadShortcuts();
        var visible = isHiddenMode
            ? allShortcuts.filter(function (s) { return hidden.indexOf(s.id) !== -1; })
            : allShortcuts.filter(function (s) { return hidden.indexOf(s.id) === -1; });
        if (cpSearchTerm) {
            visible = visible.filter(function (s) {
                return s.name.toLowerCase().indexOf(cpSearchTerm) !== -1 || s.url.toLowerCase().indexOf(cpSearchTerm) !== -1;
            });
        }
        if (!cpSearchTerm && !isHiddenMode && loadRecommend()) {
            var byFreq = visible.slice().sort(function (a, b) { return (b.freq || 0) - (a.freq || 0); });
            var recIds = {};
            byFreq.slice(0, 5).forEach(function (s) { recIds[s.id] = true; });
            visible = visible.filter(function (s) { return !recIds[s.id]; });
        }
        var iconPageSize = (!cpSearchTerm && !isHiddenMode && loadRecommend()) ? 10 : 15;
        var totalPages = Math.ceil(visible.length / iconPageSize);
        if (e.deltaY > 0 && cpCurrentPage < totalPages) {
            e.preventDefault();
            cpCurrentPage++;
            renderShortcutList(cpSearchTerm);
            slideInContent(false);
        } else if (e.deltaY < 0 && cpCurrentPage > 1) {
            e.preventDefault();
            cpCurrentPage--;
            renderShortcutList(cpSearchTerm);
            slideInContent(true);
        }
    }

    function handleSort(mode) {
        var shortcuts = loadShortcuts();
        if (!mode || mode === 'a-z' || mode === 'az') {
            shortcuts.sort(function (a, b) { return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
        } else if (mode === 'z-a' || mode === 'za') {
            shortcuts.sort(function (a, b) { return b.name.toLowerCase().localeCompare(a.name.toLowerCase()); });
        } else if (mode === 'freq') {
            shortcuts.sort(function (a, b) { return (b.freq || 0) - (a.freq || 0); });
        } else if (mode === 'recent') {
            var recents = loadRecents();
            shortcuts.sort(function (a, b) {
                var ai = recents.indexOf(a.id), bi = recents.indexOf(b.id);
                if (ai !== -1 && bi !== -1) return ai - bi;
                if (ai !== -1) return -1;
                if (bi !== -1) return 1;
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            });
        }
        saveShortcuts(shortcuts);
        cpCurrentMode = 'list';
        renderShortcutList('');
        cpSearchInput.value = '';
        cpSearchTerm = '';
    }

    function handleShortcutClick(id) {
        var shortcuts = loadShortcuts();
        var item = shortcuts.find(function (s) { return s.id === id; });
        if (!item) return;
        recordAccess(id);
        window.open(item.url, '_self');
    }

    function handleImport() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html,.htm';
        input.addEventListener('change', function () {
            var file = input.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function () {
                var text = reader.result;
                var links = [];
                var re = /<A\s+[^>]*HREF="([^"]*)"[^>]*>([^<]*)<\/A>/gi;
                var m;
                while ((m = re.exec(text)) !== null) {
                    var linkUrl = m[1];
                    var linkName = m[2].replace(/<[^>]+>/g, '').trim();
                    if (linkUrl && linkName && linkUrl.match(/^https?:\/\//)) links.push({ name: linkName, url: linkUrl });
                }
                if (!links.length) { log('CmdPalette', 'no bookmarks found'); return; }
                var shortcuts = loadShortcuts();
                var existUrls = {};
                shortcuts.forEach(function (s) { existUrls[s.url.toLowerCase()] = true; });
                var added = 0;
                var newIds = [];
                links.forEach(function (l) {
                    if (existUrls[l.url.toLowerCase()]) return;
                    var newId = generateId();
                    shortcuts.push({ id: newId, name: l.name, url: l.url, freq: 0, added: Date.now() });
                    existUrls[l.url.toLowerCase()] = true;
                    newIds.push(newId);
                    added++;
                });
                saveShortcuts(shortcuts);
                if (isHiddenMode && newIds.length) {
                    var h = loadHidden();
                    h = h.concat(newIds);
                    saveHidden(h);
                }
                log('CmdPalette', 'imported ' + added + ' bookmarks (' + (links.length - added) + ' duplicates skipped)');
                cpCurrentMode = 'list';
                renderShortcutList('');
            };
            reader.readAsText(file);
        });
        input.click();
    }

    function handleExport() {
        var shortcuts = loadShortcuts();
        var data = JSON.stringify(shortcuts, null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'plaintab-shortcuts-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleReset() {
        var shortcuts = loadShortcuts();
        shortcuts.forEach(function (s) { s.freq = 0; });
        saveShortcuts(shortcuts);
        renderShortcutList('');
    }

    function renderHideGrid(page) {
        var hidden = loadHidden();
        var shortcuts = loadShortcuts().filter(function (s) { return hidden.indexOf(s.id) === -1; });
        var icons = loadIcons();
        var totalPages, start, items, sectionTitle;

        if (cpViewMode === 'icon') {
            totalPages = Math.max(1, Math.ceil(shortcuts.length / cpItemsPerPage));
            if (page > totalPages) page = totalPages;
            if (page < 1) page = 1;
            cpCurrentPage = page;
            start = (page - 1) * cpItemsPerPage;
            items = shortcuts.slice(start, start + cpItemsPerPage);
            sectionTitle = t('hideShortcutTitle') + ' (' + (start + 1) + '-' + Math.min(start + cpItemsPerPage, shortcuts.length) + ' / ' + shortcuts.length + ')';
        } else {
            totalPages = 1;
            cpCurrentPage = 1;
            items = shortcuts;
            sectionTitle = t('hideShortcutTitle') + ' (' + shortcuts.length + ')';
        }

        var html = '<div class="cp-section-title">' + sectionTitle + '</div>';
        if (cpViewMode === 'icon') {
            html += '<div class="cp-grid">';
            for (var i = 0; i < (cpViewMode === 'icon' ? cpItemsPerPage : items.length); i++) {
                if (i < items.length) {
                    var s = items[i];
                    var letter = s.name[0].toUpperCase();
                    var iconData = icons[s.id];
                    var isLetter = !iconData || iconData.indexOf('LETTER:') === 0;
                    var inner = !isLetter ? '<img src="' + iconData + '">' : letter;
                    html += '<div class="cp-grid-item has-label" data-id="' + s.id + '">';
                    html += '<div class="cp-grid-item-icon-wrap">';
                    html += '<div class="cp-grid-item-icon" data-letter="' + letter + '" data-letter-color="' + letterColor(letter) + '">' + inner + '</div>';
                    html += '<button class="cp-grid-item-del cp-hide-btn" data-id="' + s.id + '"></button>';
                    html += '</div>';
                    html += '<div class="cp-grid-item-label">' + escapeHTML(s.name) + '</div>';
                    html += '</div>';
                } else if (cpViewMode === 'icon') { html += '<div class="cp-grid-item has-label empty"></div>'; }
            }
            html += '</div>';
        } else {
            items.forEach(function (s) {
                var letter = s.name[0].toUpperCase();
                var iconData = icons[s.id];
                var isLetter = !iconData || iconData.indexOf('LETTER:') === 0;
                var inner = !isLetter ? '<img src="' + iconData + '">' : letter;
                html += '<div class="cp-item" data-id="' + s.id + '">';
                html += '<div class="cp-item-icon" data-letter="' + letter + '" data-letter-color="' + letterColor(letter) + '">' + inner + '</div>';
                html += '<span class="cp-item-name">' + escapeHTML(s.name) + '</span>';
                html += '<span class="cp-item-url">' + escapeHTML(s.url.replace(/^https?:\/\//, '')) + '</span>';
                html += '<button class="cp-item-del cp-hide-btn" data-id="' + s.id + '"></button>';
                html += '</div>';
            });
        }
        if (cpViewMode === 'icon' && totalPages > 1) html += renderPaginationHTML(cpCurrentPage, totalPages);
        cpContent.innerHTML = html;
        applyIconStyles(cpContent);
        applyMarqueeLabels(cpContent);
        var btns = cpContent.querySelectorAll('.cp-hide-btn');
        btns.forEach(function (btn) {
            btn.addEventListener('click', function () { hideShortcut(btn.dataset.id); });
        });
    }

    function hideShortcut(id) {
        var hidden = loadHidden();
        if (hidden.indexOf(id) === -1) { hidden.push(id); saveHidden(hidden); }
        renderHideGrid(cpCurrentPage);
    }

    function renderUnhideGrid(page) {
        var shortcuts = loadShortcuts();
        var hidden = loadHidden();
        var icons = loadIcons();
        var hiddenItems = shortcuts.filter(function (s) { return hidden.indexOf(s.id) !== -1; });
        var totalPages, start, items;

        if (cpViewMode === 'icon') {
            totalPages = Math.max(1, Math.ceil(hiddenItems.length / cpItemsPerPage));
            if (page > totalPages) page = totalPages;
            if (page < 1) page = 1;
            cpCurrentPage = page;
            start = (page - 1) * cpItemsPerPage;
            items = hiddenItems.slice(start, start + cpItemsPerPage);
        } else {
            totalPages = 1;
            cpCurrentPage = 1;
            items = hiddenItems;
        }

        var html = '<div class="cp-section-title">' + t('hiddenShortcuts') + ' (' + hiddenItems.length + ')' + '</div>';
        if (!items.length) { html += '<div class="cp-empty">' + t('noHiddenShortcuts') + '</div>'; }
        else if (cpViewMode === 'icon') {
            html += '<div class="cp-grid">';
            for (var i = 0; i < cpItemsPerPage; i++) {
                if (i < items.length) {
                    var s = items[i];
                    var letter = s.name[0].toUpperCase();
                    var iconData = icons[s.id];
                    var isLetter = !iconData || iconData.indexOf('LETTER:') === 0;
                    var inner = !isLetter ? '<img src="' + iconData + '">' : letter;
                    html += '<div class="cp-grid-item has-label" data-id="' + s.id + '">';
                    html += '<div class="cp-grid-item-icon-wrap">';
                    html += '<div class="cp-grid-item-icon" data-letter="' + letter + '" data-letter-color="' + letterColor(letter) + '">' + inner + '</div>';
                    html += '<button class="cp-grid-item-del unhide cp-unhide-btn" data-id="' + s.id + '"></button>';
                    html += '</div>';
                    html += '<div class="cp-grid-item-label">' + escapeHTML(s.name) + '</div>';
                    html += '</div>';
                } else { html += '<div class="cp-grid-item has-label empty"></div>'; }
            }
            html += '</div>';
        } else {
            items.forEach(function (s) {
                var letter = s.name[0].toUpperCase();
                var iconData = icons[s.id];
                var isLetter = !iconData || iconData.indexOf('LETTER:') === 0;
                var inner = !isLetter ? '<img src="' + iconData + '">' : letter;
                html += '<div class="cp-item" data-id="' + s.id + '">';
                html += '<div class="cp-item-icon" data-letter="' + letter + '" data-letter-color="' + letterColor(letter) + '">' + inner + '</div>';
                html += '<span class="cp-item-name">' + escapeHTML(s.name) + '</span>';
                html += '<span class="cp-item-url">' + escapeHTML(s.url.replace(/^https?:\/\//, '')) + '</span>';
                html += '<button class="cp-item-del cp-unhide-btn unhide" data-id="' + s.id + '"></button>';
                html += '</div>';
            });
        }
        if (cpViewMode === 'icon' && totalPages > 1) html += renderPaginationHTML(cpCurrentPage, totalPages);
        cpContent.innerHTML = html;
        applyIconStyles(cpContent);
        applyMarqueeLabels(cpContent);
        var btns = cpContent.querySelectorAll('.cp-unhide-btn');
        btns.forEach(function (btn) {
            btn.addEventListener('click', function () { unhideShortcut(btn.dataset.id); });
        });
    }

    function unhideShortcut(id) {
        var hidden = loadHidden().filter(function (h) { return h !== id; });
        saveHidden(hidden);
        renderUnhideGrid(cpCurrentPage);
    }

    function handleClear() {
        cpContent.innerHTML = '<div class="cp-clear-confirm">' +
            '<p class="cp-clear-text">' + t('clearConfirm') + '</p>' +
            '<button id="cpClearYes" class="cp-clear-btn-yes">' + t('yes') + '</button>' +
            '<button id="cpClearNo" class="cp-clear-btn-no">' + t('no') + '</button>' +
            '</div>';
        document.getElementById('cpClearYes').addEventListener('click', function () {
            saveShortcuts([]);
            saveIcons({});
            saveRecents([]);
            saveHidden([]);
            cpCurrentMode = 'list';
            renderShortcutList('');
            cpSearchInput.value = '';
            cpSearchTerm = '';
            requestAnimationFrame(function () { cpSearchInput.focus(); });
        });
        document.getElementById('cpClearNo').addEventListener('click', function () {
            cpCurrentMode = 'list';
            renderShortcutList('');
            cpSearchInput.value = '';
            cpSearchTerm = '';
            requestAnimationFrame(function () { cpSearchInput.focus(); });
        });
    }

    // ================================================================
    // 键盘导航
    // ================================================================

    function handleKeyNav(e) {
        if (!isPaletteOpen) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            if (cpCurrentMode !== 'list') {
                cpCurrentMode = 'list';
                cpSearchInput.value = '';
                cpSearchTerm = '';
                cpCurrentPage = 1;
                renderShortcutList('');
                requestAnimationFrame(function () { cpSearchInput.focus(); });
                return;
            }
            closePalette();
            return;
        }

        if (cpCurrentMode === 'list' || cpCurrentMode === 'recent' || cpCurrentMode === 'help') {
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            if (cpCurrentMode === 'feedback') return;
            if (cpCurrentMode === 'add') {
                var submitBtn = document.getElementById('cpFormSubmit');
                if (submitBtn && document.activeElement === cpSearchInput) return;
                if (submitBtn) submitBtn.click();
                return;
            }
            if (cpCurrentMode === 'list') {
                var items = cpContent.querySelectorAll('.cp-item');
                if (items.length && cpKeyIndex >= 0 && cpKeyIndex < items.length) {
                    var id = items[cpKeyIndex].dataset.id;
                    if (id) handleShortcutClick(id);
                }
            }
        }

        if (cpCurrentMode === 'editGrid' || cpCurrentMode === 'deleteGrid' || cpCurrentMode === 'hideGrid' || cpCurrentMode === 'unhideGrid') return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            var items = cpContent.querySelectorAll('.cp-item');
            if (items.length) {
                var prevIdx = cpKeyIndex;
                cpKeyIndex = Math.min(cpKeyIndex + 1, items.length - 1);
                highlightItems(prevIdx, cpKeyIndex, items);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            var items = cpContent.querySelectorAll('.cp-item');
            var prevIdx = cpKeyIndex;
            cpKeyIndex = Math.max(cpKeyIndex - 1, 0);
            highlightItems(prevIdx, cpKeyIndex, items);
        }
    }

    function highlightItems(prevIdx, newIdx, items) {
        if (items[prevIdx]) items[prevIdx].classList.remove('key-hover');
        if (items[newIdx]) items[newIdx].classList.add('key-hover');
    }

    // ================================================================
    // 事件绑定（仅 palette 内部事件）
    // ================================================================

    function bindPaletteEvents() {
        cmdOverlay.addEventListener('click', function (e) {
            if (e.target === cmdOverlay) closePalette();
        });

        cpSearchInput.addEventListener('input', function () { handleSearchInput(); });

        cpContent.addEventListener('wheel', function (e) {
            e.stopPropagation();
            if ((cpCurrentMode === 'deleteGrid' || cpCurrentMode === 'editGrid' || cpCurrentMode === 'hideGrid' || cpCurrentMode === 'unhideGrid') && cpViewMode === 'icon') {
                e.preventDefault();
                handleGridScroll(e);
            } else if (cpCurrentMode === 'list' && cpViewMode === 'icon') {
                handleIconPageScroll(e);
            }
        });

        cpContent.addEventListener('click', function (e) {
            e.stopPropagation();
            var canNavigate = cpCurrentMode === 'list' || cpCurrentMode === 'recent';
            if (canNavigate) {
                var item = e.target.closest('.cp-item');
                if (item && item.dataset.id) {
                    handleShortcutClick(item.dataset.id);
                    return;
                }
                var gridItem = e.target.closest('.cp-grid-item:not(.empty)');
                if (gridItem && gridItem.dataset.id) {
                    handleShortcutClick(gridItem.dataset.id);
                    return;
                }
            }
            var dot = e.target.closest('.cp-pagination-dot');
            if (dot && dot.dataset.page) {
                var page = parseInt(dot.dataset.page);
                if (cpCurrentMode === 'hideGrid') renderHideGrid(page);
                else if (cpCurrentMode === 'unhideGrid') renderUnhideGrid(page);
                else if (cpCurrentMode === 'list') { var prev = cpCurrentPage; cpCurrentPage = page; renderShortcutList(cpSearchTerm); slideInContent(page < prev); }
                else { var modeMap = { 'deleteGrid': 'delete', 'editGrid': 'edit' }; var m = modeMap[cpCurrentMode] || 'edit'; renderGrid(m, page); }
            }
        });

        cpPinnedBar.addEventListener('wheel', handlePinnedWheel);
    }

    // 页面加载完成后绑定事件
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindPaletteEvents);
    } else {
        bindPaletteEvents();
    }

    // ================================================================
    // 公开 API
    // ================================================================

    window.Palette = {
        open: openPalette,
        openHidden: openHiddenPalette,
        close: closePalette,
        handleKeyNav: handleKeyNav,

        get isOpen() { return isPaletteOpen; },
        get isHidden() { return isHiddenMode; },
        get el() { return cmdPalette; },

        // Settings panel integration
        loadHotkey: loadHotkey,
        saveHotkey: saveHotkey,
        loadHiddenHotkey: loadHiddenHotkey,
        saveHiddenHotkey: saveHiddenHotkey,
        loadRecommend: loadRecommend,
        saveRecommend: saveRecommend
    };

})();
