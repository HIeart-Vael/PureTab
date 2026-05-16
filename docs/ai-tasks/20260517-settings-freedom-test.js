const assert = require('assert');
const fs = require('fs');

const settingsBootstrap = fs.readFileSync('js/settings.js', 'utf8');
const settings = fs.readFileSync('js/settings-full.js', 'utf8');
const newtab = fs.readFileSync('js/newtab.js', 'utf8');
const data = fs.readFileSync('js/wallpaper/data.js', 'utf8');
const searchCss = fs.readFileSync('css/search.css', 'utf8');
const wallpaperCss = fs.readFileSync('css/wallpaper.css', 'utf8');
const settingsCss = fs.readFileSync('css/settings.css', 'utf8');

[
  'DEFAULT_SEARCH_ALIGN',
  'DEFAULT_SEARCH_ICON_POSITION',
  'DEFAULT_SEARCH_WIDTH',
  'DEFAULT_SEARCH_BG_OPACITY',
  'DEFAULT_SEARCH_BLUR',
  'DEFAULT_WALLPAPER_FIT',
  'DEFAULT_WALLPAPER_POSITION',
  'DEFAULT_WALLPAPER_BLUR',
  'DEFAULT_WALLPAPER_BLUR_MAX',
  'DEFAULT_UI_RADIUS',
  'function applySearchAlign',
  'function applySearchIconPosition',
  'function applySearchWidth',
  'function applySearchBackgroundOpacity',
  'function applySearchBlur',
  'function applyWallpaperFit',
  'function applyWallpaperPosition',
  'function applyWallpaperBlur',
  'function normalizeWallpaperBlur',
  'function queueWallpaperBlurApply',
  'function syncWallpaperBlurPerformanceMode',
  'function enhanceModalSelects',
  'function openCustomSelect',
  'function syncCustomSelects',
  'function applyUiRadius',
].forEach((token) => {
  assert.ok(settings.includes(token), `settings.js should include ${token}`);
});

[
  'ui.search.position = searchPosition',
  'ui.search.align = searchAlign',
  'ui.search.iconPosition = searchIconPosition',
  'ui.search.width = searchWidth',
  'ui.search.backgroundOpacity = searchBackgroundOpacity',
  'ui.search.blur = searchBlur',
  'ui.wallpaper.fit = wallpaperFit',
  'ui.wallpaper.position = wallpaperPosition',
  'ui.wallpaper.blur = wallpaperBlur',
  'ui.appearance.radius = uiRadius',
].forEach((token) => {
  assert.ok(settings.includes(token), `saveAllSettings should persist ${token}`);
});

[
  "position: 'center'",
  "align: 'center'",
  "iconPosition: 'right'",
  'width: 560',
  'backgroundOpacity: 0.1',
  'blur: 24',
  "fit: 'cover'",
  'blur: 0',
  "appearance: {",
  "radius: 'soft'",
].forEach((token) => {
  assert.ok(data.includes(token), `DEFAULT_UI should include ${token}`);
});

[
  '--search-width',
  '--search-bg-opacity',
  '--search-blur',
  '.search-bar[data-position="top"]',
  '.search-bar[data-position="edge-top"]',
  '.search-bar[data-position="upper"]',
  '.search-bar[data-position="center-upper"]',
  '.search-bar[data-position="center"]',
  '.search-bar[data-position="center-lower"]',
  '.search-bar[data-position="lower"]',
  '.search-bar[data-position="bottom"]',
  '.search-bar[data-position="edge-bottom"]',
  '.search-bar[data-icon-position="left"]',
  '.search-bar[data-icon-position="right"]',
].forEach((token) => {
  assert.ok(searchCss.includes(token), `search.css should include ${token}`);
});

[
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  '--search-left: 6vw',
  '--search-left: 94vw',
].forEach((token) => {
  assert.strictEqual(searchCss.includes(token), false, `search.css should not keep edge-grid token ${token}`);
});

[
  '--wallpaper-fit',
  '--wallpaper-position',
  '--wallpaper-blur',
].forEach((token) => {
  assert.ok(wallpaperCss.includes(token), `wallpaper.css should include ${token}`);
});

[
  'rgba(var(--surface-base-rgb), var(--panel-opacity))',
  'rgba(var(--surface-elevated-rgb), var(--panel-opacity))',
  '.wallpaper-blur-active',
  '.wallpaper-blur-active *',
  '.setting-warning',
  '.setting-group',
  '.settings-page-body',
  '.custom-select',
  '.custom-select-trigger',
  '.custom-select-menu',
  '.custom-select-option',
  '.custom-select-native',
  'mask-image',
].forEach((token) => {
  assert.ok(settingsCss.includes(token), `settings.css should use panel opacity token ${token}`);
});

assert.ok(settings.includes('wallpaperBlurPerfHint'), 'settings should render a red performance hint for wallpaper blur');
assert.ok(settings.includes('settingGroup('), 'appearance settings should be grouped');
assert.ok(settings.includes("select.classList.add('custom-select-native')"), 'native selects should be hidden after custom select enhancement');
assert.ok(settings.includes("dispatchEvent(new Event('change'"), 'custom select should keep the existing select change flow');
assert.ok(settings.includes("document.getElementById('modalThemeEnabled')"), 'reset should sync the theme toggle control');
assert.ok(settings.includes('el.checked = false'), 'reset should visually turn off the theme toggle');
const resetStart = settings.indexOf('function resetAppearanceDefaults()');
const resetEnd = settings.indexOf('// ================================================================', resetStart + 1);
assert.ok(resetStart >= 0 && resetEnd > resetStart, 'resetAppearanceDefaults should be present');
const resetBody = settings.slice(resetStart, resetEnd);
assert.strictEqual(resetBody.includes('saveHotkey'), false, 'appearance reset should not reset command palette hotkeys');
assert.strictEqual(resetBody.includes('saveHiddenHotkey'), false, 'appearance reset should not reset hidden palette hotkey');
assert.strictEqual(resetBody.includes('saveRecommend'), false, 'appearance reset should not reset command palette recommendation setting');
assert.ok(settings.includes('min="0" max="15"'), 'wallpaper blur slider should use a continuous 0-15 range');
assert.strictEqual(settings.includes('max="24"'), false, 'wallpaper blur should not allow expensive 24px values');
assert.ok(settings.includes('wallpaperBlur > 5'), 'wallpaper blur should only disable animations above 5');
assert.ok(settings.includes('document.addEventListener(\'keydown\', handleRecording'), 'shortcut recorder should listen for keydown');
assert.ok(settings.includes('e.key.toUpperCase()'), 'shortcut recorder should accept lowercase letter keys');
assert.ok(settings.includes('e.preventDefault()'), 'shortcut recorder should prevent browser shortcuts while recording');
assert.ok(settings.includes('e.stopPropagation()'), 'shortcut recorder should stop global shortcuts while recording');
assert.strictEqual(settings.includes('--wallpaper-scale'), false, 'wallpaper blur should not scale the wallpaper');
assert.strictEqual(wallpaperCss.includes('--wallpaper-scale'), false, 'wallpaper layer should not scale for blur compensation');
assert.strictEqual(settingsCss.includes('.settings-page-header::after'), false, 'header should not use opaque fade overlay');
const blurControlStart = settings.indexOf('var wallpaperBlurControl');
const blurControlEnd = settings.indexOf('var overlayControl');
assert.ok(blurControlStart >= 0 && blurControlEnd > blurControlStart, 'wallpaper blur control should be declared');
assert.strictEqual(settings.slice(blurControlStart, blurControlEnd).includes('wallpaperBlurPerfHint'), false, 'wallpaper blur hint should be outside inline slider controls');

const themeIndex = settings.indexOf("settingItem(t('themeEnableLabel')");
const searchIndex = settings.indexOf("settingItem(t('searchLabel')");
assert.ok(themeIndex >= 0, 'appearance tab should render theme setting');
assert.ok(searchIndex >= 0, 'appearance tab should render search visibility setting');
assert.ok(themeIndex < searchIndex, 'theme setting should be the first appearance control');
assert.strictEqual(settings.includes('id="modalSearchAlign"'), false, 'search alignment should be folded into 9-position control');

assert.ok(newtab.includes('function eventMatchesHotkey'), 'newtab should match configurable palette hotkeys');
assert.ok(newtab.includes('window.Palette.loadHotkey()'), 'newtab should read the saved normal palette hotkey');
assert.ok(newtab.includes('window.Palette.loadHiddenHotkey()'), 'newtab should read the saved hidden palette hotkey');
assert.strictEqual(newtab.includes("e.key.toLowerCase() === 'k' && !e.shiftKey"), false, 'newtab should not hardcode Ctrl+K for the normal palette');
assert.strictEqual(newtab.includes("e.key.toLowerCase() === 'k'"), false, 'newtab should not hardcode K for palette shortcuts');
assert.ok(settingsBootstrap.includes("script.src = 'js/settings-full.js'"), 'settings bootstrap should lazy-load the full settings module');
assert.ok(settings.includes('window.SettingsPanelFull = {'), 'settings-full should export the complete settings API');

console.log('settings freedom behavior hooks ok');
