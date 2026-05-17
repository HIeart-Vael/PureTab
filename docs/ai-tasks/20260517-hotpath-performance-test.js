const assert = require('assert');
const fs = require('fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const index = read('index.html');
const preload = read('js/preload.js');
const data = read('js/wallpaper/data.js');
const settingsBootstrap = read('js/settings.js');
const settingsFull = read('js/settings-full.js');
const show = read('js/wallpaper/show.js');
const searchCss = read('css/search.css');
const wallpaperCss = read('css/wallpaper.css');
const settingsCss = read('css/settings.css');

function testStorageStartsAtV320Baseline() {
  assert.ok(data.includes("BASELINE_APP_VERSION = '3.2.0'"), 'storage should document v3.2.0 as the migration baseline');
  assert.strictEqual(data.includes('LEGACY_KEYS'), false, 'legacy localStorage migration map should not stay in the hot data module');
  assert.strictEqual(data.includes('migrate_1_to_2'), false, 'v1 migration should be removed from the hot data module');
  assert.strictEqual(data.includes('migrate_2_to_3'), false, 'v2 migration should be removed from the hot data module');
  assert.strictEqual(data.includes('hasPt3LegacyData'), false, 'versionless pt3 probing should not run on every new tab');
  assert.ok(data.includes('ensureBaselineSchema'), 'current schema initialization should stay explicit and lightweight');
}

function testPreloadUsesSingleCurrentPreviewKey() {
  assert.strictEqual(count(preload, 'localStorage.getItem'), 1, 'preload should do one synchronous localStorage read');
  assert.ok(preload.includes("ptab_wallpaper_preview"), 'preload should read the current v3.2 preview key');
  assert.ok(preload.includes('MAX_PREVIEW_LENGTH'), 'preload should guard against oversized synchronous preview payloads');
  assert.ok(preload.includes('t.length > MAX_PREVIEW_LENGTH'), 'oversized preview data should not be applied during parser-blocking preload');
  assert.ok(preload.includes('localStorage.removeItem'), 'oversized preview data should be cleared so it does not stall every new tab');
  [
    'ptab_preview_thumb',
    'ptab_bing_thumb',
    '__pt3_thumb',
    'bing_thumb',
    'ptab_img_order',
    'ptab_img_thumbs',
  ].forEach((token) => {
    assert.strictEqual(preload.includes(token), false, `preload should not probe legacy key ${token}`);
  });
}

function testWallpaperFilterStaysOffTheDefaultCompositePath() {
  const baseLayerStart = wallpaperCss.indexOf('.wallpaper-layer {');
  const frontLayerStart = wallpaperCss.indexOf('.wallpaper-layer-front', baseLayerStart);
  assert.ok(baseLayerStart >= 0 && frontLayerStart > baseLayerStart, 'wallpaper base layer CSS should be inspectable');
  const baseLayer = wallpaperCss.slice(baseLayerStart, frontLayerStart);
  assert.strictEqual(baseLayer.includes('filter:'), false, 'default wallpaper layer should not pay full-screen filter cost when blur is off');
  assert.strictEqual(baseLayer.includes('will-change: transform, filter'), false, 'default wallpaper layer should not reserve a filter compositor path');
  assert.ok(wallpaperCss.includes('.wallpaper-blur-active .wallpaper-layer'), 'wallpaper blur should be gated behind an explicit blur-active class');
  assert.ok(wallpaperCss.includes('filter: blur(var(--wallpaper-blur, 0px))'), 'blur-active state should still apply the configured wallpaper blur');
  assert.ok(wallpaperCss.includes('will-change: opacity'), 'front wallpaper layer should hint the opacity fade path');
  assert.strictEqual(settingsCss.includes('.wallpaper-blur-active *'), false, 'wallpaper blur must not globally disable unrelated UI animations');
  assert.ok(settingsBootstrap.includes('> 0'), 'startup settings should enable blur compositing only when wallpaper blur is non-zero');
  assert.ok(settingsFull.includes('wallpaperBlur > 0'), 'full settings should enable blur compositing only when wallpaper blur is non-zero');
  assert.ok(settingsFull.includes('wallpaperBlur > 5'), 'full settings should keep the heavy-blur warning threshold separate from blur activation');
}

function testColdPaletteIsNotLoadedByIndex() {
  assert.strictEqual(index.includes('js/palette.js'), false, 'command palette implementation should be loaded on demand');
  assert.strictEqual(index.includes('css/palette.css'), false, 'command palette CSS should be loaded on demand');
  assert.ok(index.includes('js/newtab.js'), 'newtab orchestrator should remain in the startup path');
  const newtab = read('js/newtab.js');
  assert.ok(newtab.includes('function ensurePalette()'), 'newtab should provide a lazy palette loader');
  assert.ok(newtab.includes("ensureStylesheet('css/palette.css')"), 'palette CSS should load through the lazy loader');
  assert.ok(newtab.includes("ensureScript('js/palette.js')"), 'palette JS should load through the lazy loader');
}

function testSettingsShortcutTabUsesDataModelWithoutPaletteScript() {
  assert.strictEqual(settingsFull.includes('window.Palette ? window.Palette.loadHotkey()'), false, 'settings should not need palette.js to read normal hotkey');
  assert.strictEqual(settingsFull.includes('window.Palette ? window.Palette.loadHiddenHotkey()'), false, 'settings should not need palette.js to read hidden hotkey');
  assert.strictEqual(settingsFull.includes('window.Palette.saveHotkey'), false, 'settings should not need palette.js to save normal hotkey');
  assert.strictEqual(settingsFull.includes('window.Palette.saveHiddenHotkey'), false, 'settings should not need palette.js to save hidden hotkey');
  assert.strictEqual(settingsFull.includes('window.Palette.saveRecommend'), false, 'settings should not need palette.js to save recommendation preference');
  assert.ok(settingsFull.includes('function loadPaletteHotkey()'), 'settings should read hotkeys through the shortcut model');
  assert.ok(settingsFull.includes('function savePaletteRecommend'), 'settings should write palette settings through the shortcut model');
}

function testSettingsLoadDoesNotPersistDuringHydration() {
  assert.ok(settingsFull.includes('isHydratingSettings'), 'settings hydration should be tracked');
  const loadStart = settingsFull.indexOf('function loadSettings()');
  const resetStart = settingsFull.indexOf('function resetAppearanceDefaults()', loadStart);
  assert.ok(loadStart >= 0 && resetStart > loadStart, 'loadSettings should exist before resetAppearanceDefaults');
  const body = settingsFull.slice(loadStart, resetStart);
  assert.ok(body.includes('isHydratingSettings = true'), 'loadSettings should suppress persistence before applying values');
  assert.ok(body.includes('isHydratingSettings = false'), 'loadSettings should re-enable persistence after applying values');
  assert.ok(settingsFull.includes('if (isHydratingSettings) return true;'), 'saveAllSettings should skip startup writes');
}

function testFullSettingsIsLoadedOnDemand() {
  assert.ok(index.includes('js/settings.js'), 'settings bootstrap should stay in the startup path');
  assert.strictEqual(index.includes('js/settings-full.js'), false, 'full settings should be loaded on demand');
  assert.ok(settingsBootstrap.includes('function ensureFullSettings()'), 'settings bootstrap should expose a lazy full-settings loader');
  assert.ok(settingsBootstrap.includes("script.src = 'js/settings-full.js'"), 'settings bootstrap should load the full module lazily');
  assert.ok(settingsBootstrap.includes('window.SettingsPanel = {'), 'settings bootstrap should own window.SettingsPanel');
  assert.ok(settingsFull.includes('window.SettingsPanelFull = {'), 'full settings should export a secondary API');
  assert.strictEqual(settingsFull.includes('window.SettingsPanel = {'), false, 'full settings must not replace the startup SettingsPanel facade');
}

function testWallpaperThemeExtractionIsGatedBeforeCanvasWork() {
  assert.strictEqual(index.includes('js/wallpaper/theme.js'), false, 'wallpaper theme extraction should be loaded on demand');
  const applyStart = show.indexOf('function applyWallpaper');
  const thumbStart = show.indexOf('function generateThumbnail', applyStart);
  assert.ok(applyStart >= 0 && thumbStart > applyStart, 'applyWallpaper should exist');
  const body = show.slice(applyStart, thumbStart);
  const loadUiIndex = body.indexOf('WallpaperData.loadUI');
  const scheduleIndex = body.indexOf('scheduleThemeExtraction(img);');
  assert.ok(loadUiIndex >= 0, 'applyWallpaper should read theme setting before extracting colors');
  assert.ok(show.includes('function applyExtractedTheme'), 'theme extraction should still exist for enabled theme mode');
  assert.ok(show.includes('theme.extract(img)'), 'theme extraction should still use the decoded wallpaper image');
  assert.ok(scheduleIndex >= 0, 'applyWallpaper should schedule theme extraction instead of doing canvas work inline');
  assert.ok(loadUiIndex < scheduleIndex, 'theme setting should be checked before canvas color extraction is scheduled');
  assert.ok(show.includes('function ensureThemeModule()'), 'WallpaperShow should expose a lazy theme loader');
  assert.ok(show.includes("script.src = 'js/wallpaper/theme.js'"), 'theme module should be loaded only when needed');
  assert.ok(show.includes('ensureTheme: ensureThemeModule'), 'settings should be able to request the theme module lazily');
  assert.ok(show.includes('function refreshThemeFromCurrentWallpaper'), 'WallpaperShow should be able to theme the already visible wallpaper');
  assert.ok(show.includes('refreshTheme: refreshThemeFromCurrentWallpaper'), 'settings should request current-wallpaper theme refresh after toggling theme on');
  assert.ok(settingsBootstrap.includes('WallpaperShow.refreshTheme(true)'), 'startup settings should force-refresh the current wallpaper theme when enabling theme mode');
  assert.ok(settingsFull.includes('WallpaperShow.refreshTheme(true)'), 'full settings should force-refresh the current wallpaper theme before saved UI catches up');
  assert.ok(show.includes('function afterAnimationFrame'), 'WallpaperShow should be able to schedule post-paint follow-up work');
  assert.ok(show.includes('function scheduleIdle'), 'WallpaperShow should defer non-visual follow-up work off the fade frame');
  assert.ok(show.includes('scheduleThemeExtraction(img);'), 'theme extraction should be scheduled after the wallpaper fade is underway');
  assert.ok(show.includes("typeof transitionMs !== 'number'"), 'wallpaper fade should ignore legacy non-numeric transition labels');
  assert.ok(show.includes('window.setTimeout(finishTransition, transitionMs + 100)'), 'wallpaper fade should not hang if transitionend is missed');
}

function testSearchVisibilityModesStayAuthoritative() {
  const newtab = read('js/newtab.js');
  assert.strictEqual(newtab.includes('function isInCenter'), false, 'hover mode should no longer use a screen-center hot zone');
  assert.strictEqual(newtab.includes('_wasInCenter'), false, 'global mousemove should not track center-zone search visibility');
  assert.ok(newtab.includes('function canRevealSearch()'), 'newtab should centralize search reveal permission');
  assert.ok(newtab.includes("return SP.getSearchMode() !== 'never';"), 'never mode should block focus-driven search reveal');
  assert.ok(newtab.includes('function canFocusSearchFromWallpaper()'), 'newtab should keep wallpaper-click focus policy separate from hover reveal');
  assert.ok(newtab.includes("return SP.getSearchMode() === 'always';"), 'wallpaper clicks should only focus search in always-visible mode');
  assert.ok(newtab.includes('showSearch();'), 'search bar hover should still reveal the bar');
  assert.ok(newtab.includes('if (canFocusSearchFromWallpaper()) searchInput.focus();'), 'wallpaper click should not reveal hover-mode search');
  assert.ok(searchCss.includes('.search-bar[data-visibility="hover"]'), 'hover mode should keep only the search bar hit area active');
  assert.ok(searchCss.includes('.search-bar[data-visibility="hover"]:hover'), 'hover mode should reveal through the native hover hit area');
  assert.ok(searchCss.includes('--search-hover-blur'), 'hover mode should avoid paying backdrop-filter cost while hidden');
  assert.ok(searchCss.includes('blur(var(--search-hover-blur, var(--search-blur, 24px)))'), 'search blur should be disableable in hidden hover state');
  assert.ok(searchCss.includes('visibility: visible'), 'hover mode should keep the transparent search bar hit area visible to pointer events');
  assert.ok(searchCss.includes('pointer-events: auto'), 'hover mode should allow pointer entry on the search bar itself');
  assert.ok(searchCss.includes('.search-bar[data-visibility="never"]'), 'never mode should have an explicit CSS state');
  assert.ok(searchCss.includes('visibility: hidden'), 'never mode should stay visually hidden even if stale classes remain');
  assert.ok(searchCss.includes('pointer-events: none'), 'never mode should not leave an invisible interactive search bar');
  assert.ok(settingsBootstrap.includes('applyUi(D.loadUI())'), 'settings facade refresh should re-apply persisted search visibility');
  assert.ok(settingsFull.includes('loadSettings();'), 'full settings refresh should re-apply persisted UI state');
}

function run() {
  testStorageStartsAtV320Baseline();
  testPreloadUsesSingleCurrentPreviewKey();
  testWallpaperFilterStaysOffTheDefaultCompositePath();
  testColdPaletteIsNotLoadedByIndex();
  testFullSettingsIsLoadedOnDemand();
  testSettingsShortcutTabUsesDataModelWithoutPaletteScript();
  testSettingsLoadDoesNotPersistDuringHydration();
  testWallpaperThemeExtractionIsGatedBeforeCanvasWork();
  testSearchVisibilityModesStayAuthoritative();
  console.log('hot path performance tests passed');
}

run();
