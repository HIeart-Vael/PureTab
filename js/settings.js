/**
 * Settings — 设置面板系统
 * L1 一级面板（画廊 + 快速信息）+ L2 模态窗口（四页签完整设置）
 * 挂载到 window.SettingsPanel
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
    var LS_KEY_SEARCH_POSITION = 'ptab_search_position';
    var LS_KEY_OVERLAY_OPACITY = 'ptab_overlay_opacity';
    var LS_KEY_SEARCH_RADIUS = 'ptab_search_radius';
    var LS_KEY_PANEL_OPACITY = 'ptab_panel_opacity';
    var LS_KEY_THEME_ENABLED = 'ptab_wp_theme_enabled';
    var LS_KEY_THEME_DATA = 'ptab_wp_theme';

    var DEFAULT_SEARCH_MODE = 'always';
    var DEFAULT_OPACITY = 0.45;
    var DEFAULT_ENGINE = 'google';
    var DEFAULT_SEARCH_POSITION = 'center';
    var DEFAULT_OVERLAY_OPACITY = 0;
    var DEFAULT_PANEL_OPACITY = 0.88;
    var DEFAULT_SEARCH_RADIUS = 'capsule';

    var IS_EXTENSION = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;

    // ================================================================
    // 搜索引擎
    // ================================================================
    var ENGINES = ['google', 'bing', 'baidu', 'duckduckgo'];

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

    // ================================================================
    // DOM 元素
    // ================================================================
    var settingsBtn, langBtn, settingsPanel, langPanel, langOptions;
    var wallpaperInfoEl, uploadBtn, fileInput, resetBtn;
    var searchBar, engineIcon;
    // Modal
    var modalOverlay, modalWindow, modalContent;

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
        searchBar = document.getElementById('searchBar');
        engineIcon = document.getElementById('searchEngineIcon');
        // Modal
        modalOverlay = document.getElementById('modalOverlay');
        modalContent = document.getElementById('modalContent');
        if (modalOverlay) modalWindow = modalOverlay.querySelector('.modal-window');
    }

    // ================================================================
    // 状态
    // ================================================================
    var currentMode = 'bing';
    var currentLang = 'en';
    var isMouseInCornerZone = false;
    var isOpen = false;
    var isLangPanelOpen = false;
    var isModalOpen = false;
    var cornerHideTimer = null;
    var searchMode = DEFAULT_SEARCH_MODE;
    var currentOpacity = DEFAULT_OPACITY;
    var currentEngine = DEFAULT_ENGINE;
    var searchPosition = DEFAULT_SEARCH_POSITION;
    var overlayOpacity = DEFAULT_OVERLAY_OPACITY;
    var searchRadius = DEFAULT_SEARCH_RADIUS;
    var panelOpacity = DEFAULT_PANEL_OPACITY;
    var themeEnabled = false;
    var engineIndex = 0;
    var langBtns = null;
    var activeTab = 'appearance';
    var isRecording = null;

    // ================================================================
    // 语言面板
    // ================================================================
    function updateLangUI() {
        document.title = t('extName');
        var searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.placeholder = t('searchPlaceholder');
        if (engineIcon) engineIcon.setAttribute('title', t('engineTitle'));
        langBtn.setAttribute('title', t('langTitle'));
        settingsBtn.setAttribute('title', t('settingsTitle'));
        if (currentMode === 'local') refreshLocalGallery();
        else wallpaperInfoEl.textContent = t('wpBing');
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' && el.type === 'text') return;
            el.textContent = t(key);
        });
        renderLangPanel();
    }

    function renderLangPanel() {
        var titleEl = document.querySelector('.lang-title');
        if (titleEl) titleEl.textContent = t('langPanelTitle');
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
    // L1 面板 开/关
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

    function closeAll() { closeSettings(); closeLangPanel(); closeModal(); }

    // ================================================================
    // L2 模态窗口 开/关
    // ================================================================
    function openModal() {
        if (isModalOpen) return;
        if (isOpen) closeSettings();
        isModalOpen = true;
        renderTabContent();
        modalOverlay.classList.add('active');
    }

    function closeModal() {
        if (!isModalOpen) return;
        isModalOpen = false;
        modalOverlay.classList.remove('active');
    }

    // ================================================================
    // 模态窗口：分页渲染
    // ================================================================
    // Build only the visible tab first so the modal can animate immediately.
    var _tabPages = {};
    var _tabEventBound = {};

    function renderTabContent() {
        ensureTabPage(activeTab);

        Object.keys(_tabPages).forEach(function (tabName) {
            var page = _tabPages[tabName];
            page.hidden = tabName !== activeTab;
            page.classList.toggle('active', tabName === activeTab);
        });

        if (activeTab === 'appearance' && !_tabEventBound.appearance) { bindAppearanceEvents(); _tabEventBound.appearance = true; }
        if (activeTab === 'wallpaper' && !_tabEventBound.wallpaper) { bindWallpaperEvents(); _tabEventBound.wallpaper = true; }
        if (activeTab === 'shortcuts' && !_tabEventBound.shortcuts) { bindShortcutsEvents(); _tabEventBound.shortcuts = true; }
    }

    function ensureTabPage(tabName) {
        if (_tabPages[tabName]) return _tabPages[tabName];

        var builders = {
            appearance: buildAppearanceHTML,
            wallpaper: buildWallpaperHTML,
            shortcuts: buildShortcutsHTML,
            about: buildAboutHTML
        };
        var builder = builders[tabName] || builders.appearance;
        var page = document.createElement('div');
        page.className = 'tab-page';
        page.dataset.tab = tabName;
        page.hidden = true;
        page.innerHTML = builder();
        modalContent.appendChild(page);
        _tabPages[tabName] = page;
        return page;
    }

    function getSourceLabel(source) {
        var map = {
            bing: t('sourceBing') || 'Bing 每日壁纸',
            upload: t('sourceUpload') || '本地上传',
            folder: t('sourceFolder') || '本地文件夹',
            rss: t('sourceRss') || 'RSS 订阅',
            api: t('sourceApi') || 'API 端点'
        };
        return map[source] || source;
    }

    function tr(key, fallback) {
        var value = t(key);
        return value && value !== key ? value : fallback;
    }

    function buildPageShell(title, subtitle, body) {
        return '<div class="settings-page-shell">' +
            '<div class="settings-page-header">' +
            '<h2>' + title + '</h2>' +
            '<p>' + subtitle + '</p>' +
            '</div>' +
            body +
            '</div>';
    }

    function modalCopy(key, fallback) {
        var lang = I18N[currentLang] || {};
        var en = I18N.en || {};
        var enFallback = {
            modalSubtitleAppearance: 'Search, overlay, theme, and panel texture live here.',
            modalSubtitleWallpaper: 'The five sources keep their own signal colors, with the current source expanded.',
            modalSubtitleShortcuts: 'Shortcuts stay lightweight and focused on frequent entry points.',
            modalSubtitleAbout: 'PlainTab stays quietly behind your new tab page.',
            modalDescSearchMode: 'Choose when the search box should appear.',
            modalDescSearchPosition: 'Anchor the search area within the vertical rhythm.',
            modalDescSearchRadius: 'Match the search box shape to the current wallpaper mood.',
            modalDescOverlay: 'Darken the wallpaper to improve foreground readability.',
            modalDescIconOpacity: 'Tune the presence of corner buttons and the search engine icon.',
            modalDescTheme: 'Extract surface, stroke, accent, and text colors from the wallpaper.',
            modalDescPanelOpacity: 'Adjust the distance between floating panels and the wallpaper.',
            modalDescEngine: 'Web mode can switch engines; extension mode uses the browser default.',
            modalDescHotkey: 'Open the command palette and quick entries.',
            modalDescHiddenHotkey: 'Open hidden shortcut management directly.',
            modalDescRecommend: 'Keep the high-frequency recommendations area.'
        };
        return lang[key] || en[key] || (currentLang.indexOf('zh') === 0 ? fallback : (enFallback[key] || fallback));
    }

    function settingItem(label, desc, control, extraClass) {
        return '<div class="setting-item' + (extraClass ? ' ' + extraClass : '') + '">' +
            '<div class="setting-copy">' +
            '<span class="setting-label">' + label + '</span>' +
            '<span class="setting-desc">' + desc + '</span>' +
            '</div>' +
            '<div class="setting-control">' + control + '</div>' +
            '</div>';
    }

    function buildAppearanceHTML() {
        var searchModeControl = '<select id="modalSearchMode">' +
            '<option value="hover"' + (searchMode === 'hover' ? ' selected' : '') + '>' + (t('searchHover') || '悬停时显示') + '</option>' +
            '<option value="always"' + (searchMode === 'always' ? ' selected' : '') + '>' + (t('searchAlways') || '始终显示') + '</option>' +
            '<option value="never"' + (searchMode === 'never' ? ' selected' : '') + '>' + (t('searchNever') || '始终隐藏') + '</option>' +
            '</select>';
        var searchPosControl = '<select id="modalSearchPos">' +
            '<option value="top"' + (searchPosition === 'top' ? ' selected' : '') + '>' + (t('posTop') || '顶部') + '</option>' +
            '<option value="upper"' + (searchPosition === 'upper' ? ' selected' : '') + '>' + (t('posUpper') || '中上') + '</option>' +
            '<option value="center"' + (searchPosition === 'center' ? ' selected' : '') + '>' + (t('posCenter') || '居中') + '</option>' +
            '<option value="lower"' + (searchPosition === 'lower' ? ' selected' : '') + '>' + (t('posLower') || '中下') + '</option>' +
            '<option value="bottom"' + (searchPosition === 'bottom' ? ' selected' : '') + '>' + (t('posBottom') || '底部') + '</option>' +
            '</select>';
        var radiusControl = '<select id="modalSearchRadius">' +
            '<option value="capsule"' + (searchRadius === 'capsule' ? ' selected' : '') + '>' + (t('radiusCapsule') || '胶囊 (偏圆)') + '</option>' +
            '<option value="rounded"' + (searchRadius === 'rounded' ? ' selected' : '') + '>' + (t('radiusRounded') || '圆角') + '</option>' +
            '<option value="sharp"' + (searchRadius === 'sharp' ? ' selected' : '') + '>' + (t('radiusSharp') || '直角') + '</option>' +
            '</select>';
        var overlayControl = '<input type="range" id="modalOverlayRange" min="0" max="0.6" step="0.01" value="' + overlayOpacity + '">' +
            '<input type="number" id="modalOverlayNum" class="input-w-55" min="0" max="0.6" step="0.01" value="' + overlayOpacity + '">';
        var opacityControl = '<input type="range" id="modalOpacityRange" min="0" max="1" step="0.01" value="' + currentOpacity + '">' +
            '<input type="number" id="modalOpacityNum" class="input-w-55" min="0" max="1" step="0.01" value="' + currentOpacity + '">';
        var themeControl = '<label class="switch-control"><input type="checkbox" id="modalThemeEnabled"' + (themeEnabled ? ' checked' : '') + '><span></span></label>';
        var panelOpacityControl = '<input type="range" id="modalPanelOpacityRange" min="0.3" max="1" step="0.01" value="' + panelOpacity + '">' +
            '<input type="number" id="modalPanelOpacityNum" class="input-w-55" min="0.3" max="1" step="0.01" value="' + panelOpacity + '">';
        var engineControl = '<select id="modalEngineSel">' +
            '<option value="google"' + (currentEngine === 'google' ? ' selected' : '') + '>Google</option>' +
            '<option value="bing"' + (currentEngine === 'bing' ? ' selected' : '') + '>Bing</option>' +
            '<option value="baidu"' + (currentEngine === 'baidu' ? ' selected' : '') + '>Baidu</option>' +
            '<option value="duckduckgo"' + (currentEngine === 'duckduckgo' ? ' selected' : '') + '>DuckDuckGo</option>' +
            '</select>';

        var body = '<div class="setting-stack">' +
            settingItem(t('searchLabel') || '搜索栏显示', modalCopy('modalDescSearchMode', '设定搜索框出现的时机。'), searchModeControl) +
            settingItem(t('searchPosition') || '搜索栏位置', modalCopy('modalDescSearchPosition', '在画面纵向节奏中固定搜索重心。'), searchPosControl) +
            settingItem(t('searchRadius') || '搜索栏圆角', modalCopy('modalDescSearchRadius', '让搜索框形态匹配当前壁纸氛围。'), radiusControl) +
            settingItem(t('overlayLabel') || '壁纸遮罩', modalCopy('modalDescOverlay', '加深背景，提升前景元素识别度。'), overlayControl) +
            settingItem(t('opacityLabel') || '图标透明度', modalCopy('modalDescIconOpacity', '控制角落按钮和搜索引擎图标的存在感。'), opacityControl) +
            settingItem(t('themeEnableLabel') || '壁纸主题色', modalCopy('modalDescTheme', '从当前壁纸提取表面、描边、强调和文字色。'), themeControl, 'setting-compact') +
            settingItem(t('panelOpacityLabel') || '面板透明度', modalCopy('modalDescPanelOpacity', '调整浮层与壁纸之间的距离感。'), panelOpacityControl) +
            settingItem(t('engineLabel') || '搜索引擎', modalCopy('modalDescEngine', '网页版可切换，扩展版沿用浏览器默认搜索。'), engineControl, IS_EXTENSION ? 'engine-row-hidden' : '') +
            '</div>' +
            '<div class="settings-actions"><button class="reset-defaults-btn" id="modalResetBtn">' + (t('resetAdv') || '恢复默认设置') + '</button></div>';

        return buildPageShell(tr('tabAppearance', '界面设置'), modalCopy('modalSubtitleAppearance', '搜索、遮罩、主题和浮层质感集中在这里。'), body);
    }

    function bindAppearanceEvents() {
        var selMode = document.getElementById('modalSearchMode');
        var selPos = document.getElementById('modalSearchPos');
        var selRadius = document.getElementById('modalSearchRadius');
        var overlayRange = document.getElementById('modalOverlayRange');
        var overlayNum = document.getElementById('modalOverlayNum');
        var opacityRange = document.getElementById('modalOpacityRange');
        var opacityNum = document.getElementById('modalOpacityNum');
        var themeCheck = document.getElementById('modalThemeEnabled');
        var panelOpacityRange = document.getElementById('modalPanelOpacityRange');
        var panelOpacityNum = document.getElementById('modalPanelOpacityNum');
        var engineSel = document.getElementById('modalEngineSel');
        var resetBtn = document.getElementById('modalResetBtn');

        if (selMode) selMode.addEventListener('change', function () { applySearchMode(this.value); });
        if (selPos) selPos.addEventListener('change', function () { applySearchPosition(this.value); });
        if (selRadius) selRadius.addEventListener('change', function () { applySearchRadius(this.value); });
        if (overlayRange) overlayRange.addEventListener('input', function () { applyOverlayOpacity(this.value); if (overlayNum) overlayNum.value = this.value; });
        if (overlayNum) overlayNum.addEventListener('change', function () { applyOverlayOpacity(this.value); if (overlayRange) overlayRange.value = this.value; });
        if (opacityRange) opacityRange.addEventListener('input', function () { applyOpacity(this.value); if (opacityNum) opacityNum.value = this.value; });
        if (opacityNum) opacityNum.addEventListener('change', function () { applyOpacity(this.value); if (opacityRange) opacityRange.value = this.value; });
        if (themeCheck) themeCheck.addEventListener('change', function () { applyThemeMode(this.checked); });
        if (panelOpacityRange) panelOpacityRange.addEventListener('input', function () { applyPanelOpacity(this.value); if (panelOpacityNum) panelOpacityNum.value = this.value; });
        if (panelOpacityNum) panelOpacityNum.addEventListener('change', function () { applyPanelOpacity(this.value); if (panelOpacityRange) panelOpacityRange.value = this.value; });
        if (engineSel) engineSel.addEventListener('change', function () { applyEngine(this.value); });
        if (resetBtn) resetBtn.addEventListener('click', resetAppearanceDefaults);
    }

    function buildWallpaperHTML() {
        var sources = [
            { id: 'bing',   name: getSourceLabel('bing'),   desc: t('sourceBingDesc')   || '每日自动更新，根据语言选择地区' },
            { id: 'upload', name: getSourceLabel('upload'), desc: t('sourceUploadDesc') || '上传图片，最多 12 张轮换' },
            { id: 'folder', name: getSourceLabel('folder'), desc: t('sourceFolderDesc') || '从本地文件夹直接读取图片' },
            { id: 'rss',    name: getSourceLabel('rss'),    desc: t('sourceRssDesc')    || '从 RSS Feed 自动下载图片' },
            { id: 'api',    name: getSourceLabel('api'),    desc: t('sourceApiDesc')    || '从 API 接口获取图片 URL' }
        ];

        var activeSource = currentMode === 'local' ? 'upload' : currentMode;
        var configs = {
            bing:   '<p>' + (t('bingConfigHint') || '根据当前界面语言自动选择 Bing 市场区域。') + '</p>',
            upload: '<p>' + (t('uploadConfigHint') || '在一级面板中使用「+」按钮上传图片。支持多选，单张上限 12 张。') + '</p>',
            folder: '<div class="config-row"><input type="text" value="" readonly class="opacity-50" placeholder="' + (t('noFolderSelected') || '未选择文件夹') + '"><button>' + (t('chooseFolder') || '选择文件夹') + '</button></div>' +
                '<div class="folder-strategy-row">' +
                '<label class="folder-strategy-label"><input type="radio" name="folderStrategy" value="random" checked> ' + (t('strategyRandom') || '随机') + '</label>' +
                '<label class="folder-strategy-label"><input type="radio" name="folderStrategy" value="sequential"> ' + (t('strategySequential') || '顺序') + '</label></div>',
            rss:    '<div class="config-row"><input type="text" placeholder="https://example.com/feed.xml"><button>' + (t('fetchImages') || '拉取图片') + '</button></div>' +
                '<p class="mt-8">' + (t('rssConfigHint') || '支持 RSS 2.0 / Atom，自动提取 enclosure、media:content 中的图片') + '</p>',
            api:    '<input type="text" class="input-w-full" placeholder="https://api.example.com/wallpaper">' +
                '<input type="text" class="input-w-full" placeholder="' + (t('jsonPathPlaceholder') || 'JSON 图片路径，如 data.image.url') + '">' +
                '<button>' + (t('saveConfig') || '保存配置') + '</button>'
        };

        var drawers = sources.map(function (s) {
            var activeClass = s.id === activeSource ? ' active' : '';
            return '<div class="source-drawer' + activeClass + '" data-source="' + s.id + '">' +
                '<div class="source-drawer-header">' +
                '<span class="source-drawer-dot ' + s.id + '"></span>' +
                '<div class="source-drawer-info"><div class="source-drawer-name">' + s.name + '</div><div class="source-drawer-desc">' + s.desc + '</div></div>' +
                '<svg class="source-drawer-chevron" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '</div>' +
                '<div class="source-drawer-body"><div class="source-drawer-body-inner">' + configs[s.id] + '</div></div>' +
                '</div>';
        }).join('');

        return buildPageShell(tr('tabWallpaper', '壁纸来源'), modalCopy('modalSubtitleWallpaper', '五个来源保持各自的识别色，当前来源展开配置。'), '<div class="source-accordion">' + drawers + '</div>');
    }

    function bindWallpaperEvents() {
        modalContent.querySelectorAll('.source-drawer-header').forEach(function (header) {
            header.addEventListener('click', function (e) {
                if (e.target.closest('button, input, label')) return;
                var drawer = header.parentElement;
                var clickedSource = drawer.dataset.source;
                var wasActive = drawer.classList.contains('active');

                modalContent.querySelectorAll('.source-drawer').forEach(function (d) { d.classList.remove('active'); });

                var nextMode = clickedSource === 'upload' ? 'local' : clickedSource;

                if (nextMode !== currentMode) {
                    currentMode = nextMode;
                    if (D && D.KEYS && (nextMode === 'bing' || nextMode === 'local')) {
                        localStorage.setItem(D.KEYS.MODE, nextMode);
                    }
                    drawer.classList.add('active');
                    if (window.reloadWallpaper) window.reloadWallpaper();
                } else {
                    drawer.classList.add('active');
                }
            });
        });
    }

    function buildShortcutsHTML() {
        var hkNormal = localStorage.getItem('ptab_shortcut_hotkey') || 'ctrl+k';
        var hkHidden = localStorage.getItem('ptab_shortcut_hidden_hotkey') || 'ctrl+shift+k';
        var recommend = localStorage.getItem('ptab_shortcut_recommend');
        var checked = recommend === null ? ' checked' : (recommend === 'true' ? ' checked' : '');

        var body = '<div class="setting-stack">' +
            settingItem(t('cpHotkeyLabel') || '命令面板快捷键', modalCopy('modalDescHotkey', '打开命令面板与快捷入口。'), '<input type="text" class="hotkey-input" id="hkNormal" value="' + hkNormal + '" readonly>') +
            settingItem(t('cpHiddenHotkeyLabel') || '隐藏面板快捷键', modalCopy('modalDescHiddenHotkey', '直接打开隐藏快捷入口管理。'), '<input type="text" class="hotkey-input" id="hkHidden" value="' + hkHidden + '" readonly>') +
            settingItem(t('cpRecommendLabel') || '显示推荐', modalCopy('modalDescRecommend', '保留高频入口的推荐区域。'), '<label class="switch-control"><input type="checkbox" id="cpRecommend"' + checked + '><span></span></label>', 'setting-compact') +
            '</div>';

        return buildPageShell(tr('tabShortcuts', '快捷键设置'), modalCopy('modalSubtitleShortcuts', '快捷键保持轻量，只保留真正高频的入口。'), body);
    }

    function bindShortcutsEvents() {
        var hkNormalEl = document.getElementById('hkNormal');
        var hkHiddenEl = document.getElementById('hkHidden');
        var cpRec = document.getElementById('cpRecommend');

        if (hkNormalEl) hkNormalEl.addEventListener('click', function () { startRecording('normal', hkNormalEl); });
        if (hkHiddenEl) hkHiddenEl.addEventListener('click', function () { startRecording('hidden', hkHiddenEl); });
        if (cpRec) cpRec.addEventListener('change', function () {
            localStorage.setItem('ptab_shortcut_recommend', cpRec.checked ? 'true' : 'false');
        });
    }

    function buildAboutHTML() {
        return buildPageShell(tr('tabAbout', '关于'), modalCopy('modalSubtitleAbout', '一个静静待在新标签页背后的 PlainTab。'),
            '<div class="about-section">' +
            '<div class="about-name">PlainTab</div>' +
            '<div class="about-version">v3.2.0</div>' +
            '<p class="about-desc">' + (t('aboutDesc') || '一款零闪白、极简纯粹的浏览器新标签页扩展。支持五种壁纸来源，双层渲染引擎确保首帧即壁纸。') + '</p>' +
            '<a class="about-link" href="https://github.com/kaininx/PlainTab" target="_blank">github.com/kaininx/PlainTab</a>' +
            '<div class="about-footer">' + (t('aboutFooter') || 'Made by kaininx · MIT License') + '</div>' +
            '</div>');
    }

    // ================================================================
    // Tab switching
    // ================================================================
    function switchTab(tabName) {
        activeTab = tabName;
        var tabs = modalWindow.querySelectorAll('.modal-tab');
        tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.tab === tabName); });
        renderTabContent();
    }

    // ================================================================
    // 搜索 & 界面设置
    // ================================================================
    function applySearchMode(mode) {
        searchMode = mode;
        searchBar.classList.toggle('visible', mode === 'always');
        saveAllSettings();
    }

    function applySearchPosition(pos) {
        searchPosition = pos;
        searchBar.setAttribute('data-position', pos);
        saveAllSettings();
    }

    function applySearchRadius(radius) {
        searchRadius = radius;
        var radii = { capsule: '28px', rounded: '12px', sharp: '4px' };
        searchBar.style.borderRadius = radii[radius] || '28px';
        saveAllSettings();
    }

    function applyOverlayOpacity(val) {
        overlayOpacity = parseFloat(val);
        var overlayEl = document.getElementById('wallpaperOverlay');
        if (!overlayEl) {
            overlayEl = document.createElement('div');
            overlayEl.id = 'wallpaperOverlay';
            overlayEl.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,' + overlayOpacity + ');pointer-events:none;z-index:1;transition:background 0.3s;';
            document.body.appendChild(overlayEl);
        }
        overlayEl.style.background = 'rgba(0,0,0,' + overlayOpacity + ')';
        saveAllSettings();
    }

    function applyOpacity(val) {
        currentOpacity = parseFloat(val);
        document.documentElement.style.setProperty('--icon-opacity', currentOpacity);
        saveAllSettings();
    }

    function applyEngine(engine) {
        currentEngine = engine;
        engineIndex = ENGINES.indexOf(engine);
        if (engineIndex === -1) engineIndex = 0;
        var svgMap = window.ENGINE_SVG || {};
        if (engineIcon) engineIcon.innerHTML = svgMap[engine] || svgMap.google || '';
        saveAllSettings();
    }

    function nextEngine() {
        engineIndex = (engineIndex + 1) % ENGINES.length;
        applyEngine(ENGINES[engineIndex]);
    }

    function applyPanelOpacity(val) {
        panelOpacity = parseFloat(val);
        document.documentElement.style.setProperty('--panel-opacity', panelOpacity);
        saveAllSettings();
    }

    function applyThemeMode(on) {
        themeEnabled = on;
        localStorage.setItem(LS_KEY_THEME_ENABLED, on ? 'true' : 'false');
        var root = document.documentElement.style;
        document.documentElement.setAttribute('data-wallpaper-theme', on ? 'on' : 'off');
        if (on) {
            root.setProperty('--surface-base-rgb', 'var(--theme-surface-base-rgb)');
            root.setProperty('--surface-elevated-rgb', 'var(--theme-surface-elevated-rgb)');
            root.setProperty('--tint-rgb', 'var(--theme-tint-rgb)');
            root.setProperty('--stroke-rgb', 'var(--theme-stroke-rgb)');
            root.setProperty('--on-surface-rgb', 'var(--theme-on-surface-rgb)');
            root.setProperty('--on-surface-muted-rgb', 'var(--theme-on-surface-muted-rgb)');
            root.setProperty('--accent-rgb', 'var(--theme-accent-rgb)');
            root.setProperty('--accent-contrast-rgb', 'var(--theme-accent-contrast-rgb)');
            root.setProperty('--surface-rgb', 'var(--surface-base-rgb)');
            root.setProperty('--surface-soft-rgb', 'var(--surface-elevated-rgb)');
            root.setProperty('--surface-strong-rgb', 'var(--surface-base-rgb)');
            root.setProperty('--border-rgb', 'var(--stroke-rgb)');
            root.setProperty('--text-primary-rgb', 'var(--on-surface-rgb)');
            root.setProperty('--text-secondary-rgb', 'var(--on-surface-muted-rgb)');
            root.setProperty('--text-muted-rgb', 'var(--on-surface-muted-rgb)');
            root.setProperty('--glass-bg', 'rgba(var(--surface-base-rgb), var(--panel-opacity))');
            root.setProperty('--glass-tint', 'linear-gradient(180deg, rgba(var(--tint-rgb), 0.24), rgba(var(--surface-elevated-rgb), 0.10))');
            root.setProperty('--glass-border', '1px solid rgba(var(--stroke-rgb), 0.78)');
            if (window.WallpaperTheme && window.WallpaperTheme.hasCurrent()) {
                window.WallpaperTheme.applyCurrent();
            }
        } else {
            root.removeProperty('--surface-base-rgb');
            root.removeProperty('--surface-elevated-rgb');
            root.removeProperty('--tint-rgb');
            root.removeProperty('--stroke-rgb');
            root.removeProperty('--on-surface-rgb');
            root.removeProperty('--on-surface-muted-rgb');
            root.removeProperty('--surface-rgb');
            root.removeProperty('--surface-soft-rgb');
            root.removeProperty('--surface-strong-rgb');
            root.removeProperty('--border-rgb');
            root.removeProperty('--text-primary-rgb');
            root.removeProperty('--text-secondary-rgb');
            root.removeProperty('--text-muted-rgb');
            root.removeProperty('--theme-surface-base-rgb');
            root.removeProperty('--theme-surface-elevated-rgb');
            root.removeProperty('--theme-tint-rgb');
            root.removeProperty('--theme-stroke-rgb');
            root.removeProperty('--theme-on-surface-rgb');
            root.removeProperty('--theme-on-surface-muted-rgb');
            root.removeProperty('--theme-accent-rgb');
            root.removeProperty('--theme-accent-contrast-rgb');
            root.removeProperty('--accent-rgb');
            root.removeProperty('--accent-contrast-rgb');
            root.setProperty('--glass-bg', 'rgba(var(--surface-base-rgb), var(--panel-opacity))');
            root.setProperty('--glass-tint', 'linear-gradient(180deg, rgba(var(--tint-rgb), 0.20), rgba(var(--surface-elevated-rgb), 0.08))');
            root.setProperty('--glass-border', '1px solid rgba(var(--stroke-rgb), 0.72)');
        }
        saveAllSettings();
    }

    function saveAllSettings() {
        localStorage.setItem(LS_KEY_SEARCH_MODE, searchMode);
        localStorage.setItem(LS_KEY_ICON_OPACITY, currentOpacity);
        localStorage.setItem(LS_KEY_SEARCH_ENGINE, currentEngine);
        localStorage.setItem(LS_KEY_SEARCH_POSITION, searchPosition);
        localStorage.setItem(LS_KEY_OVERLAY_OPACITY, overlayOpacity);
        localStorage.setItem(LS_KEY_SEARCH_RADIUS, searchRadius);
        localStorage.setItem(LS_KEY_PANEL_OPACITY, panelOpacity);
    }

    function loadSettings() {
        searchMode = localStorage.getItem(LS_KEY_SEARCH_MODE) || DEFAULT_SEARCH_MODE;
        searchPosition = localStorage.getItem(LS_KEY_SEARCH_POSITION) || DEFAULT_SEARCH_POSITION;
        searchRadius = localStorage.getItem(LS_KEY_SEARCH_RADIUS) || DEFAULT_SEARCH_RADIUS;

        var storedOpacity = localStorage.getItem(LS_KEY_ICON_OPACITY);
        currentOpacity = storedOpacity !== null ? parseFloat(storedOpacity) : DEFAULT_OPACITY;

        overlayOpacity = parseFloat(localStorage.getItem(LS_KEY_OVERLAY_OPACITY)) || DEFAULT_OVERLAY_OPACITY;
        panelOpacity = parseFloat(localStorage.getItem(LS_KEY_PANEL_OPACITY)) || DEFAULT_PANEL_OPACITY;
        themeEnabled = localStorage.getItem(LS_KEY_THEME_ENABLED) === 'true';

        currentEngine = localStorage.getItem(LS_KEY_SEARCH_ENGINE) || DEFAULT_ENGINE;

        applySearchMode(searchMode);
        applySearchPosition(searchPosition);
        applySearchRadius(searchRadius);
        applyOpacity(currentOpacity);
        applyOverlayOpacity(overlayOpacity);
        applyPanelOpacity(panelOpacity);
        applyThemeMode(themeEnabled);
        if (!IS_EXTENSION) applyEngine(currentEngine);
    }

    function resetAppearanceDefaults() {
        applySearchMode(DEFAULT_SEARCH_MODE);
        applySearchPosition(DEFAULT_SEARCH_POSITION);
        applySearchRadius(DEFAULT_SEARCH_RADIUS);
        applyOpacity(DEFAULT_OPACITY);
        applyOverlayOpacity(DEFAULT_OVERLAY_OPACITY);
        applyPanelOpacity(DEFAULT_PANEL_OPACITY);
        applyThemeMode(false);
        if (!IS_EXTENSION) applyEngine(DEFAULT_ENGINE);
        saveAllSettings();
        // Update modal form values
        var el;
        el = document.getElementById('modalSearchMode'); if (el) el.value = DEFAULT_SEARCH_MODE;
        el = document.getElementById('modalSearchPos'); if (el) el.value = DEFAULT_SEARCH_POSITION;
        el = document.getElementById('modalSearchRadius'); if (el) el.value = DEFAULT_SEARCH_RADIUS;
        el = document.getElementById('modalOpacityRange'); if (el) el.value = DEFAULT_OPACITY;
        el = document.getElementById('modalOpacityNum'); if (el) el.value = DEFAULT_OPACITY;
        el = document.getElementById('modalOverlayRange'); if (el) el.value = DEFAULT_OVERLAY_OPACITY;
        el = document.getElementById('modalOverlayNum'); if (el) el.value = DEFAULT_OVERLAY_OPACITY;
        el = document.getElementById('modalPanelOpacityRange'); if (el) el.value = DEFAULT_PANEL_OPACITY;
        el = document.getElementById('modalPanelOpacityNum'); if (el) el.value = DEFAULT_PANEL_OPACITY;
        el = document.getElementById('modalEngineSel'); if (el) el.value = DEFAULT_ENGINE;
        // Reset hotkeys
        localStorage.setItem('ptab_shortcut_hotkey', 'ctrl+k');
        localStorage.setItem('ptab_shortcut_hidden_hotkey', 'ctrl+shift+k');
        localStorage.setItem('ptab_shortcut_recommend', 'true');
    }

    // ================================================================
    // 快捷键录制
    // ================================================================
    function startRecording(which, inputEl) {
        if (isRecording) {
            cancelRecording();
        }
        isRecording = which;
        inputEl.classList.add('recording');
        inputEl.value = t('pressCombo') || '按下组合键...';
    }

    function cancelRecording() {
        if (!isRecording) return;
        var id = isRecording === 'normal' ? 'hkNormal' : 'hkHidden';
        var el = document.getElementById(id);
        if (el) {
            el.classList.remove('recording');
            el.value = isRecording === 'normal'
                ? (localStorage.getItem('ptab_shortcut_hotkey') || 'ctrl+k')
                : (localStorage.getItem('ptab_shortcut_hidden_hotkey') || 'ctrl+shift+k');
        }
        isRecording = null;
    }

    function handleRecording(e) {
        if (!isRecording) return;
        if (e.key === 'Escape') { cancelRecording(); return; }

        var id = isRecording === 'normal' ? 'hkNormal' : 'hkHidden';
        var el = document.getElementById(id);
        if (!el) { cancelRecording(); return; }

        if (!e.ctrlKey) {
            el.value = t('needCtrl') || '需要 Ctrl 键';
            setTimeout(function () { if (isRecording) el.value = t('pressCombo') || '按下组合键...'; }, 800);
            return;
        }

        if (e.key.length === 1 && e.key >= 'A' && e.key <= 'Z') {
            var parts = ['Ctrl'];
            if (e.shiftKey) parts.push('Shift');
            parts.push(e.key.toUpperCase());
            var combo = parts.join('+');

            var otherId = isRecording === 'normal' ? 'hkHidden' : 'hkNormal';
            var otherEl = document.getElementById(otherId);
            if (otherEl && combo === otherEl.value) {
                el.value = t('hotkeyConflict') || '冲突！';
                setTimeout(function () { if (isRecording) el.value = t('pressCombo') || '按下组合键...'; }, 1000);
                return;
            }

            el.value = combo;
            el.classList.remove('recording');

            var storeKey = isRecording === 'normal' ? 'ptab_shortcut_hotkey' : 'ptab_shortcut_hidden_hotkey';
            localStorage.setItem(storeKey, combo);

            isRecording = null;
        } else {
            el.value = t('needLetter') || '需要字母键 A-Z';
            setTimeout(function () { if (isRecording) el.value = t('pressCombo') || '按下组合键...'; }, 800);
        }
    }

    // ================================================================
    // 本地画廊（保持原有逻辑，仅样式升级）
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

                try { card.setPointerCapture(e.pointerId); } catch (ex) {}

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
                    dragState.card.style.transform = 'scale(1.08) rotate(' + tilt + 'deg)';

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
                                try { localStorage.setItem(D.KEYS.PREVIEW_THUMB, thumbs[nextId]); } catch (ex) {}
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
            }).catch(function () {});
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
    // 扩展模式
    // ================================================================
    function setupExtensionMode() {
        if (engineIcon) {
            engineIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><g clip-path="url(#a)"><path d="M14 12.94 10.16 9.1c1.25-1.76 1.1-4.2-.48-5.78a4.49 4.49 0 0 0-6.36 0 4.49 4.49 0 0 0 0 6.36 4.486 4.486 0 0 0 5.78.48L12.94 14 14 12.94ZM4.38 8.62a3 3 0 0 1 0-4.24 3 3 0 0 1 4.24 0 3 3 0 0 1 0 4.24 3 3 0 0 1-4.24 0Z"/></g><defs><clipPath id="a"><path d="M0 0h16v16H0z"/></clipPath></defs></svg>';
            engineIcon.style.opacity = String(DEFAULT_OPACITY);
            engineIcon.style.pointerEvents = 'none';
        }
    }

    // ================================================================
    // 事件绑定
    // ================================================================
    var _keepGalleryOpen = false;

    function bindEvents() {
        // L1 面板 — 齿轮按钮
        settingsBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleSettings();
        });
        settingsBtn.addEventListener('mouseenter', function () { isMouseInCornerZone = true; showCorners(); });
        settingsBtn.addEventListener('mouseleave', function () { isMouseInCornerZone = false; if (!isOpen && !isLangPanelOpen) hideCorners(); });

        // 语言按钮
        langBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            isLangPanelOpen ? closeLangPanel() : openLangPanel();
        });
        langBtn.addEventListener('mouseenter', function () { isMouseInCornerZone = true; showCorners(); });
        langBtn.addEventListener('mouseleave', function () { isMouseInCornerZone = false; if (!isOpen && !isLangPanelOpen) hideCorners(); });

        // L1 面板鼠标事件
        settingsPanel.addEventListener('mouseenter', function () { clearTimeout(cornerHideTimer); isMouseInCornerZone = true; });
        settingsPanel.addEventListener('mouseleave', function () { isMouseInCornerZone = false; cornerHideTimer = setTimeout(function () { closeSettings(); hideCorners(); }, 500); });
        settingsPanel.addEventListener('click', function (e) { e.stopPropagation(); });

        // 语言面板鼠标事件
        langPanel.addEventListener('mouseenter', function () { clearTimeout(cornerHideTimer); isMouseInCornerZone = true; });
        langPanel.addEventListener('mouseleave', function () { isMouseInCornerZone = false; cornerHideTimer = setTimeout(function () { closeLangPanel(); hideCorners(); }, 500); });
        langPanel.addEventListener('click', function (e) { e.stopPropagation(); });

        // L1 上传按钮
        uploadBtn.addEventListener('click', function (e) { e.stopPropagation(); _keepGalleryOpen = false; fileInput.click(); });

        // 文件选择
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

        // L1 重置按钮
        resetBtn.addEventListener('click', function (e) { e.stopPropagation(); resetToBing(); });

        // L1 高级设置按钮 → 打开模态窗口
        var advSettingsBtn = document.getElementById('advSettingsBtn');
        if (advSettingsBtn) {
            advSettingsBtn.addEventListener('click', function (e) { e.stopPropagation(); openModal(); });
        }

        // 模态窗口 — tab 切换
        if (modalWindow) {
            modalWindow.addEventListener('click', function (e) {
                e.stopPropagation();
                var tab = e.target.closest('.modal-tab');
                if (tab) { switchTab(tab.dataset.tab); return; }
            });
        }

        // 模态窗口 — 点击遮罩关闭
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === modalOverlay) closeModal();
            });
        }

        // 搜索引擎图标切换（网页模式）
        if (engineIcon && !IS_EXTENSION) {
            engineIcon.addEventListener('click', function (e) { e.stopPropagation(); nextEngine(); });
        }
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
        isModalOpen: function () { return isModalOpen; },
        open: openSettings,
        close: closeSettings,
        toggle: toggleSettings,
        closeAll: closeAll,
        openModal: openModal,
        closeModal: closeModal,
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

    // 导出 t() 给全局
    window.t = t;

})();
