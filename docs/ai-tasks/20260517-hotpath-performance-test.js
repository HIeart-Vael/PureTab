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
const settings = read('js/settings.js');
const show = read('js/wallpaper/show.js');

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
  assert.strictEqual(settings.includes('window.Palette ? window.Palette.loadHotkey()'), false, 'settings should not need palette.js to read normal hotkey');
  assert.strictEqual(settings.includes('window.Palette ? window.Palette.loadHiddenHotkey()'), false, 'settings should not need palette.js to read hidden hotkey');
  assert.strictEqual(settings.includes('window.Palette.saveHotkey'), false, 'settings should not need palette.js to save normal hotkey');
  assert.strictEqual(settings.includes('window.Palette.saveHiddenHotkey'), false, 'settings should not need palette.js to save hidden hotkey');
  assert.strictEqual(settings.includes('window.Palette.saveRecommend'), false, 'settings should not need palette.js to save recommendation preference');
  assert.ok(settings.includes('function loadPaletteHotkey()'), 'settings should read hotkeys through the shortcut model');
  assert.ok(settings.includes('function savePaletteRecommend'), 'settings should write palette settings through the shortcut model');
}

function testSettingsLoadDoesNotPersistDuringHydration() {
  assert.ok(settings.includes('isHydratingSettings'), 'settings hydration should be tracked');
  const loadStart = settings.indexOf('function loadSettings()');
  const resetStart = settings.indexOf('function resetAppearanceDefaults()', loadStart);
  assert.ok(loadStart >= 0 && resetStart > loadStart, 'loadSettings should exist before resetAppearanceDefaults');
  const body = settings.slice(loadStart, resetStart);
  assert.ok(body.includes('isHydratingSettings = true'), 'loadSettings should suppress persistence before applying values');
  assert.ok(body.includes('isHydratingSettings = false'), 'loadSettings should re-enable persistence after applying values');
  assert.ok(settings.includes('if (isHydratingSettings) return true;'), 'saveAllSettings should skip startup writes');
}

function testWallpaperThemeExtractionIsGatedBeforeCanvasWork() {
  const applyStart = show.indexOf('function applyWallpaper');
  const thumbStart = show.indexOf('function generateThumbnail', applyStart);
  assert.ok(applyStart >= 0 && thumbStart > applyStart, 'applyWallpaper should exist');
  const body = show.slice(applyStart, thumbStart);
  const loadUiIndex = body.indexOf('WallpaperData.loadUI');
  const extractIndex = body.indexOf('WallpaperTheme.extract');
  assert.ok(loadUiIndex >= 0, 'applyWallpaper should read theme setting before extracting colors');
  assert.ok(extractIndex >= 0, 'theme extraction should still exist for enabled theme mode');
  assert.ok(loadUiIndex < extractIndex, 'theme setting should be checked before canvas color extraction');
}

function run() {
  testStorageStartsAtV320Baseline();
  testPreloadUsesSingleCurrentPreviewKey();
  testColdPaletteIsNotLoadedByIndex();
  testSettingsShortcutTabUsesDataModelWithoutPaletteScript();
  testSettingsLoadDoesNotPersistDuringHydration();
  testWallpaperThemeExtractionIsGatedBeforeCanvasWork();
  console.log('hot path performance tests passed');
}

run();
