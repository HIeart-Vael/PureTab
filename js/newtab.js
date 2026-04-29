(function () {
    // ========== 语言相关 ==========
    const LANG_KEY = 'puretab_language';
    // 从 languages.js 读取全局语言包
    const I18N = window.I18N || {};
    const LanguageList = window.LanguageList || [];

    // 检测浏览器语言，优先匹配支持的语言
    function detectLanguage() {
        const browserLang = navigator.language || 'en';
        // 精确匹配
        if (I18N[browserLang]) return browserLang;
        // 主语言匹配
        const main = browserLang.split('-')[0];
        const found = Object.keys(I18N).find(key => key.startsWith(main + '-') || key === main);
        return found || 'en';
    }

    let currentLang = localStorage.getItem(LANG_KEY) || detectLanguage();
    if (!I18N[currentLang]) currentLang = 'en'; // fallback

    function t(key) {
        return I18N[currentLang]?.[key] || I18N['en']?.[key] || key;
    }

    // ========== 配置常量 ==========
    const BING_SERVICE_PRIMARY = 'https://bing.biturl.top/?resolution=1920x1080&format=image&index=0&mkt=zh-CN';
    const BING_SERVICE_FALLBACK = 'https://bing.img.run/1920x1080.php';
    const CACHE_KEY_URL = 'wallpaper_bing_url';
    const CACHE_KEY_DATE = 'wallpaper_bing_date';
    const SEARCH_MODE_KEY = 'search_mode';
    const ICON_OPACITY_KEY = 'icon_opacity';
    const SEARCH_ENGINE_KEY = 'search_engine';

    const DB_NAME = 'PureTabDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'wallpaper';
    const CUSTOM_BLOB_KEY = 'local_blob';
    const CUSTOM_SOURCE_KEY = 'local_source';
    const CUSTOM_MIME_KEY = 'local_mime';

    // DOM 元素
    const wallpaperLayer = document.getElementById('wallpaperLayer');
    const settingsIcon = document.getElementById('settingsIcon');
    const langIcon = document.getElementById('langIcon');
    const settingsPanel = document.getElementById('settingsPanel');
    const languagePanel = document.getElementById('languagePanel');
    const langTitle = document.getElementById('langTitle');
    const langOptionsContainer = document.getElementById('langOptionsContainer');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const resetBtn = document.getElementById('resetBtn');
    const wallpaperInfo = document.getElementById('wallpaperInfo');
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchEngineIcon = document.getElementById('searchEngineIcon');
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedSection = document.getElementById('advancedSection');
    const searchModeSelect = document.getElementById('searchModeSelect');
    const iconOpacityRange = document.getElementById('iconOpacityRange');
    const iconOpacityNumber = document.getElementById('iconOpacityNumber');
    const searchEngineSelect = document.getElementById('searchEngineSelect');

    let currentSource = 'bing';
    let isPanelOpen = false;
    let isLangPanelOpen = false;
    let hidePanelTimeout, iconVisibleTimeout;
    let mouseNearIcon = false;
    let searchMode = 'hover';
    let currentIconOpacity = 0.45;
    let currentEngine = 'google';
    let currentEngineIndex = 0;
    let searchTimeout;
    let mouseOnSearchBar = false;
    let currentLocalBlobUrl = null;

    const ENGINE_LIST = ['google', 'bing', 'baidu', 'duckduckgo'];
    const ENGINE_ICONS = {
        google: `<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em"><title>Google</title><path d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z" fill="#4285F4"></path><path d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z" fill="#34A853"></path><path d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z" fill="#FBBC05"></path><path d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z" fill="#EB4335"></path></svg>`,
        bing: `<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em"><title>Bing</title><path d="M11.97 7.569a.92.92 0 00-.805.863c-.013.195-.01.209.43 1.347 1 2.59 1.242 3.214 1.283 3.302.099.213.237.413.41.592.134.138.222.212.37.311.26.176.39.224 1.405.527.989.295 1.529.49 1.994.723.603.302 1.024.644 1.29 1.051.191.292.36.815.434 1.342.029.206.029.661 0 .847a2.491 2.491 0 01-.376 1.026c-.1.151-.065.126.081-.058.415-.52.838-1.408 1.054-2.213a6.728 6.728 0 00.102-3.012 6.626 6.626 0 00-3.291-4.53 104.157 104.157 0 00-1.322-.698l-.254-.133a737.941 737.941 0 01-1.575-.827c-.548-.29-.78-.406-.846-.426a1.376 1.376 0 00-.29-.045l-.093.01z" fill="url(#lobe-icons-bing-0-_R_0_)"></path><path d="M13.164 17.24a4.385 4.385 0 00-.202.125 511.45 511.45 0 00-1.795 1.115 163.087 163.087 0 01-.989.614l-.463.288a99.198 99.198 0 01-1.502.941c-.326.2-.704.334-1.09.387-.18.024-.52.024-.7 0a2.807 2.807 0 01-1.318-.538 3.665 3.665 0 01-.543-.545 2.837 2.837 0 01-.506-1.141 2.161 2.161 0 00-.041-.182c-.008-.008.006.138.032.33.027.199.085.487.147.733.482 1.907 1.85 3.457 3.705 4.195a6.31 6.31 0 001.658.412c.22.025.844.035 1.074.017 1.054-.08 1.972-.393 2.913-.992a325.28 325.28 0 01.937-.596l.384-.244.684-.435.234-.149.009-.005.025-.017.013-.007.172-.11.597-.38c.76-.481.987-.65 1.34-.998.148-.146.37-.394.381-.425.002-.007.042-.068.088-.136a2.49 2.49 0 00.373-1.023 4.181 4.181 0 000-.847 4.336 4.336 0 00-.318-1.137c-.224-.472-.7-.9-1.383-1.245a2.972 2.972 0 00-.406-.181c-.01 0-.646.392-1.413.87a7089.171 7089.171 0 00-1.658 1.031l-.439.274z" fill="url(#lobe-icons-bing-1-_R_0_)" fill-rule="nonzero"></path><path d="M4.003 14.946l.004 3.33.042.193c.134.604.366 1.04.77 1.445a2.701 2.701 0 001.955.814c.536 0 1-.135 1.479-.43l.703-.435.556-.346V8.003c0-2.306-.004-3.675-.012-3.782a2.734 2.734 0 00-.797-1.765c-.145-.144-.268-.24-.637-.496A1780.102 1780.102 0 015.762.362C5.406.115 5.38.098 5.271.059a.943.943 0 00-1.254.696C4.003.818 4 1.659 4 6.223v5.394H4l.003 3.329z" fill="url(#lobe-icons-bing-2-_R_0_)" fill-rule="nonzero"></path><defs><radialGradient cx="93.717%" cy="77.818%" fx="93.717%" fy="77.818%" gradientTransform="scale(-1 -.7146) rotate(49.288 2.035 -2.198)" id="lobe-icons-bing-0-_R_0_" r="143.691%"><stop offset="0%" stop-color="#00CACC"></stop><stop offset="100%" stop-color="#048FCE"></stop></radialGradient><radialGradient cx="13.893%" cy="71.448%" fx="13.893%" fy="71.448%" gradientTransform="scale(.6042 1) rotate(-23.34 .184 .494)" id="lobe-icons-bing-1-_R_0_" r="149.21%"><stop offset="0%" stop-color="#00BBEC"></stop><stop offset="100%" stop-color="#2756A9"></stop></radialGradient><linearGradient id="lobe-icons-bing-2-_R_0_" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#00BBEC"></stop><stop offset="100%" stop-color="#2756A9"></stop></linearGradient></defs></svg>`,
        baidu: `<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em"><title>Baidu</title><path d="M8.859 11.735c1.017-1.71 4.059-3.083 6.202.286 1.579 2.284 4.284 4.397 4.284 4.397s2.027 1.601.73 4.684c-1.24 2.956-5.64 1.607-6.005 1.49l-.024-.009s-1.746-.568-3.776-.112c-2.026.458-3.773.286-3.773.286l-.045-.001c-.328-.01-2.38-.187-3.001-2.968-.675-3.028 2.365-4.687 2.592-4.968.226-.288 1.802-1.37 2.816-3.085zm.986 1.738v2.032h-1.64s-1.64.138-2.213 2.014c-.2 1.252.177 1.99.242 2.148.067.157.596 1.073 1.927 1.342h3.078v-7.514l-1.394-.022zm3.588 2.191l-1.44.024v3.956s.064.985 1.44 1.344h3.541v-5.3h-1.528v3.979h-1.46s-.466-.068-.553-.447v-3.556zM9.82 16.715v3.06H8.58s-.863-.045-1.126-1.049c-.136-.445.02-.959.088-1.16.063-.203.353-.671.951-.85H9.82zm9.525-9.036c2.086 0 2.646 2.06 2.646 2.742 0 .688.284 3.597-2.309 3.655-2.595.057-2.704-1.77-2.704-3.08 0-1.374.277-3.317 2.367-3.317zM4.24 6.08c1.523-.135 2.645 1.55 2.762 2.513.07.625.393 3.486-1.975 4-2.364.515-3.244-2.249-2.984-3.544 0 0 .28-2.797 2.197-2.969zm8.847-1.483c.14-1.31 1.69-3.316 2.931-3.028 1.236.285 2.367 1.944 2.137 3.37-.224 1.428-1.345 3.313-3.095 3.082-1.748-.226-2.143-1.823-1.973-3.424zM9.425 1c1.307 0 2.364 1.519 2.364 3.398 0 1.879-1.057 3.4-2.364 3.4s-2.367-1.521-2.367-3.4C7.058 2.518 8.118 1 9.425 1z" fill="#2932E1" fill-rule="nonzero"></path></svg>`,
        duckduckgo: `<svg viewBox="0 0 122.88 122.88"><defs><style>.a{fill:#d53;}.b{fill:#fff;}.c{fill:#ddd;}.d{fill:#fc0;}.e{fill:#6b5;}.f{fill:#4a4;}.g{fill:#148;}</style></defs><title>duckduckgo</title><path class="a" d="M122.88,61.44a61.44,61.44,0,1,0-61.44,61.44,61.44,61.44,0,0,0,61.44-61.44Z"/><path class="b" d="M114.37,61.44a52.92,52.92,0,1,0-15.5,37.43,52.76,52.76,0,0,0,15.5-37.43Zm-13.12-39.8A56.29,56.29,0,1,1,61.44,5.15a56.12,56.12,0,0,1,39.81,16.49Z"/><path class="c" d="M43.24,30.15C26.17,34.13,32.43,58,32.43,58l10.81,52.9,4,1.71-4-82.49Zm-4-10.24H34.7L41,22.19s-6.26,0-6.26,4C48.36,25.6,54.61,29,54.61,29l-15.36-9.1Zm0,0Z"/><path class="b" d="M75.66,115.48S62,93.87,62,79.64c0-26.73,17.63-4,17.63-25S62,28.44,62,28.44c-8.53-10.8-25-8.53-25-8.53l4,2.28s-4,1.13-5.12,2.27,10.81-1.7,15.93,2.85C30.72,29,34.13,46.08,34.13,46.08l11.95,68.27,29.58,1.13Zm0,0Z"/><path class="d" d="M75.66,60.87l21.62-5.69C116.62,58,80.78,68.84,78.51,68.27c-17.07-2.85-12,11.37,8.53,6.82s5.12,11.38-13.65,5.12c-26.74-7.39-12.52-20.48,2.27-19.34Z"/><path class="e" d="M70,105.81l1.14-1.7c12.52,4.55,13.09,6.25,12.52-5.12s0-11.38-13.09-1.71c0-2.84-7.39-1.71-8.53,0-11.95-5.12-13.09-6.83-12.52,1.14,1.14,16.5.57,13.65,11.95,8l8.53-.57Zm0,0Z"/><path class="f" d="M60.87,99.56v6.82c.57,1.14,9.67,1.14,9.67-1.14s-4.55,1.71-7.39.57S62,98.42,62,98.42l-1.14,1.14Zm0,0Z"/><path class="g" d="M48.36,43.24c-2.85-3.42-10.24-.57-8.54,4,.57-2.28,4.55-5.69,8.54-4Zm18.2,0c.57-3.42,6.26-4,8-.57a8,8,0,0,0-8,.57Zm-18.77,9.1a1.14,1.14,0,1,1,0,.57v-.57Zm-4.55,2.27a4,4,0,1,0,0-.57v.57Zm29.58-4a1.14,1.14,0,1,1,0,.57v-.57ZM69.4,52.91a3.42,3.42,0,1,0,0-.57v.57Zm0,0Z"/></svg>`
    };

    // ---------- IndexedDB 封装 ----------
    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror = (e) => reject(e.target.error);
        });
    }

    async function saveLocalWallpaper(file) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(file, CUSTOM_BLOB_KEY);
            store.put('local', CUSTOM_SOURCE_KEY);
            if (file.type) {
                store.put(file.type, CUSTOM_MIME_KEY);
            } else {
                store.put('image/jpeg', CUSTOM_MIME_KEY);
            }
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target.error);
        });
    }

    async function loadLocalWallpaper() {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const blobReq = store.get(CUSTOM_BLOB_KEY);
            const sourceReq = store.get(CUSTOM_SOURCE_KEY);
            const mimeReq = store.get(CUSTOM_MIME_KEY);
            let blob = null, source = null, mime = null;
            blobReq.onsuccess = () => { blob = blobReq.result; checkDone(); };
            sourceReq.onsuccess = () => { source = sourceReq.result; checkDone(); };
            mimeReq.onsuccess = () => { mime = mimeReq.result; checkDone(); };
            function checkDone() {
                if (blobReq.readyState === 'done' && sourceReq.readyState === 'done' && mimeReq.readyState === 'done') {
                    if (source === 'local' && blob) {
                        let finalBlob = blob;
                        if ((!blob.type || blob.type === '') && mime && typeof mime === 'string') {
                            try {
                                finalBlob = new Blob([blob], { type: mime });
                            } catch (e) { }
                        }
                        resolve({ blob: finalBlob, source: 'local' });
                    } else {
                        resolve({ blob: null, source: null });
                    }
                }
            }
        });
    }

    async function removeLocalWallpaper() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.delete(CUSTOM_BLOB_KEY);
            store.delete(CUSTOM_SOURCE_KEY);
            store.delete(CUSTOM_MIME_KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target.error);
        });
    }

    // ---------- 壁纸方法 ----------
    function setBackground(url) {
        if (currentLocalBlobUrl && url !== currentLocalBlobUrl) {
            URL.revokeObjectURL(currentLocalBlobUrl);
            currentLocalBlobUrl = null;
        }
        if (url && url.startsWith('blob:')) currentLocalBlobUrl = url;
        wallpaperLayer.style.backgroundImage = url ? `url(${url})` : 'none';
    }

    function updateInfoText() {
        wallpaperInfo.textContent = currentSource === 'local' ? t('wallpaper_local') : t('wallpaper_bing');
    }

    function testImageUrl(url) {
        return new Promise(resolve => {
            const img = new Image();
            const timeout = setTimeout(() => { img.src = ''; resolve(false); }, 8000);
            img.onload = () => { clearTimeout(timeout); resolve(true); };
            img.onerror = () => { clearTimeout(timeout); resolve(false); };
            img.src = url;
        });
    }

    async function fetchAvailableBingUrl() {
        for (const baseUrl of [BING_SERVICE_PRIMARY, BING_SERVICE_FALLBACK]) {
            const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
            if (await testImageUrl(url)) return url;
        }
        throw new Error(t('bing_source_error'));
    }

    async function updateBingUrlCacheInBackground() {
        const today = new Date().toDateString();
        if (localStorage.getItem(CACHE_KEY_DATE) === today && localStorage.getItem(CACHE_KEY_URL)) return;
        try {
            const newUrl = await fetchAvailableBingUrl();
            localStorage.setItem(CACHE_KEY_URL, newUrl);
            localStorage.setItem(CACHE_KEY_DATE, today);
            if (currentSource === 'bing' && !wallpaperLayer.style.backgroundImage) setBackground(newUrl);
        } catch (e) { }
    }

    async function loadWallpaper() {
        try {
            const { blob, source } = await loadLocalWallpaper();
            if (source === 'local' && blob) {
                currentSource = 'local';
                const url = URL.createObjectURL(blob);
                setBackground(url);
                updateInfoText();
                updateBingUrlCacheInBackground().catch(() => { });
                return;
            }
        } catch (e) { console.warn('读取本地壁纸失败', e); }

        currentSource = 'bing';
        updateInfoText();
        const cachedUrl = localStorage.getItem(CACHE_KEY_URL);
        const cachedDate = localStorage.getItem(CACHE_KEY_DATE);
        const today = new Date().toDateString();
        if (cachedUrl && cachedDate === today) { setBackground(cachedUrl); return; }
        if (cachedUrl) setBackground(cachedUrl);
        try {
            const newUrl = await fetchAvailableBingUrl();
            localStorage.setItem(CACHE_KEY_URL, newUrl);
            localStorage.setItem(CACHE_KEY_DATE, today);
            if (currentSource === 'bing') setBackground(newUrl);
        } catch (err) {
            if (!wallpaperLayer.style.backgroundImage) setBackground(BING_SERVICE_PRIMARY);
        }
    }

    async function setCustomWallpaper(file) {
        const blobUrl = URL.createObjectURL(file);
        setBackground(blobUrl);
        try {
            await saveLocalWallpaper(file);
            currentSource = 'local';
            updateInfoText();
            closeSettingsPanel();
        } catch (e) {
            alert(t('local_upload_error') + (e.message || '存储错误'));
            loadWallpaper();
        }
    }

    async function resetToBingWallpaper() {
        await removeLocalWallpaper();
        if (currentLocalBlobUrl) { URL.revokeObjectURL(currentLocalBlobUrl); currentLocalBlobUrl = null; }
        localStorage.removeItem(CACHE_KEY_DATE);
        localStorage.removeItem(CACHE_KEY_URL);
        currentSource = 'bing';
        updateInfoText();
        closeSettingsPanel();
        loadWallpaper();
    }

    // ---------- 面板互斥逻辑 ----------
    function openSettingsPanel() {
        if (isLangPanelOpen) closeLanguagePanel();
        if (isPanelOpen) return;
        isPanelOpen = true;
        settingsPanel.classList.add('active');
        settingsIcon.classList.add('is-panel-open');
        clearTimeout(hidePanelTimeout);
    }

    function closeSettingsPanel() {
        if (!isPanelOpen) return;
        isPanelOpen = false;
        settingsPanel.classList.remove('active');
        settingsIcon.classList.remove('is-panel-open');
    }

    function openLanguagePanel() {
        if (isPanelOpen) closeSettingsPanel();
        if (isLangPanelOpen) return;
        isLangPanelOpen = true;
        languagePanel.classList.add('active');
        clearTimeout(hidePanelTimeout);
    }

    function closeLanguagePanel() {
        if (!isLangPanelOpen) return;
        isLangPanelOpen = false;
        languagePanel.classList.remove('active');
    }

    function closeAllPanels() {
        closeSettingsPanel();
        closeLanguagePanel();
    }

    // ---------- 语言面板渲染 ----------
    function renderLanguagePanel() {
        langTitle.textContent = t('language_panel_title');
        langOptionsContainer.innerHTML = '';
        LanguageList.forEach(lang => {
            const btn = document.createElement('button');
            btn.className = 'lang-option' + (lang.code === currentLang ? ' current' : '');
            btn.textContent = lang.name;
            btn.addEventListener('click', () => {
                if (lang.code !== currentLang) {
                    applyLanguage(lang.code);
                }
                closeLanguagePanel();
            });
            langOptionsContainer.appendChild(btn);
        });
    }

    function applyLanguage(lang) {
        if (!I18N[lang]) return;
        localStorage.setItem(LANG_KEY, lang);
        currentLang = lang;
        updateLanguageUI();
        renderLanguagePanel();
    }

    // ---------- UI 状态显示 ----------
    function showIcons() {
        settingsIcon.classList.add('is-visible');
        langIcon.classList.add('is-visible');
        clearTimeout(iconVisibleTimeout);
    }

    function hideIcons() {
        // 如果任何面板打开，不隐藏图标
        if (isPanelOpen || isLangPanelOpen) return;
        iconVisibleTimeout = setTimeout(() => {
            if (!mouseNearIcon && !isPanelOpen && !isLangPanelOpen) {
                settingsIcon.classList.remove('is-visible');
                langIcon.classList.remove('is-visible'); // 语言图标 is-visible 移除后自动隐藏（CSS opacity:0）
            }
        }, 300);
    }

    function isNearTopRight(x, y) {
        return x > window.innerWidth - 180 && y < 120;
    }

    function isInCenterArea(x, y) {
        const w = window.innerWidth, h = window.innerHeight;
        return x > w * 0.3 && x < w * 0.7 && y > h * 0.45 && y < h * 0.65;
    }
    function showSearchBar() { if (searchMode === 'never') return; if (searchMode === 'always') searchBar.classList.add('visible'); else { clearTimeout(searchTimeout); searchBar.classList.add('visible'); } }
    function hideSearchBar() { if (searchMode === 'always') return; if (document.activeElement === searchInput) return; clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { if (!mouseOnSearchBar && document.activeElement !== searchInput) searchBar.classList.remove('visible'); }, 100); }
    function applySearchMode(mode) { searchMode = mode; if (mode === 'always') searchBar.classList.add('visible'); else searchBar.classList.remove('visible'); }
    function switchToNextEngine() { currentEngineIndex = (currentEngineIndex + 1) % ENGINE_LIST.length; applySearchEngine(ENGINE_LIST[currentEngineIndex]); searchEngineSelect.value = currentEngine; saveAdvancedSettings(); }
    function applySearchEngine(engine) { currentEngine = engine; currentEngineIndex = ENGINE_LIST.indexOf(engine); searchEngineIcon.innerHTML = ENGINE_ICONS[engine] || ENGINE_ICONS.google; searchEngineSelect.value = engine; }
    function performSearch(query) { if (!query.trim()) return; const engines = { google: 'https://www.google.com/search?q=', bing: 'https://www.bing.com/search?q=', baidu: 'https://www.baidu.com/s?wd=', duckduckgo: 'https://duckduckgo.com/?q=' }; window.open(engines[currentEngine] + encodeURIComponent(query), '_self'); }
    function applyIconOpacity(opacity) { currentIconOpacity = parseFloat(opacity); document.documentElement.style.setProperty('--icon-opacity-rest', currentIconOpacity); iconOpacityRange.value = currentIconOpacity; iconOpacityNumber.value = currentIconOpacity; }
    function loadAdvancedSettings() { const savedMode = localStorage.getItem(SEARCH_MODE_KEY) || 'hover'; const savedOpacity = localStorage.getItem(ICON_OPACITY_KEY) || '0.45'; const savedEngine = localStorage.getItem(SEARCH_ENGINE_KEY) || 'google'; searchModeSelect.value = savedMode; applySearchMode(savedMode); applyIconOpacity(savedOpacity); applySearchEngine(savedEngine); }
    function saveAdvancedSettings() { localStorage.setItem(SEARCH_MODE_KEY, searchModeSelect.value); localStorage.setItem(ICON_OPACITY_KEY, currentIconOpacity); localStorage.setItem(SEARCH_ENGINE_KEY, currentEngine); }

    // ---------- 多语言 UI 更新 ----------
    function updateLanguageUI() {
        searchInput.placeholder = t('search_placeholder');
        searchEngineIcon.setAttribute('title', t('search_engine_title'));
        langIcon.setAttribute('title', t('lang_button_title'));
        settingsIcon.setAttribute('title', t('settings_icon_title'));

        document.querySelector('.settings-panel h3').textContent = t('panel_title');
        updateInfoText();
        uploadBtn.textContent = t('upload_btn');
        resetBtn.textContent = t('reset_btn');
        advancedToggle.textContent = t('advanced_toggle');

        const labels = document.querySelectorAll('.setting-row label');
        if (labels.length >= 3) {
            labels[0].textContent = t('search_mode_label');
            labels[1].textContent = t('icon_opacity_label');
            labels[2].textContent = t('search_engine_label');
        }
        const modeOptions = searchModeSelect.options;
        if (modeOptions.length >= 3) {
            modeOptions[0].textContent = t('search_mode_hover');
            modeOptions[1].textContent = t('search_mode_always');
            modeOptions[2].textContent = t('search_mode_never');
        }
        document.getElementById('resetAdvancedBtn').textContent = t('reset_advanced_btn');
    }

    // ---------- 事件绑定 ----------
    settingsIcon.addEventListener('click', e => {
        e.stopPropagation();
        if (isPanelOpen) {
            closeSettingsPanel();
        } else {
            openSettingsPanel();
        }
    });
    settingsIcon.addEventListener('mouseenter', () => { mouseNearIcon = true; showIcons(); clearTimeout(hidePanelTimeout); });
    settingsIcon.addEventListener('mouseleave', () => { mouseNearIcon = false; if (!isPanelOpen && !isLangPanelOpen) hideIcons(); if (isPanelOpen) hidePanelTimeout = setTimeout(closeSettingsPanel, 600); });

    langIcon.addEventListener('click', e => {
        e.stopPropagation();
        if (isLangPanelOpen) {
            closeLanguagePanel();
        } else {
            openLanguagePanel();
        }
    });
    langIcon.addEventListener('mouseenter', () => { mouseNearIcon = true; showIcons(); });
    langIcon.addEventListener('mouseleave', () => { mouseNearIcon = false; if (!isPanelOpen && !isLangPanelOpen) hideIcons(); });

    document.addEventListener('mousemove', e => {
        if (isNearTopRight(e.clientX, e.clientY)) showIcons();
        else if (!mouseNearIcon && !isPanelOpen && !isLangPanelOpen) hideIcons();
        if (isInCenterArea(e.clientX, e.clientY)) showSearchBar();
        else hideSearchBar();
    });

    searchBar.addEventListener('mouseenter', () => { mouseOnSearchBar = true; clearTimeout(searchTimeout); });
    searchBar.addEventListener('mouseleave', () => { mouseOnSearchBar = false; if (searchMode === 'hover' && document.activeElement !== searchInput) searchTimeout = setTimeout(() => { if (!mouseOnSearchBar && document.activeElement !== searchInput) searchBar.classList.remove('visible'); }, 300); });
    searchInput.addEventListener('focus', () => { searchBar.classList.add('visible'); clearTimeout(searchTimeout); });
    searchInput.addEventListener('blur', () => { setTimeout(() => { if (!mouseOnSearchBar && searchMode === 'hover' && document.activeElement !== searchInput) searchBar.classList.remove('visible'); }, 100); });

    document.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
            const t = e.touches[0];
            if (isNearTopRight(t.clientX, t.clientY) && !isPanelOpen && !isLangPanelOpen) {
                showIcons();
                clearTimeout(iconVisibleTimeout);
                iconVisibleTimeout = setTimeout(() => {
                    if (!mouseNearIcon && !isPanelOpen && !isLangPanelOpen) {
                        settingsIcon.classList.remove('is-visible');
                        langIcon.classList.remove('is-visible');
                    }
                }, 3000);
            }
        }
    }, { passive: true });

    settingsPanel.addEventListener('mouseenter', () => { clearTimeout(hidePanelTimeout); mouseNearIcon = true; });
    settingsPanel.addEventListener('mouseleave', () => { mouseNearIcon = false; hidePanelTimeout = setTimeout(() => { closeSettingsPanel(); hideIcons(); }, 500); });
    settingsPanel.addEventListener('click', e => e.stopPropagation());

    languagePanel.addEventListener('mouseenter', () => { clearTimeout(hidePanelTimeout); mouseNearIcon = true; });
    languagePanel.addEventListener('mouseleave', () => { mouseNearIcon = false; hidePanelTimeout = setTimeout(() => { closeLanguagePanel(); hideIcons(); }, 500); });
    languagePanel.addEventListener('click', e => e.stopPropagation());

    document.addEventListener('click', e => {
        if (isPanelOpen && !settingsPanel.contains(e.target) && e.target !== settingsIcon && !settingsIcon.contains(e.target)) {
            closeSettingsPanel();
        }
        if (isLangPanelOpen && !languagePanel.contains(e.target) && e.target !== langIcon && !langIcon.contains(e.target)) {
            closeLanguagePanel();
        }
        hideIcons();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeAllPanels();
            hideIcons();
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'W') {
            e.preventDefault();
            if (isPanelOpen) closeSettingsPanel();
            else openSettingsPanel();
        }
        if (e.key === 'Enter' && document.activeElement === searchInput) performSearch(searchInput.value);
    });

    uploadBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
    fileInput.addEventListener('change', event => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert(t('file_type_error')); fileInput.value = ''; return; }
        setCustomWallpaper(file);
        fileInput.value = '';
    });
    resetBtn.addEventListener('click', e => { e.stopPropagation(); resetToBingWallpaper(); });
    advancedToggle.addEventListener('click', e => { e.stopPropagation(); advancedSection.classList.toggle('show'); });
    searchModeSelect.addEventListener('change', () => { applySearchMode(searchModeSelect.value); saveAdvancedSettings(); });
    iconOpacityRange.addEventListener('input', () => { applyIconOpacity(iconOpacityRange.value); saveAdvancedSettings(); });
    iconOpacityNumber.addEventListener('change', () => { let val = parseFloat(iconOpacityNumber.value); if (isNaN(val)) val = 0.45; val = Math.min(1, Math.max(0, val)); applyIconOpacity(val); saveAdvancedSettings(); });
    document.getElementById('resetAdvancedBtn').addEventListener('click', () => { applySearchMode('hover'); searchModeSelect.value = 'hover'; applySearchEngine('google'); applyIconOpacity(0.4); saveAdvancedSettings(); });
    searchEngineSelect.addEventListener('change', () => { applySearchEngine(searchEngineSelect.value); saveAdvancedSettings(); });
    searchEngineIcon.addEventListener('click', (e) => { e.stopPropagation(); switchToNextEngine(); });

    // 启动
    function init() {
        loadWallpaper();
        loadAdvancedSettings();
        renderLanguagePanel();
        updateLanguageUI();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();