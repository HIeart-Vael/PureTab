# RSS Wallpaper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add RSS as a complete wallpaper source with built-in/custom feeds, cached feed images and article metadata, configurable article overlay, and wallpaper-source reset.

**Architecture:** Reuse PlainTab's existing `ptab_wallpaper` model and shared wallpaper render/cache pipeline. Add focused RSS provider helpers in `js/wallpaper/fetch.js`, RSS configuration helpers in `js/wallpaper/data.js`, RSS orchestration in `js/newtab.js`, and RSS settings/overlay UI in the existing settings and stylesheet files.

**Tech Stack:** Vanilla JavaScript, DOMParser, Fetch API with AbortSignal timeout, IndexedDB through `WallpaperData`, localStorage JSON models, native CSS, static Manifest V3 extension assets.

---

## File Map

- Modify `js/wallpaper/data.js`: expand default RSS config, add source/config helpers, reset wallpaper helpers, and RSS blob-key utilities.
- Modify `js/wallpaper/fetch.js`: add RSS URL validation, permission-aware fetch, feed parsing, image extraction, image download/cache, and test/refresh functions.
- Modify `js/newtab.js`: add RSS load path, cached RSS rotation, due refresh scheduling, RSS overlay rendering, and reset-aware reload behavior.
- Modify `js/settings-panel.js`: replace RSS pending drawer with source list, add/test/delete controls, global RSS options, status text, and wallpaper reset action.
- Modify `js/settings-bootstrap.js`: make source chip and bootstrap refresh paths aware of RSS state.
- Modify `css/settings.css`: style RSS source rows, add form, status, and wallpaper reset action.
- Modify `css/wallpaper.css`: style RSS article overlay with top/bottom and expanded/icon modes.
- Modify `js/languages.js`: add RSS UI strings in English and Chinese fallback dictionaries.
- Modify `index.html`: add one RSS overlay container after wallpaper layers and before search, keeping search z-index above it.
- Modify `manifest.json`: allow extension images from HTTP/HTTPS if needed by RSS wallpapers while preserving CSP constraints.
- Create `docs/ai-tasks/20260517-rss-wallpaper-test.js`: browser-console verification helpers for RSS parser/config/reset checks.

## Task 1: Data Model And Reset Helpers

**Files:**
- Modify: `js/wallpaper/data.js`

- [ ] **Step 1: Expand the RSS defaults**

In `DEFAULT_WALLPAPER.providers.rss.config`, replace the current `{ url, strategy, refreshIntervalMs }` shape with:

```js
config: {
    sources: [
        { id: 'nasa-apod', name: 'NASA APOD', url: 'https://apod.nasa.gov/apod.rss', builtIn: true },
        { id: 'bing-rsshub', name: 'Bing', url: 'https://rsshub.app/bing', builtIn: true }
    ],
    activeSourceId: 'nasa-apod',
    refreshIntervalMs: 86400000,
    showSummary: true,
    showLink: true,
    summaryPosition: 'bottom',
    summaryMode: 'expanded'
},
state: { lastCheckedAt: 0, lastSuccessAt: 0, lastImageUrl: '', lastError: '', lastTestAt: 0, lastTestMessage: '' }
```

- [ ] **Step 2: Add RSS config normalization helpers**

Add these functions near the other model helpers:

```js
function defaultRssConfig() {
    return clone(DEFAULT_WALLPAPER.providers.rss.config);
}

function normalizeRssSource(source, index) {
    source = source || {};
    var id = String(source.id || ('rss-source-' + index)).trim();
    return {
        id: id,
        name: String(source.name || source.url || 'RSS').trim().slice(0, 80),
        url: String(source.url || '').trim(),
        builtIn: source.builtIn === true
    };
}

function normalizeRssConfig(config) {
    var defaults = defaultRssConfig();
    var merged = mergeDefaults(config || {}, defaults);
    var seen = {};
    merged.sources = (merged.sources || []).map(normalizeRssSource).filter(function (source) {
        if (!source.id || !source.url || seen[source.id]) return false;
        seen[source.id] = true;
        return true;
    }).slice(0, 5);
    if (!merged.sources.length) merged.sources = defaults.sources;
    if (!merged.sources.some(function (source) { return source.id === merged.activeSourceId; })) {
        merged.activeSourceId = merged.sources[0].id;
    }
    var allowedIntervals = [0, 86400000, 259200000, 604800000];
    if (allowedIntervals.indexOf(merged.refreshIntervalMs) === -1) merged.refreshIntervalMs = defaults.refreshIntervalMs;
    if (merged.summaryPosition !== 'top' && merged.summaryPosition !== 'bottom') merged.summaryPosition = 'bottom';
    if (merged.summaryMode !== 'expanded' && merged.summaryMode !== 'icon') merged.summaryMode = 'expanded';
    merged.showSummary = merged.showSummary !== false;
    merged.showLink = merged.showLink !== false;
    return merged;
}

function loadRssConfig() {
    var model = loadWallpaper();
    model.providers.rss.config = normalizeRssConfig(model.providers.rss.config);
    saveWallpaper(model);
    return model.providers.rss.config;
}

function saveRssConfig(config) {
    updateWallpaper(function (model) {
        model.providers.rss.config = normalizeRssConfig(config);
    });
}
```

- [ ] **Step 3: Add RSS item helpers**

Add:

```js
function isRssId(id) {
    return !!(id && id.indexOf('rss_') === 0);
}

function rssBlobKey(id) {
    return DB.RSS_PREFIX + String(id || '').replace(/^rss_/, '');
}

function activeRssOrder() {
    return (loadWallpaper().cache.order || []).filter(isRssId);
}
```

Make `imgKey(id)` continue returning `DB.RSS_PREFIX + id.slice(4)` for `rss_` IDs.

- [ ] **Step 4: Add wallpaper reset helper**

Add:

```js
function resetWallpaperDefaults() {
    var previous = loadWallpaper();
    var idsToDelete = (previous.cache.order || []).filter(function (id) {
        return id !== 'bing' && id !== 'api' && id.indexOf('folder:') !== 0;
    });
    idsToDelete.push('api');

    var model = clone(DEFAULT_WALLPAPER);
    model.activeSource = 'bing';
    saveWallpaper(model);
    saveThumbs({});
    saveBlurThumbs({});
    savePreview(null);

    var keys = idsToDelete.map(imgKey);
    keys.push(DB.API_BLOB, DB.FOLDER_HANDLE, DB.FOLDER_FILES);
    return idbDeleteMany(keys).then(function () {
        clearCaches();
        return model;
    });
}
```

Ensure duplicate keys are harmless by filtering:

```js
keys = keys.filter(function (key, index) { return key && keys.indexOf(key) === index; });
```

- [ ] **Step 5: Export the helpers**

Expose `defaultRssConfig`, `loadRssConfig`, `saveRssConfig`, `isRssId`, `rssBlobKey`, `activeRssOrder`, and `resetWallpaperDefaults` on `window.WallpaperData`.

- [ ] **Step 6: Manual smoke check**

Open `index.html` in the browser console and run:

```js
WallpaperData.loadRssConfig().sources.length
WallpaperData.loadRssConfig().activeSourceId
```

Expected: first expression is `2`; second is `"nasa-apod"` unless existing user data already has a valid RSS config.

## Task 2: RSS Fetch, Parse, Test, And Cache

**Files:**
- Modify: `js/wallpaper/fetch.js`
- Create: `docs/ai-tasks/20260517-rss-wallpaper-test.js`

- [ ] **Step 1: Add URL and timeout helpers**

Add near common utilities:

```js
function isHttpUrl(value) {
    try {
        var url = new URL(String(value || '').trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

function timeoutSignal(ms) {
    if (AbortSignal.timeout) return AbortSignal.timeout(ms);
    var controller = new AbortController();
    setTimeout(function () { controller.abort(); }, ms);
    return controller.signal;
}
```

- [ ] **Step 2: Add extension host permission helper**

Add:

```js
function ensureHostPermission(url) {
    if (!(typeof chrome !== 'undefined' && chrome.permissions && chrome.runtime && chrome.runtime.id)) {
        return Promise.resolve({ granted: true, webMode: true });
    }
    var origin = new URL(url).origin + '/*';
    return new Promise(function (resolve) {
        chrome.permissions.contains({ origins: [origin] }, function (hasPermission) {
            if (hasPermission) {
                resolve({ granted: true, webMode: false });
                return;
            }
            chrome.permissions.request({ origins: [origin] }, function (granted) {
                resolve({ granted: !!granted, webMode: false });
            });
        });
    });
}
```

- [ ] **Step 3: Add RSS feed fetch**

Add:

```js
function fetchText(url, timeoutMs) {
    return ensureHostPermission(url).then(function (permission) {
        if (!permission.granted) throw new Error('permission denied');
        return fetch(url, { signal: timeoutSignal(timeoutMs || 8000), mode: 'cors' }).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.text();
        });
    });
}
```

- [ ] **Step 4: Add feed parsing helpers**

Add functions:

```js
function textOf(node, selector) {
    var found = node.querySelector(selector);
    return found ? (found.textContent || '').trim() : '';
}

function attrOf(node, selector, attr) {
    var found = node.querySelector(selector);
    return found ? (found.getAttribute(attr) || '').trim() : '';
}

function absolutizeUrl(url, baseUrl) {
    try { return new URL(url, baseUrl).href; } catch (e) { return ''; }
}

function stripHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
}

function imageFromHtml(html, baseUrl) {
    var div = document.createElement('div');
    div.innerHTML = html || '';
    var img = div.querySelector('img[src]');
    return img ? absolutizeUrl(img.getAttribute('src'), baseUrl) : '';
}

function extractImageUrl(item, baseUrl) {
    var enclosure = item.querySelector('enclosure[url][type^="image/"]') || item.querySelector('enclosure[url]');
    var media = item.querySelector('content[url][medium="image"], content[url][type^="image/"], thumbnail[url]');
    var candidates = [
        enclosure && enclosure.getAttribute('url'),
        media && media.getAttribute('url'),
        imageFromHtml(textOf(item, 'description'), baseUrl),
        imageFromHtml(textOf(item, 'content\\:encoded'), baseUrl),
        imageFromHtml(textOf(item, 'summary'), baseUrl)
    ];
    for (var i = 0; i < candidates.length; i++) {
        var abs = absolutizeUrl(candidates[i], baseUrl);
        if (isHttpUrl(abs)) return abs;
    }
    return '';
}
```

Note: if `querySelector('content\\:encoded')` is unreliable for namespaced nodes, add a fallback loop over `item.children` that checks `localName === 'encoded'`.

- [ ] **Step 5: Add parseRssItems**

Add:

```js
function parseRssItems(xmlText, feedUrl, source) {
    var doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('feed parse failed');
    var nodes = Array.prototype.slice.call(doc.querySelectorAll('item, entry'));
    return nodes.map(function (item, index) {
        var rawDescription = textOf(item, 'description') || textOf(item, 'summary') || textOf(item, 'content');
        var link = attrOf(item, 'link[rel="alternate"]', 'href') || attrOf(item, 'link[href]', 'href') || textOf(item, 'link');
        var published = textOf(item, 'pubDate') || textOf(item, 'published') || textOf(item, 'updated');
        var imageUrl = extractImageUrl(item, feedUrl);
        var title = textOf(item, 'title') || source.name || 'RSS wallpaper';
        return {
            sourceId: source.id,
            sourceName: source.name,
            title: stripHtml(title),
            description: stripHtml(rawDescription).slice(0, 240),
            link: absolutizeUrl(link, feedUrl),
            imageUrl: imageUrl,
            publishedAt: published ? Date.parse(published) || 0 : 0,
            fetchedAt: Date.now(),
            stableKey: source.id + ':' + (link || imageUrl || title || index)
        };
    }).filter(function (item) {
        return isHttpUrl(item.imageUrl);
    }).sort(function (a, b) {
        return (b.publishedAt || 0) - (a.publishedAt || 0);
    }).slice(0, 12);
}
```

- [ ] **Step 6: Add stable RSS ID helper**

Add:

```js
function rssItemId(item) {
    var raw = item.stableKey || item.imageUrl || item.link || item.title;
    var hash = 0;
    for (var i = 0; i < raw.length; i++) hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    return 'rss_' + Math.abs(hash).toString(36);
}
```

- [ ] **Step 7: Add RSS image cache function**

Add:

```js
function downloadImageBlob(url) {
    return fetch(url, { signal: timeoutSignal(8000), mode: 'cors' }).then(function (response) {
        if (!response.ok) throw new Error('image HTTP ' + response.status);
        return response.blob();
    });
}

function cacheRssItems(source, items) {
    var cached = [];
    var thumbs = D.loadThumbs();
    var meta = D.loadMeta();

    function next(index) {
        if (index >= items.length) return Promise.resolve(cached);
        var item = items[index];
        var id = rssItemId(item);
        item.id = id;
        return D.idbGet(D.imgKey(id)).then(function (existing) {
            if (existing && existing.blob && thumbs[id]) {
                cached.push(item);
                return next(index + 1);
            }
            return downloadImageBlob(item.imageUrl).then(function (blob) {
                var url = URL.createObjectURL(blob);
                return S.thumbnail(url).then(function (thumb) {
                    URL.revokeObjectURL(url);
                    if (!thumb) throw new Error('thumbnail failed');
                    return D.idbPut(D.imgKey(id), { blob: blob, mime: blob.type || '', name: item.title || id, source: 'rss', id: id, src: item.imageUrl }).then(function () {
                        thumbs[id] = thumb;
                        cached.push(item);
                    });
                }, function (err) {
                    URL.revokeObjectURL(url);
                    throw err || new Error('thumbnail failed');
                });
            }).catch(function () {
                return null;
            }).then(function () {
                return next(index + 1);
            });
        });
    }

    return next(0).then(function () {
        var order = cached.map(function (item) { return item.id; });
        if (!order.length) throw new Error('no usable images');
        cached.forEach(function (item) {
            meta[item.id] = {
                sourceId: item.sourceId,
                sourceName: item.sourceName,
                title: item.title,
                description: item.description,
                link: item.link,
                imageUrl: item.imageUrl,
                publishedAt: item.publishedAt,
                fetchedAt: item.fetchedAt
            };
        });
        D.saveThumbs(thumbs);
        D.saveMeta(meta);
        return { order: order, meta: meta, thumbs: thumbs, items: cached };
    });
}
```

- [ ] **Step 8: Add public RSS test and refresh functions**

Add:

```js
function testRssSource(source) {
    if (!source || !isHttpUrl(source.url)) return Promise.reject(new Error('invalid url'));
    return fetchText(source.url, 8000).then(function (text) {
        var items = parseRssItems(text, source.url, source);
        if (!items.length) throw new Error('no image entries');
        return { ok: true, count: items.length, first: items[0] };
    });
}

function refreshRssSource(source) {
    if (!source || !isHttpUrl(source.url)) return Promise.reject(new Error('invalid url'));
    return fetchText(source.url, 8000).then(function (text) {
        var items = parseRssItems(text, source.url, source);
        if (!items.length) throw new Error('no image entries');
        return cacheRssItems(source, items);
    });
}
```

Export `isHttpUrl`, `parseRssItems`, `testRssSource`, and `refreshRssSource`.

- [ ] **Step 9: Create parser smoke test helper**

Create `docs/ai-tasks/20260517-rss-wallpaper-test.js`:

```js
(function () {
  var sample = '<?xml version="1.0"?><rss><channel><item><title>Example</title><link>https://example.com/post</link><pubDate>Sun, 17 May 2026 00:00:00 GMT</pubDate><description><![CDATA[<p>Hello</p><img src="https://example.com/image.jpg">]]></description></item></channel></rss>';
  var items = window.WallpaperFetch.parseRssItems(sample, 'https://example.com/feed.xml', { id: 'sample', name: 'Sample' });
  console.assert(items.length === 1, 'expected one item');
  console.assert(items[0].imageUrl === 'https://example.com/image.jpg', 'expected image URL');
  console.assert(items[0].link === 'https://example.com/post', 'expected article link');
  console.log('RSS parser smoke test passed', items[0]);
})();
```

- [ ] **Step 10: Run manual parser check**

Open `index.html`, paste the helper script into the console, and expect:

```text
RSS parser smoke test passed
```

## Task 3: Runtime RSS Loading And Overlay

**Files:**
- Modify: `index.html`
- Modify: `js/newtab.js`
- Modify: `css/wallpaper.css`

- [ ] **Step 1: Add overlay container**

In `index.html`, after `#wallpaperFront` and before `#searchBar`, add:

```html
<div class="rss-wallpaper-info" id="rssWallpaperInfo" hidden></div>
```

- [ ] **Step 2: Cache overlay DOM in `newtab.js`**

Add near DOM element variables:

```js
var rssInfoEl = document.getElementById('rssWallpaperInfo');
```

- [ ] **Step 3: Add RSS source lookup**

Add:

```js
function activeRssSource() {
    var config = D.loadRssConfig();
    return config.sources.filter(function (source) { return source.id === config.activeSourceId; })[0] || config.sources[0] || null;
}
```

- [ ] **Step 4: Add RSS due-refresh helper**

Add:

```js
function isRssRefreshDue(config, state) {
    if (!config.refreshIntervalMs) return false;
    if (!state.lastSuccessAt) return true;
    return Date.now() - state.lastSuccessAt >= config.refreshIntervalMs;
}
```

- [ ] **Step 5: Add RSS overlay renderer**

Add:

```js
function escapeText(value) {
    return String(value || '').replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
}

function renderRssOverlay(id) {
    if (!rssInfoEl) return;
    var config = D.loadRssConfig();
    var meta = D.loadMeta()[id];
    if (!config.showSummary || !meta) {
        rssInfoEl.hidden = true;
        rssInfoEl.innerHTML = '';
        return;
    }
    rssInfoEl.className = 'rss-wallpaper-info ' + config.summaryPosition + ' ' + config.summaryMode;
    var title = escapeText(meta.title || meta.sourceName || 'RSS');
    var desc = escapeText(meta.description || '');
    var link = config.showLink && meta.link ? '<a href="' + escapeText(meta.link) + '" target="_blank" rel="noopener">' + escapeText(t('rssOpenArticle') || 'Open article') + '</a>' : '';
    if (config.summaryMode === 'icon') {
        rssInfoEl.innerHTML = '<button class="rss-info-toggle" aria-label="RSS info">i</button><div class="rss-info-popover"><div class="rss-info-title">' + title + '</div><div class="rss-info-desc">' + desc + '</div>' + link + '</div>';
    } else {
        rssInfoEl.innerHTML = '<div class="rss-info-title">' + title + '</div><div class="rss-info-desc">' + desc + '</div>' + link;
    }
    rssInfoEl.hidden = false;
}
```

- [ ] **Step 6: Add RSS cache loader**

Add:

```js
function tryLoadRssWallpaper(order) {
    if (!order || !order.length) return Promise.resolve(false);
    SP.setCurrentMode('rss');
    var idx = D.getActiveIndex() % order.length;
    var id = order[idx];
    var nextId = order[(idx + 1) % order.length];
    var thumbs = D.loadThumbs();
    if (thumbs[nextId]) D.savePreview(thumbs[nextId]);

    return D.idbGet(D.imgKey(id)).then(function (record) {
        if (!record || !record.blob) return false;
        var blob = record.blob;
        if ((!blob.type || blob.type === '') && record.mime) {
            try { blob = new Blob([blob], { type: record.mime }); } catch (e) { }
        }
        D.saveActiveIndex((idx + 1) % order.length);
        renderRssOverlay(id);
        return applyWallpaperRespectingBlur(URL.createObjectURL(blob), id).then(function () {
            cacheBingInBackground();
            return true;
        });
    });
}
```

- [ ] **Step 7: Add RSS refresh orchestration**

Add:

```js
function refreshRssInBackground(force) {
    var config = D.loadRssConfig();
    var model = D.loadWallpaper();
    var state = model.providers.rss.state || {};
    if (!force && !isRssRefreshDue(config, state)) return Promise.resolve(false);
    var source = activeRssSource();
    if (!source) return Promise.resolve(false);
    state.lastCheckedAt = Date.now();
    state.lastError = '';
    D.updateWallpaper(function (next) { next.providers.rss.state = state; });
    return F.refreshRssSource(source).then(function (result) {
        D.updateWallpaper(function (next) {
            next.activeSource = 'rss';
            next.cache.order = result.order;
            next.cache.index = 0;
            next.cache.meta = result.meta;
            next.providers.rss.state.lastSuccessAt = Date.now();
            next.providers.rss.state.lastImageUrl = result.items[0] ? result.items[0].imageUrl : '';
            next.providers.rss.state.lastError = '';
        });
        var first = result.order[0];
        if (result.thumbs[first]) D.savePreview(result.thumbs[first]);
        cleanupOldRssBlobs(result.order);
        return true;
    }).catch(function (err) {
        D.updateWallpaper(function (next) {
            next.providers.rss.state.lastError = err && err.message ? err.message : String(err || 'RSS refresh failed');
        });
        warn('RSS', 'refresh failed: ' + (err && err.message ? err.message : err));
        return false;
    });
}
```

- [ ] **Step 8: Add old RSS blob cleanup**

Add:

```js
function cleanupOldRssBlobs(activeOrder) {
    var active = {};
    (activeOrder || []).forEach(function (id) { active[id] = true; });
    var meta = D.loadMeta();
    var stale = Object.keys(meta).filter(function (id) { return D.isRssId && D.isRssId(id) && !active[id]; });
    stale.forEach(function (id) { delete meta[id]; });
    D.saveMeta(meta);
    var thumbs = D.loadThumbs();
    stale.forEach(function (id) {
        delete thumbs[id];
        if (D.deleteBlurThumb) D.deleteBlurThumb(id);
    });
    D.saveThumbs(thumbs);
    D.idbDeleteMany(stale.map(function (id) { return D.imgKey(id); })).catch(function () { });
}
```

- [ ] **Step 9: Wire RSS into `loadWallpaper()`**

In `loadWallpaper()`, compute:

```js
var rssOrder = D.activeRssOrder ? D.activeRssOrder() : [];
```

Add an RSS branch before the Bing fallback:

```js
if (lastMode === 'rss') {
    return tryLoadRssWallpaper(rssOrder).then(function (loaded) {
        refreshRssInBackground(!loaded).then(function (updated) {
            if (updated && D.compatMode(D.getActiveSource()) === 'rss') loadWallpaper();
        });
        if (loaded) return;
        return tryLoadCachedBing(bingBlob, meta, today).then(function (loadedBing) {
            if (!loadedBing) return loadBingFromNetwork(meta, today);
        });
    });
}
```

- [ ] **Step 10: Hide overlay for non-RSS sources**

At the start of Bing and local load paths, call:

```js
renderRssOverlay(null);
```

or add a helper `hideRssOverlay()`.

- [ ] **Step 11: Add overlay CSS**

In `css/wallpaper.css`, add:

```css
.rss-wallpaper-info {
    position: fixed;
    left: 24px;
    right: 24px;
    z-index: 40;
    color: #fff;
    pointer-events: none;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
}

.rss-wallpaper-info.top {
    top: 28px;
}

.rss-wallpaper-info.bottom {
    bottom: 28px;
}

.rss-wallpaper-info.expanded {
    max-width: min(720px, calc(100vw - 48px));
    margin-left: auto;
    padding: 12px 14px;
    border-radius: 8px;
    background: rgba(10, 15, 24, 0.52);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
}

.rss-info-title {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
}

.rss-info-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.78);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.rss-wallpaper-info a {
    display: inline-flex;
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 12px;
    pointer-events: auto;
}

.rss-wallpaper-info.icon {
    left: auto;
    right: 24px;
}

.rss-info-toggle {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(10, 15, 24, 0.52);
    color: #fff;
    font-weight: 700;
    pointer-events: auto;
    cursor: pointer;
}

.rss-info-popover {
    position: absolute;
    right: 0;
    bottom: 44px;
    width: min(320px, calc(100vw - 48px));
    padding: 12px 14px;
    border-radius: 8px;
    background: rgba(10, 15, 24, 0.66);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    opacity: 0;
    visibility: hidden;
    transform: translateY(4px);
    transition: opacity 0.16s ease, transform 0.16s ease, visibility 0.16s ease;
    pointer-events: auto;
}

.rss-wallpaper-info.top .rss-info-popover {
    top: 44px;
    bottom: auto;
}

.rss-wallpaper-info.icon:hover .rss-info-popover,
.rss-wallpaper-info.icon:focus-within .rss-info-popover {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}
```

Search bar already uses `z-index: 50`, so it stays above the RSS overlay.

- [ ] **Step 12: Manual runtime check**

Open `index.html`, manually set a fake RSS model in console with an existing upload image if needed, then confirm:

```js
document.getElementById('rssWallpaperInfo').hidden
```

Expected: hidden for Bing/local, visible after RSS load with metadata.

## Task 4: Settings UI For RSS

**Files:**
- Modify: `js/settings-panel.js`
- Modify: `css/settings.css`
- Modify: `js/languages.js`

- [ ] **Step 1: Replace RSS pending config in `buildWallpaperHTML()`**

Replace the `rss` value in `configs` with:

```js
rss: buildRssConfigHTML()
```

- [ ] **Step 2: Add RSS HTML builder**

Add near `buildWallpaperHTML()`:

```js
function buildRssConfigHTML() {
    var config = D.loadRssConfig();
    var state = D.loadWallpaper().providers.rss.state || {};
    var rows = config.sources.map(function (source) {
        var checked = source.id === config.activeSourceId ? ' checked' : '';
        return '<div class="rss-source-row" data-rss-source="' + source.id + '">' +
            '<label class="rss-source-main"><input type="radio" name="rssSource" value="' + source.id + '"' + checked + '><span><strong>' + escapeHtml(source.name) + '</strong><small>' + escapeHtml(source.url) + '</small></span></label>' +
            '<button class="rss-test-btn" type="button" data-action="test-rss">' + tr('rssTest', '测试') + '</button>' +
            '<button class="rss-delete-btn" type="button" data-action="delete-rss" aria-label="' + tr('delete', '删除') + '">×</button>' +
            '</div>';
    }).join('');
    return '<div class="rss-config">' +
        '<div class="rss-source-list">' + rows + '</div>' +
        '<div class="rss-add-row"><input id="rssNameInput" type="text" placeholder="' + tr('rssNamePlaceholder', '源名称') + '"><input id="rssUrlInput" type="url" placeholder="https://example.com/feed.xml"><button id="rssAddBtn" type="button">' + tr('rssAdd', '添加') + '</button></div>' +
        '<div class="rss-options">' +
        settingItem(tr('rssRefreshInterval', '自动拉取'), '', '<select id="rssRefreshInterval"><option value="0">' + tr('rssRefreshOff', '关闭') + '</option><option value="86400000">1 天</option><option value="259200000">3 天</option><option value="604800000">7 天</option></select>', 'setting-compact') +
        settingItem(tr('rssSummaryPosition', '摘要位置'), '', '<select id="rssSummaryPosition"><option value="bottom">' + tr('bottom', '下方') + '</option><option value="top">' + tr('top', '上方') + '</option></select>', 'setting-compact') +
        settingItem(tr('rssSummaryMode', '摘要展示'), '', '<select id="rssSummaryMode"><option value="expanded">' + tr('rssExpanded', '展开条带') + '</option><option value="icon">' + tr('rssIconOnly', 'i 按钮') + '</option></select>', 'setting-compact') +
        settingItem(tr('rssShowSummary', '显示摘要'), '', '<label class="switch-control"><input type="checkbox" id="rssShowSummary"><span></span></label>', 'setting-compact') +
        settingItem(tr('rssShowLink', '显示正文链接'), '', '<label class="switch-control"><input type="checkbox" id="rssShowLink"><span></span></label>', 'setting-compact') +
        '</div>' +
        '<div class="rss-status" id="rssStatus">' + escapeHtml(rssStatusText(config, state)) + '</div>' +
        '</div>';
}
```

Also add `escapeHtml(value)` equivalent to the runtime `escapeText`.

- [ ] **Step 3: Add RSS status formatter**

Add:

```js
function rssStatusText(config, state) {
    var count = D.activeRssOrder ? D.activeRssOrder().length : 0;
    if (state.lastError) return tr('rssStatusError', 'RSS 状态：') + state.lastError;
    if (state.lastSuccessAt) return tr('rssStatusCached', '已缓存') + ' ' + count + '/12 · ' + new Date(state.lastSuccessAt).toLocaleString();
    return count ? (tr('rssStatusCached', '已缓存') + ' ' + count + '/12') : tr('rssStatusEmpty', '尚未缓存 RSS 图片');
}
```

- [ ] **Step 4: Bind RSS events from `bindWallpaperEvents()`**

After drawer header binding, call:

```js
bindRssConfigEvents();
```

- [ ] **Step 5: Implement RSS event binder**

Add:

```js
function bindRssConfigEvents() {
    var root = modalContent.querySelector('.rss-config');
    if (!root) return;
    var config = D.loadRssConfig();
    var interval = root.querySelector('#rssRefreshInterval');
    var position = root.querySelector('#rssSummaryPosition');
    var mode = root.querySelector('#rssSummaryMode');
    var showSummary = root.querySelector('#rssShowSummary');
    var showLink = root.querySelector('#rssShowLink');
    if (interval) interval.value = String(config.refreshIntervalMs);
    if (position) position.value = config.summaryPosition;
    if (mode) mode.value = config.summaryMode;
    if (showSummary) showSummary.checked = config.showSummary !== false;
    if (showLink) showLink.checked = config.showLink !== false;

    root.querySelectorAll('input[name="rssSource"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            var next = D.loadRssConfig();
            next.activeSourceId = radio.value;
            D.saveRssConfig(next);
        });
    });

    [interval, position, mode].forEach(function (el) {
        if (!el) return;
        el.addEventListener('change', function () {
            var next = D.loadRssConfig();
            if (el === interval) next.refreshIntervalMs = parseInt(el.value, 10) || 0;
            if (el === position) next.summaryPosition = el.value;
            if (el === mode) next.summaryMode = el.value;
            D.saveRssConfig(next);
            if (window.reloadWallpaper && D.getActiveSource() === 'rss') window.reloadWallpaper();
        });
    });

    [showSummary, showLink].forEach(function (el) {
        if (!el) return;
        el.addEventListener('change', function () {
            var next = D.loadRssConfig();
            if (el === showSummary) next.showSummary = el.checked;
            if (el === showLink) next.showLink = el.checked;
            D.saveRssConfig(next);
            if (window.reloadWallpaper && D.getActiveSource() === 'rss') window.reloadWallpaper();
        });
    });

    root.addEventListener('click', onRssConfigClick);
}
```

- [ ] **Step 6: Implement RSS add/test/delete click handler**

Add:

```js
function onRssConfigClick(e) {
    var target = e.target;
    var config = D.loadRssConfig();
    if (target.id === 'rssAddBtn') {
        var name = document.getElementById('rssNameInput').value.trim();
        var url = document.getElementById('rssUrlInput').value.trim();
        if (config.sources.length >= 5) return setRssStatus(tr('rssLimit', '最多 5 个 RSS 源'));
        if (!F.isHttpUrl(url)) return setRssStatus(tr('rssInvalidUrl', '请输入 http:// 或 https:// 链接'));
        var id = 'custom-' + F.generateId();
        config.sources.push({ id: id, name: name || url, url: url, builtIn: false });
        config.activeSourceId = id;
        D.saveRssConfig(config);
        invalidateWallpaperTab();
        return;
    }
    var row = target.closest('.rss-source-row');
    if (!row) return;
    var source = config.sources.filter(function (item) { return item.id === row.dataset.rssSource; })[0];
    if (!source) return;
    if (target.dataset.action === 'delete-rss') {
        config.sources = config.sources.filter(function (item) { return item.id !== source.id; });
        if (!config.sources.length) config.sources = D.defaultRssConfig().sources;
        if (!config.sources.some(function (item) { return item.id === config.activeSourceId; })) config.activeSourceId = config.sources[0].id;
        D.saveRssConfig(config);
        invalidateWallpaperTab();
        return;
    }
    if (target.dataset.action === 'test-rss') {
        setRssStatus(tr('rssTesting', '正在测试...'));
        F.testRssSource(source).then(function (result) {
            D.updateWallpaper(function (model) {
                model.providers.rss.state.lastTestAt = Date.now();
                model.providers.rss.state.lastTestMessage = 'OK: ' + result.count;
                model.providers.rss.state.lastError = '';
            });
            setRssStatus(tr('rssTestOk', '测试通过，可用图片条目：') + result.count);
        }).catch(function (err) {
            setRssStatus((tr('rssTestFailed', '测试失败：')) + (err && err.message ? err.message : err));
        });
    }
}
```

Add helper:

```js
function setRssStatus(message) {
    var el = document.getElementById('rssStatus');
    if (el) el.textContent = message;
}
```

Add helper:

```js
function invalidateWallpaperTab() {
    if (_tabPages.wallpaper) {
        _tabPages.wallpaper.remove();
        delete _tabPages.wallpaper;
        _tabEventBound.wallpaper = false;
    }
    renderTabContent();
}
```

- [ ] **Step 7: Allow RSS source activation**

In `bindWallpaperEvents()`, change the non-Bing/non-local early return so RSS does not remain pending. The RSS drawer click should:

```js
if (nextMode === 'rss') {
    currentMode = 'rss';
    D.setActiveSource('rss');
    drawer.classList.add('active');
    refreshGallery();
    if (window.reloadWallpaper) window.reloadWallpaper();
    return;
}
```

Keep folder and API pending unless they are implemented separately.

- [ ] **Step 8: Add wallpaper reset action to wallpaper tab**

Append to `buildWallpaperHTML()` body after source accordion:

```js
'<div class="wallpaper-reset-row"><button class="danger-action" id="wallpaperResetBtn" type="button">' + tr('wallpaperResetDefaults', '恢复默认壁纸设置') + '</button></div>'
```

Bind:

```js
var reset = modalContent.querySelector('#wallpaperResetBtn');
if (reset) reset.addEventListener('click', function () {
    if (!confirm(tr('wallpaperResetConfirm', '这会清理上传、RSS、API 和文件夹壁纸缓存，并切回 Bing。继续吗？'))) return;
    D.resetWallpaperDefaults().then(function () {
        currentMode = 'bing';
        invalidateWallpaperTab();
        refreshGallery();
        if (window.reloadWallpaper) window.reloadWallpaper();
    });
});
```

- [ ] **Step 9: Add settings CSS**

In `css/settings.css`, add classes for `.rss-config`, `.rss-source-row`, `.rss-source-main`, `.rss-test-btn`, `.rss-delete-btn`, `.rss-add-row`, `.rss-options`, `.rss-status`, `.wallpaper-reset-row`, `.danger-action` using the existing quiet control style, 8px or less card radius where applicable, and no nested cards.

- [ ] **Step 10: Add language strings**

In `js/languages.js`, add Chinese and English keys used above:

```js
rssTest, rssAdd, rssNamePlaceholder, rssRefreshInterval, rssRefreshOff,
rssSummaryPosition, rssSummaryMode, rssExpanded, rssIconOnly, rssShowSummary,
rssShowLink, rssStatusError, rssStatusCached, rssStatusEmpty, rssLimit,
rssInvalidUrl, rssTesting, rssTestOk, rssTestFailed, rssOpenArticle,
wallpaperResetDefaults, wallpaperResetConfirm
```

- [ ] **Step 11: Manual settings check**

Open the wallpaper tab. Expected:

- RSS drawer shows NASA and Bing.
- Selecting RSS switches current source to RSS.
- Add form refuses a sixth source.
- Test button shows a status line.
- Reset button asks for confirmation.

## Task 5: Gallery, Bootstrap, Manifest, And Verification

**Files:**
- Modify: `js/settings-panel.js`
- Modify: `js/settings-bootstrap.js`
- Modify: `manifest.json`
- Modify: `docs/ai-tasks/20260517-rss-wallpaper-test.js`

- [ ] **Step 1: Improve RSS gallery titles**

In `rssGalleryItems()`, use `D.loadMeta()[id]`:

```js
var meta = D.loadMeta();
...
title: (meta[id] && meta[id].title) || id,
```

- [ ] **Step 2: Ensure source chip supports RSS in bootstrap**

Check `settings-bootstrap.js` source label handling. Ensure `rss` label is included and no code maps RSS to pending local. If needed, update label maps to:

```js
rss: t('sourceRss')
```

- [ ] **Step 3: Update CSP for RSS image hosts**

In `manifest.json`, update `content_security_policy.extension_pages` `img-src` to allow RSS-cached Blob/data and remote images during preload/download if required by Chrome:

```json
"img-src 'self' https: http: data: blob:;"
```

Keep `script-src 'self'` and `style-src 'self'` unchanged.

- [ ] **Step 4: Extend verification helper**

Append to `docs/ai-tasks/20260517-rss-wallpaper-test.js`:

```js
(function () {
  var config = WallpaperData.defaultRssConfig();
  console.assert(config.sources.length === 2, 'default RSS sources');
  console.assert(config.sources[0].url.indexOf('apod.nasa.gov') !== -1, 'NASA source');
  console.assert(config.sources[1].url.indexOf('rsshub.app/bing') !== -1, 'Bing RSSHub source');
  console.assert(WallpaperFetch.isHttpUrl('https://example.com/feed.xml'), 'https accepted');
  console.assert(!WallpaperFetch.isHttpUrl('javascript:alert(1)'), 'javascript rejected');
  console.log('RSS config smoke test passed');
})();
```

- [ ] **Step 5: Run parser/config helper**

Open `index.html`, paste the full test helper. Expected:

```text
RSS parser smoke test passed
RSS config smoke test passed
```

- [ ] **Step 6: Manual extension-mode RSS test**

Load PlainTab as an unpacked extension. Open the wallpaper tab, choose RSS, test NASA APOD, and allow host permission if prompted.

Expected:

- Test reports at least 1 image entry, or a clear permission/network error if the host blocks access.
- Selecting RSS and reloading does not show a white screen.
- Cached RSS images appear in the L1 gallery once refresh succeeds.

- [ ] **Step 7: Manual web-mode limitation check**

Open `index.html` directly and test NASA APOD.

Expected:

- If CORS blocks it, RSS status shows an understandable failure.
- Existing cached wallpapers remain visible.

- [ ] **Step 8: Overlay interaction check**

With RSS metadata cached, set:

```js
var c = WallpaperData.loadRssConfig();
c.showSummary = true;
c.showLink = true;
c.summaryPosition = 'bottom';
c.summaryMode = 'expanded';
WallpaperData.saveRssConfig(c);
reloadWallpaper();
```

Expected: expanded summary appears at the bottom. Search bar remains clickable and editable above it.

Change `summaryMode` to `icon` and reload. Expected: `i` button appears and popover opens on hover/focus.

- [ ] **Step 9: Reset verification**

Before clicking reset, create or keep an uploaded wallpaper and RSS config. Click "restore default wallpaper settings" and confirm.

Expected:

- Active source is Bing.
- RSS sources return to NASA APOD and Bing RSSHub.
- `ptab_wallpaper_thumbs` is cleared except what Bing reload repopulates.
- Upload/RSS/API/folder cache is removed.
- UI settings such as search position and language remain unchanged.

- [ ] **Step 10: Final status check**

Run:

```powershell
git status --short
```

Expected: only intended files changed plus pre-existing untracked files.

## Implementation Notes

- Keep `preload.js` unchanged. It must only synchronously read `ptab_wallpaper_preview`.
- Do not introduce npm, build tooling, frameworks, or new runtime dependencies.
- Fetch failures must preserve the current visible wallpaper.
- Source switch to RSS should only become visibly useful after RSS has cache or a successful refresh; otherwise Bing fallback remains visible.
- Use `requestIdleCallback` for non-critical follow-up work where possible.
- Revoke all Blob URLs created for temporary image decode or thumbnail generation.
