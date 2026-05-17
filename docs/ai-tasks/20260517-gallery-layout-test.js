const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('js/settings-panel.js', 'utf8');
const match = code.match(/function galleryColumnCount\(count\) \{([\s\S]*?)\n    \}/);
const nextIndexMatch = code.match(/function nextGalleryIndexAfterDisplayed\(displayedIndex, count\) \{([\s\S]*?)\n    \}/);
const nextIdIndexMatch = code.match(/function nextGalleryIndexAfterDisplayedId\(order, displayedId\) \{([\s\S]*?)\n    \}/);

assert.ok(match, 'galleryColumnCount(count) should exist in js/settings-panel.js');
assert.ok(nextIndexMatch, 'nextGalleryIndexAfterDisplayed(displayedIndex, count) should exist in js/settings-panel.js');
assert.ok(nextIdIndexMatch, 'nextGalleryIndexAfterDisplayedId(order, displayedId) should exist in js/settings-panel.js');
const switchBlock = code.match(/currentMode = nextMode;[\s\S]*?if \(window\.reloadWallpaper\) window\.reloadWallpaper\(\);/);
assert.ok(switchBlock, 'source switching should update mode, refresh gallery, then optionally reload wallpaper');
assert.ok(
  switchBlock[0].includes('refreshGallery();\n                    if (nextMode === \'local\' && !D.loadOrder().length) return;'),
  'switching to empty local should refresh the upload + before skipping wallpaper reload',
);

const galleryColumnCount = new Function('count', match[1]);
const nextGalleryIndexAfterDisplayed = new Function('displayedIndex', 'count', nextIndexMatch[1]);
const nextGalleryIndexAfterDisplayedId = new Function(
  'nextGalleryIndexAfterDisplayed',
  `return function nextGalleryIndexAfterDisplayedId(order, displayedId) {${nextIdIndexMatch[1]}\n  };`,
)(nextGalleryIndexAfterDisplayed);

[
  [0, 1],
  [1, 1],
  [2, 2],
  [3, 3],
  [4, 2],
  [5, 3],
  [12, 3],
  [20, 3],
].forEach(([count, expected]) => {
  assert.strictEqual(
    galleryColumnCount(count),
    expected,
    `${count} item(s) should use ${expected} column(s)`,
  );
});

[
  [0, 0, 0],
  [0, 1, 0],
  [0, 5, 1],
  [3, 5, 4],
  [4, 5, 0],
].forEach(([displayedIndex, count, expected]) => {
  assert.strictEqual(
    nextGalleryIndexAfterDisplayed(displayedIndex, count),
    expected,
    `displaying index ${displayedIndex} of ${count} should make ${expected} next`,
  );
});

[
  [['a'], 'a', 0],
  [['a', 'b', 'c'], 'a', 1],
  [['a', 'b', 'c'], 'b', 2],
  [['a', 'b', 'c'], 'c', 0],
].forEach(([order, displayedId, expected]) => {
  assert.strictEqual(
    nextGalleryIndexAfterDisplayedId(order, displayedId),
    expected,
    `displaying ${displayedId} in ${order.join(',')} should make ${expected} next`,
  );
});

const dom = {
  chipClass: '',
  chipText: '',
  gridCols: [],
  addDisplay: '',
  cards: [],
  fileInputChange: null,
  fileInputClicks: 0,
};
const store = {
  order: ['u1', 'u2'],
  thumbs: {
    bing: 'url(data:image/jpeg;base64,bing)',
    u1: 'url(data:image/jpeg;base64,u1)',
    u2: 'url(data:image/jpeg;base64,u2)',
  },
  meta: { u1: { name: 'One.jpg' }, u2: { name: 'Two.jpg' } },
  activeIndex: 0,
  preview: 'url(data:image/jpeg;base64,preview)',
  activeSource: 'bing',
  idb: {},
};
const elements = {
  settingsBtn: { addEventListener() {}, setAttribute() {}, classList: { add() {}, remove() {}, contains() { return false; } } },
  langBtn: { addEventListener() {}, setAttribute() {}, classList: { add() {}, remove() {} } },
  settingsPanel: { addEventListener() {}, classList: { add() {}, remove() {} } },
  langPanel: { addEventListener() {}, classList: { add() {}, remove() {} } },
  langOptions: { appendChild() {} },
  wpModeChip: {
    set textContent(value) { dom.chipText = value; },
    get textContent() { return dom.chipText; },
    set className(value) { dom.chipClass = value; },
    get className() { return dom.chipClass; },
  },
  galleryAnchor: { parentNode: { insertBefore() {} } },
  uploadBtn: {
    style: {},
    addEventListener() {},
  },
  fileInput: {
    files: [],
    value: '',
    click() {
      dom.fileInputClicks += 1;
    },
    addEventListener(type, handler) {
      if (type === 'change') dom.fileInputChange = handler;
    },
  },
  resetBtn: { style: {}, addEventListener() {} },
  searchBar: {
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {},
    style: {},
  },
  searchEngineIcon: { setAttribute() {}, addEventListener() {}, style: {} },
};

const documentStub = {
  title: '',
  documentElement: { style: { setProperty() {}, removeProperty() {} }, setAttribute() {} },
  body: { appendChild() {} },
  getElementById(id) {
    if (id === 'wallpaperGallery') return null;
    return elements[id] || null;
  },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      children: [],
      style: {
        setProperty(name, value) {
          if (name === '--gallery-cols') dom.gridCols.push(Number(value));
        },
      },
      classList: {
        add(cls) { el.classes.push(cls); },
        toggle() {},
        contains(cls) { return el.classes.includes(cls); },
      },
      classes: [],
      set className(value) { el.classes = value.split(/\s+/).filter(Boolean); },
      get className() { return el.classes.join(' '); },
      setAttribute(name, value) {
        if (name === 'data-source') el.source = value;
        if (name === 'data-id') el.id = value;
      },
      appendChild(child) {
        el.children.push(child);
        if (child.classes && child.classes.includes('wallpaper-thumb')) dom.cards.push(child);
      },
      replaceChildren() { el.children = []; dom.cards = []; },
      addEventListener() {},
    };
    return el;
  },
  addEventListener() {},
};

const context = {
  window: {},
  document: documentStub,
  localStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
  },
  navigator: { language: 'en' },
  console,
  setTimeout,
  clearTimeout,
  requestAnimationFrame(fn) { fn(); },
  URL: { createObjectURL(file) { return 'blob:' + (file && file.name ? file.name : 'test'); }, revokeObjectURL() {} },
  confirm() { return true; },
};
context.window = context;
context.WallpaperData = {
  loadThumbs() { return Object.assign({}, store.thumbs); },
  loadPreview() { return store.preview; },
  loadWallpaper() { return { cache: { order: ['bing'], index: 0, meta: {} }, providers: { bing: { state: {} } } }; },
  loadOrder() { return store.order.slice(); },
  loadMeta() { return Object.assign({}, store.meta); },
  loadUI() { return { search: {}, wallpaper: {}, icon: {}, panel: {} }; },
  saveUI() {},
  getActiveSource() { return store.activeSource; },
  compatMode(source) { return source === 'upload' ? 'local' : source; },
  loadLocale() { return 'en'; },
  saveLocale() {},
  idbGet(key) { return Promise.resolve(store.idb[key] || null); },
  idbPut(key, value) { store.idb[key] = value; return Promise.resolve(); },
  imgKey(id) { return id; },
  getActiveIndex() { return store.activeIndex; },
  saveActiveIndex(index) { store.activeIndex = index; },
  savePreview(preview) { store.preview = preview; },
  saveOrder(order) { store.order = order.slice(); },
  saveThumbs(thumbs) { store.thumbs = Object.assign({}, thumbs); },
  saveMeta(meta) { store.meta = Object.assign({}, meta); },
  setActiveSource(source) { store.activeSource = source; },
  clearCaches() {},
};
context.WallpaperShow = {
  apply(url) { return Promise.resolve('displayed:' + url); },
  thumbnail(input) { return Promise.resolve('thumb:' + input); },
};
let generatedId = 0;
context.WallpaperFetch = {
  generateId() {
    generatedId += 1;
    return String(generatedId);
  },
};
context.I18N = { en: { sourceBing: 'Bing daily wallpaper', sourceUpload: 'Local upload' } };
context.LanguageList = [];

vm.runInNewContext(code, context);
const panel = context.SettingsPanelFull;
panel.init();
panel.open();

assert.strictEqual(dom.chipText, 'Bing daily wallpaper');
assert.strictEqual(dom.chipClass, 'wp-mode-chip bing');
assert.deepStrictEqual(dom.gridCols.slice(-1), [1]);
assert.strictEqual(elements.uploadBtn.style.display, 'none');

panel.close();
panel.setCurrentMode('local');
panel.open();

assert.strictEqual(dom.chipText, 'Local upload');
assert.strictEqual(dom.chipClass, 'wp-mode-chip upload');
assert.deepStrictEqual(dom.gridCols.slice(-1), [2]);
assert.strictEqual(elements.uploadBtn.style.display, '');
assert.strictEqual(dom.cards.length, 2);
assert.ok(dom.cards.every(card => card.source === 'upload'));

dom.fileInputClicks = 0;
panel.close();
assert.strictEqual(dom.fileInputClicks, 0, 'closing local with existing images should not open the file picker');

store.order = [];
store.activeSource = 'upload';
panel.setCurrentMode('local');
panel.open();
dom.fileInputClicks = 0;
panel.close();
assert.strictEqual(dom.fileInputClicks, 1, 'closing empty local settings should immediately open the file picker');

(async () => {
  store.order = [];
  store.thumbs = {};
  store.meta = {};
  store.activeIndex = 0;
  store.preview = null;
  store.idb = {};
  generatedId = 0;

  elements.fileInput.files = [
    { name: 'one.jpg', size: 1, type: 'image/jpeg' },
    { name: 'two.jpg', size: 2, type: 'image/jpeg' },
    { name: 'three.jpg', size: 3, type: 'image/jpeg' },
  ];

  await dom.fileInputChange.call(elements.fileInput);

  assert.deepStrictEqual(store.order, ['upload_1', 'upload_2', 'upload_3']);
  assert.strictEqual(
    store.activeIndex,
    1,
    'after showing the first uploaded image, the next new tab should follow thumbnail order',
  );
  assert.strictEqual(
    store.preview,
    'thumb:blob:two.jpg',
    'preview should point to the next thumbnail in gallery order after batch upload',
  );

  console.log('gallery layout rules ok');
})();
