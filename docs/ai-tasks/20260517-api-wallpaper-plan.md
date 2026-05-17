# API Wallpaper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add API wallpaper support and make the wallpaper settings tab use an explicit draft-to-apply flow.

**Architecture:** Keep the current `WallpaperData / WallpaperFetch / WallpaperShow / newtab.js / settings-panel.js` split. `WallpaperData` owns model normalization and cache cleanup, `WallpaperFetch` owns network parsing and test results, `settings-panel.js` owns draft UI and apply confirmation, and `newtab.js` owns runtime loading. API uses the existing single-image `D.DB.API_BLOB` cache and does not introduce RSS-style multi-image API blobs.

**Tech Stack:** Vanilla JavaScript, native CSS, static HTML, IndexedDB, localStorage, Canvas thumbnails, no build tools or package dependencies.

---

## Relevant Files

- Modify: `js/wallpaper/data.js`
  - Normalize the API config shape.
  - Preserve RSS/API test state.
  - Add API config helpers.
  - Add provider cache cleanup helpers.
- Modify: `js/wallpaper/fetch.js`
  - Add API test and refresh helpers.
  - Add JSON-path and automatic image URL extraction.
  - Return typed errors for invalid URL, timeout, auth, CORS, JSON, non-image, and image download failures.
- Modify: `js/settings-panel.js`
  - Replace immediate wallpaper-source persistence with a draft model.
  - Add fixed wallpaper-tab header/body/footer.
  - Add RSS/API red-green test status.
  - Add API segmented tabs, source lists, forms, tests, and apply behavior.
- Modify: `js/newtab.js`
  - Add API runtime load path.
  - Reuse `D.DB.API_BLOB` before network refresh.
  - Refresh API by interval without blocking first visible wallpaper.
- Modify: `css/settings.css`
  - Add fixed wallpaper tab shell styles.
  - Add API segmented tabs, source rows, status dots, and apply footer styles.
- Modify: `js/languages.js`
  - Add UI strings for API, apply states, warnings, and test errors.
- Create: `docs/ai-tasks/20260517-api-wallpaper-test.js`
  - Browser-console regression script matching the repo's existing temporary test style.

## Shared Naming Decisions

- `activeSource`: top-level wallpaper source, one of `bing`, `upload`, `folder`, `rss`, `api`.
- `apiType`: API subtype, one of `image`, `json`.
- `activeImageSourceId`: selected image/redirect API source.
- `activeJsonSourceId`: selected JSON API source.
- `D.DB.API_BLOB`: existing IndexedDB key `ptab_wallpaper_blob_api`; reused for the single API wallpaper blob.
- Test status values: `untested`, `passed`, `failed`.
- API refresh interval values:
  - `0`: off.
  - `-1`: every new tab.
  - `86400000`: 1 day.
  - `259200000`: 3 days.
  - `604800000`: 7 days.

---

### Task 1: Add Browser Regression Test Skeleton

**Files:**
- Create: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Create a failing browser-console regression script**

Create `docs/ai-tasks/20260517-api-wallpaper-test.js` with this initial structure:

```js
(function () {
    'use strict';

    var results = [];

    function record(name, passed, detail) {
        results.push({ name: name, passed: !!passed, detail: detail || '' });
        var fn = passed ? console.log : console.error;
        fn('[API wallpaper test] ' + (passed ? 'PASS ' : 'FAIL ') + name + (detail ? ' - ' + detail : ''));
    }

    function assert(name, condition, detail) {
        record(name, !!condition, detail);
    }

    function colorBlob(color) {
        return new Promise(function (resolve) {
            var canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 18;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            canvas.toBlob(resolve, 'image/png');
        });
    }

    function wait(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms || 0); });
    }

    async function run() {
        var D = window.WallpaperData;
        var F = window.WallpaperFetch;

        assert('WallpaperData.loadApiConfig exists', !!(D && D.loadApiConfig));
        assert('WallpaperData.saveApiConfig exists', !!(D && D.saveApiConfig));
        assert('WallpaperData.apiFieldHash exists', !!(D && D.apiFieldHash));
        assert('WallpaperData.clearWallpaperSourceCache exists', !!(D && D.clearWallpaperSourceCache));
        assert('WallpaperFetch.resolveJsonPath exists', !!(F && F.resolveJsonPath));
        assert('WallpaperFetch.findApiImageUrl exists', !!(F && F.findApiImageUrl));
        assert('WallpaperFetch.testApiSource exists', !!(F && F.testApiSource));
        assert('WallpaperFetch.refreshApiSource exists', !!(F && F.refreshApiSource));

        if (D && D.loadApiConfig) {
            var api = D.loadApiConfig();
            assert('default API type is image', api.apiType === 'image', JSON.stringify(api));
            assert('default API has source arrays', Array.isArray(api.imageSources) && Array.isArray(api.jsonSources));
            assert('API refresh supports every-new-tab sentinel', [-1, 0, 86400000, 259200000, 604800000].indexOf(api.refreshIntervalMs) !== -1);
        }

        if (F && F.resolveJsonPath) {
            var sample = { data: { images: [{ url: 'https://example.com/a.jpg' }] } };
            assert('JSON path supports dot and array indexes', F.resolveJsonPath(sample, 'data.images[0].url') === 'https://example.com/a.jpg');
            assert('JSON path returns empty for missing path', F.resolveJsonPath(sample, 'data.images[1].url') === '');
        }

        if (F && F.findApiImageUrl) {
            assert('automatic JSON image detection finds imageUrl', F.findApiImageUrl({ imageUrl: 'https://example.com/auto.jpg' }) === 'https://example.com/auto.jpg');
            assert('automatic JSON image detection finds nested url', F.findApiImageUrl({ data: { image: { url: 'https://example.com/nested.jpg' } } }) === 'https://example.com/nested.jpg');
        }

        if (F && F.testApiSource) {
            var originalFetch = window.fetch;
            var png = await colorBlob('#4488ff');
            window.fetch = function (url) {
                if (String(url).indexOf('/json') !== -1) {
                    return Promise.resolve(new Response(JSON.stringify({ data: { image: { url: 'https://example.com/image.png' } } }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
                if (String(url).indexOf('/image.png') !== -1 || String(url).indexOf('/direct') !== -1) {
                    return Promise.resolve(new Response(png, {
                        status: 200,
                        headers: { 'Content-Type': 'image/png' }
                    }));
                }
                if (String(url).indexOf('/private') !== -1) {
                    return Promise.resolve(new Response('forbidden', { status: 403 }));
                }
                return Promise.resolve(new Response('not an image', {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain' }
                }));
            };

            var jsonResult = await F.testApiSource({ id: 'j1', name: 'JSON', url: 'https://example.com/json', jsonPath: 'data.image.url' }, 'json');
            assert('JSON API test returns blob and image URL', !!(jsonResult.blob && jsonResult.imageUrl === 'https://example.com/image.png'));

            var imageResult = await F.testApiSource({ id: 'i1', name: 'Image', url: 'https://example.com/direct' }, 'image');
            assert('image API test returns blob', !!(imageResult.blob && imageResult.blob.type === 'image/png'), imageResult.blob && imageResult.blob.type);

            try {
                await F.testApiSource({ id: 'p1', name: 'Private', url: 'https://example.com/private' }, 'image');
                assert('auth failure rejects', false, 'expected rejection');
            } catch (err) {
                assert('auth failure has API_AUTH_REQUIRED code', err && err.code === 'API_AUTH_REQUIRED', err && err.code);
            }

            window.fetch = originalFetch;
        }

        if (window.SettingsPanel && window.SettingsPanel.ensureFull) {
            await window.SettingsPanel.ensureFull();
            if (window.SettingsPanelFull && window.SettingsPanelFull.openModal) {
                var before = JSON.stringify(D.loadWallpaper());
                window.SettingsPanelFull.openModal();
                await wait(0);
                var wallpaperTab = document.querySelector('.modal-tab[data-tab="wallpaper"]');
                if (wallpaperTab) wallpaperTab.click();
                await wait(0);
                var apiDrawerHeader = document.querySelector('.source-drawer[data-source="api"] .source-drawer-header');
                if (apiDrawerHeader) apiDrawerHeader.click();
                await wait(0);
                assert('wallpaper source click does not persist immediately', JSON.stringify(D.loadWallpaper()) === before);
                assert('wallpaper apply button exists', !!document.getElementById('wallpaperApplyBtn'));
                assert('wallpaper apply button is disabled without valid change', document.getElementById('wallpaperApplyBtn').disabled === true);
            }
        }

        var failed = results.filter(function (r) { return !r.passed; });
        console.log('[API wallpaper test] ' + (failed.length ? 'FAILED ' + failed.length : 'ALL PASSED'));
        window.__apiWallpaperTestResults = results;
    }

    run().catch(function (err) {
        console.error('[API wallpaper test] fatal', err);
    });
})();
```

- [ ] **Step 2: Run the script before implementation**

Open `index.html` in a browser, paste the script into DevTools console, and run it.

Expected now: failures for missing `loadApiConfig`, `resolveJsonPath`, `testApiSource`, `refreshApiSource`, and draft apply UI.

- [ ] **Step 3: Commit the failing test script**

```bash
git add docs/ai-tasks/20260517-api-wallpaper-test.js
git commit -m "test: add api wallpaper regression script"
```

---

### Task 2: Normalize API And RSS Test State In Data Model

**Files:**
- Modify: `js/wallpaper/data.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Update `DEFAULT_WALLPAPER.providers.api.config`**

Replace the existing API config object with:

```js
api: {
    config: {
        apiType: 'image',
        activeImageSourceId: '',
        activeJsonSourceId: '',
        refreshIntervalMs: 86400000,
        imageSources: [],
        jsonSources: []
    },
    state: { lastCheckedAt: 0, lastSuccessAt: 0, lastError: '', lastSourceId: '', lastImageUrl: '' }
}
```

- [ ] **Step 2: Add field-hash and test-state helpers near `normalizeRssSource()`**

Add:

```js
function sourceTest(status, fieldHash, testedAt, imageUrl, error) {
    return {
        status: status === 'passed' || status === 'failed' ? status : 'untested',
        fieldHash: String(fieldHash || ''),
        testedAt: parseInt(testedAt, 10) || 0,
        imageUrl: String(imageUrl || ''),
        error: String(error || '')
    };
}

function stableHash(value) {
    var str = String(value || '');
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}

function rssFieldHash(source) {
    return stableHash(String(source && source.url || '').trim());
}

function apiFieldHash(source, apiType) {
    var url = String(source && source.url || '').trim();
    var path = apiType === 'json' ? String(source && source.jsonPath || '').trim() : '';
    return stableHash(apiType + '|' + url + '|' + path);
}

function isTestPassed(source, expectedHash) {
    return !!(source && source.test && source.test.status === 'passed' && source.test.fieldHash === expectedHash);
}
```

- [ ] **Step 3: Preserve RSS test state in `normalizeRssSource()`**

Update the return object so it includes:

```js
test: sourceTest(
    source.test && source.test.status,
    source.test && source.test.fieldHash,
    source.test && source.test.testedAt,
    source.test && source.test.imageUrl,
    source.test && source.test.error
)
```

- [ ] **Step 4: Add API source normalizers**

Add:

```js
function normalizeApiSource(source, index, apiType) {
    source = source || {};
    var id = String(source.id || ('api-' + apiType + '-' + index)).trim();
    var normalized = {
        id: id,
        name: String(source.name || source.url || (apiType === 'json' ? 'JSON API' : 'Image API')).trim().slice(0, 80),
        url: String(source.url || '').trim(),
        test: sourceTest(
            source.test && source.test.status,
            source.test && source.test.fieldHash,
            source.test && source.test.testedAt,
            source.test && source.test.imageUrl,
            source.test && source.test.error
        )
    };
    if (apiType === 'json') normalized.jsonPath = String(source.jsonPath || '').trim();
    return normalized;
}

function normalizeApiConfig(config) {
    var defaults = clone(DEFAULT_WALLPAPER.providers.api.config);
    var merged = mergeDefaults(config || {}, defaults);
    merged.apiType = merged.apiType === 'json' ? 'json' : 'image';
    merged.imageSources = (merged.imageSources || []).map(function (source, index) {
        return normalizeApiSource(source, index, 'image');
    }).filter(function (source, index, list) {
        return source.id && source.url && list.findIndex(function (item) { return item.id === source.id; }) === index;
    }).slice(0, 5);
    merged.jsonSources = (merged.jsonSources || []).map(function (source, index) {
        return normalizeApiSource(source, index, 'json');
    }).filter(function (source, index, list) {
        return source.id && source.url && list.findIndex(function (item) { return item.id === source.id; }) === index;
    }).slice(0, 5);
    var allowedIntervals = [-1, 0, 86400000, 259200000, 604800000];
    if (allowedIntervals.indexOf(parseInt(merged.refreshIntervalMs, 10)) === -1) merged.refreshIntervalMs = defaults.refreshIntervalMs;
    else merged.refreshIntervalMs = parseInt(merged.refreshIntervalMs, 10);
    if (!merged.imageSources.some(function (source) { return source.id === merged.activeImageSourceId; })) {
        merged.activeImageSourceId = merged.imageSources[0] ? merged.imageSources[0].id : '';
    }
    if (!merged.jsonSources.some(function (source) { return source.id === merged.activeJsonSourceId; })) {
        merged.activeJsonSourceId = merged.jsonSources[0] ? merged.jsonSources[0].id : '';
    }
    return merged;
}
```

- [ ] **Step 5: Normalize API config in `loadWallpaper()` and `saveWallpaper()`**

After RSS normalization in `loadWallpaper()`, add:

```js
_wallpaperCache.providers.api.config = normalizeApiConfig(_wallpaperCache.providers.api.config);
```

In `saveWallpaper(model)`, normalize both RSS and API config before writing:

```js
_wallpaperCache = mergeDefaults(model, DEFAULT_WALLPAPER);
_wallpaperCache.activeSource = normalizeSource(_wallpaperCache.activeSource);
_wallpaperCache.providers.rss.config = normalizeRssConfig(_wallpaperCache.providers.rss.config);
_wallpaperCache.providers.api.config = normalizeApiConfig(_wallpaperCache.providers.api.config);
return writeJSON(KEYS.WALLPAPER, _wallpaperCache);
```

- [ ] **Step 6: Add API config helpers**

Add:

```js
function loadApiConfig() {
    return loadWallpaper().providers.api.config;
}

function saveApiConfig(config) {
    updateWallpaper(function (model) {
        model.providers.api.config = normalizeApiConfig(config);
    });
}

function activeApiSource(config) {
    config = normalizeApiConfig(config || loadApiConfig());
    var list = config.apiType === 'json' ? config.jsonSources : config.imageSources;
    var activeId = config.apiType === 'json' ? config.activeJsonSourceId : config.activeImageSourceId;
    return list.filter(function (source) { return source.id === activeId; })[0] || list[0] || null;
}
```

- [ ] **Step 7: Export the new helpers**

Add these to `window.WallpaperData`:

```js
rssFieldHash: rssFieldHash,
apiFieldHash: apiFieldHash,
isTestPassed: isTestPassed,
normalizeSource: normalizeSource,
loadApiConfig: loadApiConfig,
saveApiConfig: saveApiConfig,
activeApiSource: activeApiSource,
normalizeApiConfig: normalizeApiConfig,
```

- [ ] **Step 8: Run the regression script**

Run `docs/ai-tasks/20260517-api-wallpaper-test.js` in the browser console.

Expected now: API data helper assertions pass; fetch and UI assertions still fail.

- [ ] **Step 9: Commit**

```bash
git add js/wallpaper/data.js
git commit -m "feat: add api wallpaper data model"
```

---

### Task 3: Add Provider Cache Cleanup Helpers

**Files:**
- Modify: `js/wallpaper/data.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Add provider ID helpers near `isRssId()`**

Add:

```js
function isUploadId(id) {
    return !!(id && id !== 'bing' && id !== 'api' && !isRssId(id) && String(id).indexOf('folder:') !== 0);
}

function isFolderId(id) {
    return !!(id && String(id).indexOf('folder:') === 0);
}

function hasSourceCache(source) {
    source = normalizeSource(source);
    var order = loadWallpaper().cache.order || [];
    var thumbs = loadThumbs();
    if (source === 'upload') return order.some(isUploadId);
    if (source === 'folder') return order.some(isFolderId) || !!loadWallpaper().providers.folder.state.pathLabel;
    if (source === 'rss') return order.some(isRssId);
    if (source === 'api') return !!(thumbs.api || loadWallpaper().providers.api.state.lastImageUrl);
    return false;
}
```

- [ ] **Step 2: Add cleanup helper**

Add:

```js
function clearWallpaperSourceCache(source) {
    source = normalizeSource(source);
    var model = loadWallpaper();
    var order = model.cache.order || [];
    var meta = model.cache.meta || {};
    var thumbs = loadThumbs();
    var blurThumbs = loadBlurThumbs();
    var idbDeletes = [];

    function deleteThumb(id) {
        delete thumbs[id];
        delete blurThumbs[id];
        delete meta[id];
    }

    if (source === 'bing') return Promise.resolve(false);

    if (source === 'upload') {
        var uploadIds = order.filter(isUploadId);
        model.cache.order = order.filter(function (id) { return !isUploadId(id); });
        uploadIds.forEach(function (id) {
            deleteThumb(id);
            idbDeletes.push(imgKey(id));
        });
    } else if (source === 'folder') {
        model.cache.order = order.filter(function (id) { return !isFolderId(id); });
        Object.keys(thumbs).forEach(function (id) { if (isFolderId(id)) deleteThumb(id); });
        model.providers.folder.state = {};
        idbDeletes.push(DB.FOLDER_HANDLE, DB.FOLDER_FILES);
    } else if (source === 'rss') {
        var rssIds = order.filter(isRssId);
        model.cache.order = order.filter(function (id) { return !isRssId(id); });
        rssIds.forEach(function (id) { deleteThumb(id); });
        model.providers.rss.state.lastImageUrl = '';
        model.providers.rss.state.lastError = '';
        saveWallpaper(model);
        saveThumbs(thumbs);
        saveBlurThumbs(blurThumbs);
        saveMeta(meta);
        return idbDeleteMatching(function (key) {
            return String(key).indexOf(DB.RSS_PREFIX) === 0;
        }).then(function () {
            clearCaches();
            return true;
        });
    } else if (source === 'api') {
        model.providers.api.state = mergeDefaults({}, DEFAULT_WALLPAPER.providers.api.state);
        deleteThumb('api');
        idbDeletes.push(DB.API_BLOB);
    }

    if (!model.cache.order.length) model.cache.order = ['bing'];
    model.cache.index = Math.min(model.cache.index || 0, Math.max(model.cache.order.length - 1, 0));
    model.cache.meta = meta;
    saveWallpaper(model);
    saveThumbs(thumbs);
    saveBlurThumbs(blurThumbs);
    saveMeta(meta);

    return idbDeleteMany(idbDeletes).then(function () {
        clearCaches();
        return true;
    });
}
```

- [ ] **Step 3: Export cleanup helpers**

Add:

```js
isUploadId: isUploadId,
isFolderId: isFolderId,
hasSourceCache: hasSourceCache,
clearWallpaperSourceCache: clearWallpaperSourceCache,
```

- [ ] **Step 4: Verify safe cleanup manually**

In the browser console, create a fake API thumbnail and state, then run:

```js
WallpaperData.updateWallpaper(function (m) {
  m.providers.api.state.lastImageUrl = 'https://example.com/a.jpg';
});
var thumbs = WallpaperData.loadThumbs();
thumbs.api = 'url(data:image/png;base64,AA==)';
WallpaperData.saveThumbs(thumbs);
WallpaperData.hasSourceCache('api');
```

Expected: `true`.

Then run:

```js
WallpaperData.clearWallpaperSourceCache('api').then(function () {
  console.log(WallpaperData.hasSourceCache('api'), WallpaperData.loadThumbs().api);
});
```

Expected: `false undefined`.

- [ ] **Step 5: Commit**

```bash
git add js/wallpaper/data.js
git commit -m "feat: add wallpaper source cache cleanup"
```

---

### Task 4: Add API Fetch, JSON Path, And Test Helpers

**Files:**
- Modify: `js/wallpaper/fetch.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Add API error helper**

Near `rssError()`, add:

```js
function apiError(code, message) {
    var err = new Error(message);
    err.code = code;
    return err;
}
```

- [ ] **Step 2: Add JSON path resolver**

Add:

```js
function resolveJsonPath(data, path) {
    if (!path) return '';
    var parts = String(path).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    var current = data;
    for (var i = 0; i < parts.length; i++) {
        if (current === null || current === undefined) return '';
        current = current[parts[i]];
    }
    return typeof current === 'string' ? current.trim() : '';
}
```

- [ ] **Step 3: Add automatic image URL finder**

Add:

```js
function findApiImageUrl(data) {
    var seen = [];
    var preferred = ['url', 'imageUrl', 'image_url', 'src', 'image', 'wallpaper'];

    function valid(value) {
        return typeof value === 'string' && isHttpUrl(value) && /\.(avif|bmp|gif|jpe?g|png|webp)(\?|#|$)/i.test(value);
    }

    function walk(value, depth) {
        if (!value || depth > 5 || seen.indexOf(value) !== -1) return '';
        if (valid(value)) return value;
        if (typeof value !== 'object') return '';
        seen.push(value);
        for (var p = 0; p < preferred.length; p++) {
            var key = preferred[p];
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                var direct = walk(value[key], depth + 1);
                if (direct) return direct;
            }
        }
        var keys = Array.isArray(value) ? value.map(function (_, index) { return index; }) : Object.keys(value);
        for (var i = 0; i < keys.length; i++) {
            var found = walk(value[keys[i]], depth + 1);
            if (found) return found;
        }
        return '';
    }

    return walk(data, 0);
}
```

- [ ] **Step 4: Add API response readers**

Add:

```js
function classifyFetchError(err) {
    var message = err && err.message ? err.message : String(err || '');
    if (err && err.code === 'RSS_PERMISSION_DENIED') return apiError('API_CORS_OR_NETWORK', message || 'permission denied');
    if (/HTTP 401|HTTP 403/.test(message)) return apiError('API_AUTH_REQUIRED', message);
    if (/HTTP/.test(message)) return apiError('API_FETCH_FAILED', message);
    if (message === 'Failed to fetch') return apiError('API_CORS_OR_NETWORK', message);
    if (message === 'The operation was aborted.' || message === 'AbortError' || message === 'signal timed out') return apiError('API_TIMEOUT', message);
    return err;
}

function fetchApiResponse(url, timeoutMs) {
    if (!isHttpUrl(url)) return Promise.reject(apiError('INVALID_API_URL', 'invalid url'));
    return fetchWithWebFallback(url, timeoutMs || 8000, function (response) {
        return response;
    }).catch(function (err) {
        throw classifyFetchError(err);
    });
}

function blobFromImageResponse(response, imageUrl) {
    var contentType = response.headers.get('Content-Type') || '';
    if (contentType.indexOf('image/') !== 0) throw apiError('API_NOT_IMAGE', 'response is not an image');
    return response.blob().then(function (blob) {
        if (!blob || !blob.size) throw apiError('API_IMAGE_DOWNLOAD_FAILED', 'empty image');
        return {
            ok: true,
            imageUrl: imageUrl || response.url || '',
            blob: blob,
            mime: blob.type || contentType || '',
            finalUrl: response.url || imageUrl || ''
        };
    });
}
```

- [ ] **Step 5: Add API test function**

Add:

```js
function testApiSource(source, apiType) {
    if (!source || !isHttpUrl(source.url)) return Promise.reject(apiError('INVALID_API_URL', 'invalid url'));
    apiType = apiType === 'json' ? 'json' : 'image';
    if (apiType === 'image') {
        return fetchApiResponse(source.url, 8000).then(function (response) {
            return blobFromImageResponse(response, response.url || source.url);
        });
    }
    return fetchApiResponse(source.url, 8000).then(function (response) {
        return response.text();
    }).then(function (text) {
        var data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw apiError('API_JSON_PARSE_FAILED', 'json parse failed');
        }
        var imageUrl = resolveJsonPath(data, source.jsonPath || '') || findApiImageUrl(data);
        if (!imageUrl || !isHttpUrl(imageUrl)) throw apiError('API_JSON_PATH_FAILED', 'image url not found');
        return fetchApiResponse(imageUrl, 8000).then(function (imageResponse) {
            return blobFromImageResponse(imageResponse, imageUrl);
        });
    });
}
```

- [ ] **Step 6: Add API cache function and refresh function**

Add:

```js
function cacheApiResult(source, apiType, result) {
    var thumbs = D.loadThumbs();
    var meta = D.loadMeta();
    var blob = result.blob;
    var imageUrl = result.imageUrl || result.finalUrl || source.url;
    var objectUrl = URL.createObjectURL(blob);
    return S.thumbnail(objectUrl).then(function (thumb) {
        URL.revokeObjectURL(objectUrl);
        if (!thumb) throw apiError('API_IMAGE_DOWNLOAD_FAILED', 'thumbnail failed');
        return D.idbPut(D.DB.API_BLOB, D.imageRecord(blob, source.name || 'api')).then(function () {
            thumbs.api = thumb;
            meta.api = {
                sourceId: source.id,
                sourceName: source.name,
                apiType: apiType,
                imageUrl: imageUrl,
                fetchedAt: Date.now()
            };
            D.saveThumbs(thumbs);
            D.saveMeta(meta);
            D.savePreview(thumb);
            D.updateWallpaper(function (model) {
                model.providers.api.state.lastCheckedAt = Date.now();
                model.providers.api.state.lastSuccessAt = Date.now();
                model.providers.api.state.lastError = '';
                model.providers.api.state.lastSourceId = source.id;
                model.providers.api.state.lastImageUrl = imageUrl;
            });
            return { ok: true, blob: blob, thumb: thumb, imageUrl: imageUrl };
        });
    }, function (err) {
        URL.revokeObjectURL(objectUrl);
        throw err;
    });
}

function refreshApiSource(source, apiType) {
    return testApiSource(source, apiType).then(function (result) {
        return cacheApiResult(source, apiType, result);
    }).catch(function (err) {
        D.updateWallpaper(function (model) {
            model.providers.api.state.lastCheckedAt = Date.now();
            model.providers.api.state.lastError = err && err.message ? err.message : String(err || 'API refresh failed');
        });
        throw err;
    });
}
```

- [ ] **Step 7: Export the API helpers**

Add to `window.WallpaperFetch`:

```js
apiError: apiError,
resolveJsonPath: resolveJsonPath,
findApiImageUrl: findApiImageUrl,
testApiSource: testApiSource,
cacheApiResult: cacheApiResult,
refreshApiSource: refreshApiSource
```

- [ ] **Step 8: Run the regression script**

Run `docs/ai-tasks/20260517-api-wallpaper-test.js` in the browser console.

Expected now: data and fetch assertions pass; UI draft assertions still fail.

- [ ] **Step 9: Commit**

```bash
git add js/wallpaper/fetch.js
git commit -m "feat: add api wallpaper fetch helpers"
```

---

### Task 5: Introduce Wallpaper Draft State In Settings Panel

**Files:**
- Modify: `js/settings-panel.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Add draft module state near `pendingRssWallpaperApply`**

Add:

```js
var wallpaperDraft = null;
var wallpaperDraftOriginal = '';
var wallpaperDraftApiTestResult = null;
var wallpaperDraftRssTestResult = null;
```

- [ ] **Step 2: Add clone and draft helpers near `displayMode()` or before wallpaper builders**

Add:

```js
function clonePlain(value) {
    return JSON.parse(JSON.stringify(value || {}));
}

function openWallpaperDraft() {
    wallpaperDraft = clonePlain(D.loadWallpaper());
    wallpaperDraft.providers.rss.config = D.loadRssConfig();
    wallpaperDraft.providers.api.config = D.loadApiConfig();
    wallpaperDraftOriginal = JSON.stringify(wallpaperDraft);
    wallpaperDraftApiTestResult = null;
    wallpaperDraftRssTestResult = null;
    return wallpaperDraft;
}

function currentWallpaperDraft() {
    if (!wallpaperDraft) return openWallpaperDraft();
    return wallpaperDraft;
}

function draftActiveSource() {
    return D.compatMode ? D.compatMode(currentWallpaperDraft().activeSource) : currentWallpaperDraft().activeSource;
}

function wallpaperDraftChanged() {
    return !!wallpaperDraft && JSON.stringify(wallpaperDraft) !== wallpaperDraftOriginal;
}

function selectedDraftRssSource() {
    var config = currentWallpaperDraft().providers.rss.config;
    return config.sources.filter(function (source) { return source.id === config.activeSourceId; })[0] || config.sources[0] || null;
}

function selectedDraftApiSource() {
    var config = currentWallpaperDraft().providers.api.config;
    return D.activeApiSource ? D.activeApiSource(config) : null;
}
```

- [ ] **Step 3: Add validation helper**

Add:

```js
function validateWallpaperDraft() {
    var draft = currentWallpaperDraft();
    var source = D.compatMode ? D.compatMode(draft.activeSource) : draft.activeSource;
    if (!wallpaperDraftChanged()) return { valid: false, reason: tr('wallpaperApplyNoChanges', '没有未应用更改') };
    if (source === 'bing' || source === 'local') return { valid: true, reason: '' };
    if (source === 'folder') return { valid: false, reason: tr('folderNeedsValidSelection', '请选择有效文件夹') };
    if (source === 'rss') {
        var rss = selectedDraftRssSource();
        var rssHash = D.rssFieldHash(rss);
        if (!D.isTestPassed(rss, rssHash)) return { valid: false, reason: tr('rssNeedsTest', '当前 RSS 源需要测试通过') };
        return { valid: true, reason: '' };
    }
    if (source === 'api') {
        var api = selectedDraftApiSource();
        var apiType = draft.providers.api.config.apiType;
        var apiHash = D.apiFieldHash(api, apiType);
        if (!D.isTestPassed(api, apiHash)) return { valid: false, reason: tr('apiNeedsTest', '当前 API 源需要测试通过') };
        if (!wallpaperDraftApiTestResult) return { valid: false, reason: tr('apiNeedsFreshTest', '请重新测试当前 API 源') };
        return { valid: true, reason: '' };
    }
    return { valid: false, reason: tr('sourcePendingHint', '这个来源的配置正在接入中') };
}
```

- [ ] **Step 4: Initialize draft without discarding in-tab edits**

In `buildWallpaperHTML()`, call this before reading draft state:

```js
if (!wallpaperDraft) openWallpaperDraft();
```

Do not call `openWallpaperDraft()` unconditionally during `invalidateWallpaperTab()`. Re-rendering the wallpaper tab after adding a source, testing a source, or switching API type must preserve the current draft.

- [ ] **Step 5: Clear stale drafts when closing the modal**

In `closeModal(options)`, after the close animation state is applied and without saving changes, add:

```js
wallpaperDraft = null;
wallpaperDraftOriginal = '';
wallpaperDraftApiTestResult = null;
wallpaperDraftRssTestResult = null;
```

- [ ] **Step 6: Stop calling `applyPendingRssWallpaper()` from modal close**

Remove or bypass existing calls that apply RSS on `closeSettings()` and `closeModal()`. Keep `applyPendingRssWallpaper()` only until later tasks remove its callers.

- [ ] **Step 7: Run regression script**

Expected now: source clicks can be changed to draft-only in later tasks; this task may still fail source click tests until Task 6.

- [ ] **Step 8: Commit**

```bash
git add js/settings-panel.js
git commit -m "refactor: add wallpaper settings draft state"
```

---

### Task 6: Rebuild Wallpaper Tab Shell And Draft Apply Footer

**Files:**
- Modify: `js/settings-panel.js`
- Modify: `css/settings.css`
- Modify: `js/languages.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Add apply footer HTML builder**

Add in `settings-panel.js`:

```js
function wallpaperApplyFooterHTML() {
    var validation = validateWallpaperDraft();
    return '<div class="wallpaper-apply-footer">' +
        '<div class="wallpaper-apply-status" id="wallpaperApplyStatus">' + escapeHtml(validation.reason || tr('wallpaperApplyReady', '可以应用配置')) + '</div>' +
        '<button id="wallpaperApplyBtn" class="primary-action" type="button"' + (validation.valid ? '' : ' disabled') + '>' + tr('wallpaperApply', '应用配置') + '</button>' +
        '</div>';
}

function refreshWallpaperApplyFooter() {
    var status = document.getElementById('wallpaperApplyStatus');
    var button = document.getElementById('wallpaperApplyBtn');
    if (!status || !button) return;
    var validation = validateWallpaperDraft();
    status.textContent = validation.reason || tr('wallpaperApplyReady', '可以应用配置');
    button.disabled = !validation.valid;
}
```

- [ ] **Step 2: Replace `buildWallpaperHTML()` shell**

Wrap the existing source accordion in:

```js
return '<div class="wallpaper-tab-shell">' +
    '<div class="wallpaper-tab-header"><h2>' + tr('tabWallpaper', '壁纸来源') + '</h2><p>' + modalCopy('modalSubtitleWallpaper', '五个来源保持各自的识别色，当前来源展开配置。') + '</p></div>' +
    '<div class="wallpaper-tab-body"><div class="source-accordion">' + drawers + '</div><div class="wallpaper-reset-row"><button class="danger-action" id="wallpaperResetBtn" type="button">' + tr('wallpaperResetDefaults', '恢复默认壁纸设置') + '</button></div></div>' +
    wallpaperApplyFooterHTML() +
    '</div>';
```

Do not call `buildPageShell()` for the wallpaper tab after this change; the wallpaper tab needs its own fixed header/body/footer.

- [ ] **Step 3: Add footer event binding**

In `bindWallpaperEvents()`, bind:

```js
var applyBtn = modalContent.querySelector('#wallpaperApplyBtn');
if (applyBtn) applyBtn.addEventListener('click', applyWallpaperDraft);
```

`applyWallpaperDraft` is added in Task 8. For this task, add a temporary function that prevents runtime errors:

```js
function applyWallpaperDraft() {
    refreshWallpaperApplyFooter();
}
```

- [ ] **Step 4: Add CSS for fixed wallpaper shell**

Add to `css/settings.css`:

```css
.wallpaper-tab-shell {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    min-height: 100%;
    max-height: calc(100vh - 120px);
}

.wallpaper-tab-header {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 0 0 14px;
    background: var(--settings-bg, rgba(18, 18, 22, 0.92));
}

.wallpaper-tab-header h2 {
    margin: 0 0 6px;
}

.wallpaper-tab-header p {
    margin: 0;
    color: var(--text-muted);
}

.wallpaper-tab-body {
    min-height: 0;
    overflow: auto;
    padding-right: 4px;
}

.wallpaper-apply-footer {
    position: sticky;
    bottom: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 0 0;
    background: var(--settings-bg, rgba(18, 18, 22, 0.92));
}

.wallpaper-apply-status {
    min-width: 0;
    color: var(--text-muted);
    font-size: 13px;
}

.primary-action:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
```

- [ ] **Step 5: Add language keys**

Add English and Chinese keys in `js/languages.js` near existing RSS keys:

```js
wallpaperApply: 'Apply configuration',
wallpaperApplyReady: 'Ready to apply',
wallpaperApplyNoChanges: 'No unapplied changes',
rssNeedsTest: 'Test the current RSS source first',
apiNeedsTest: 'Test the current API source first',
apiNeedsFreshTest: 'Retest the current API source',
folderNeedsValidSelection: 'Select a valid folder first',
```

Chinese:

```js
wallpaperApply: '应用配置',
wallpaperApplyReady: '可以应用配置',
wallpaperApplyNoChanges: '没有未应用更改',
rssNeedsTest: '当前 RSS 源需要测试通过',
apiNeedsTest: '当前 API 源需要测试通过',
apiNeedsFreshTest: '请重新测试当前 API 源',
folderNeedsValidSelection: '请选择有效文件夹',
```

- [ ] **Step 6: Run the regression script**

Expected: apply button exists and fixed-shell DOM exists. Source click persistence still changes until Task 7.

- [ ] **Step 7: Commit**

```bash
git add js/settings-panel.js css/settings.css js/languages.js
git commit -m "feat: add wallpaper apply footer"
```

---

### Task 7: Convert RSS And Source Selection To Draft-Only

**Files:**
- Modify: `js/settings-panel.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Change source drawer click behavior**

In `bindWallpaperEvents()`, replace immediate `D.setActiveSource`, `resetToBing`, `markRssWallpaperApplyPending`, and `window.reloadWallpaper` calls with draft updates:

```js
var draft = currentWallpaperDraft();
draft.activeSource = clickedSource === 'upload' ? 'upload' : clickedSource;
currentMode = clickedSource === 'upload' ? 'local' : clickedSource;
modalContent.querySelectorAll('.source-drawer').forEach(function (d) {
    d.classList.toggle('active', d.dataset.source === clickedSource);
});
refreshWallpaperApplyFooter();
refreshGallery();
```

- [ ] **Step 2: Make `buildRssConfigHTML()` read draft config**

Change:

```js
var config = D.loadRssConfig();
```

to:

```js
var config = currentWallpaperDraft().providers.rss.config;
```

- [ ] **Step 3: Make RSS radio/select/toggle changes write draft**

In `bindRssConfigEvents()`, replace each `D.loadRssConfig()` and `D.saveRssConfig(next)` mutation with `currentWallpaperDraft().providers.rss.config`.

For radio change:

```js
var next = currentWallpaperDraft().providers.rss.config;
next.activeSourceId = radio.value;
root.querySelectorAll('.rss-source-row').forEach(function (row) {
    row.classList.toggle('selected', row.dataset.rssSource === radio.value);
});
refreshWallpaperApplyFooter();
```

For option changes:

```js
var next = currentWallpaperDraft().providers.rss.config;
if (el === interval) next.refreshIntervalMs = parseInt(el.value, 10) || 0;
if (el === position) next.summaryPosition = el.value;
if (el === mode) next.summaryMode = el.value;
refreshWallpaperApplyFooter();
```

For toggles:

```js
var next = currentWallpaperDraft().providers.rss.config;
if (el === showSummary) next.showSummary = el.checked;
if (el === showLink) next.showLink = el.checked;
refreshWallpaperApplyFooter();
```

- [ ] **Step 4: Make RSS add/delete update draft**

In `onRssConfigClick()`, use:

```js
var config = currentWallpaperDraft().providers.rss.config;
```

When adding a source, push:

```js
config.sources.push({
    id: id,
    name: name || url,
    url: url,
    builtIn: false,
    test: { status: 'untested', fieldHash: '', testedAt: 0, imageUrl: '', error: '' }
});
```

After add/delete, call:

```js
invalidateWallpaperTab();
```

without saving.

- [ ] **Step 5: Update RSS test to write draft test state**

On RSS test success:

```js
source.test = {
    status: 'passed',
    fieldHash: D.rssFieldHash(source),
    testedAt: Date.now(),
    imageUrl: result.first && result.first.imageUrl || '',
    error: ''
};
wallpaperDraftRssTestResult = result;
refreshWallpaperApplyFooter();
```

On failure:

```js
source.test = {
    status: 'failed',
    fieldHash: D.rssFieldHash(source),
    testedAt: Date.now(),
    imageUrl: '',
    error: message
};
refreshWallpaperApplyFooter();
```

- [ ] **Step 6: Run the regression script**

Expected: source click does not persist immediately. RSS red-green apply behavior may still need CSS in Task 9.

- [ ] **Step 7: Commit**

```bash
git add js/settings-panel.js
git commit -m "refactor: make wallpaper source edits draft-only"
```

---

### Task 8: Add Apply Logic And Source Switch Confirmation

**Files:**
- Modify: `js/settings-panel.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Add old-source cleanup check**

Add:

```js
function sourceNeedsDiscardPrompt(previousSource, nextSource) {
    previousSource = D.normalizeSource ? D.normalizeSource(previousSource) : previousSource;
    nextSource = D.normalizeSource ? D.normalizeSource(nextSource) : nextSource;
    if (previousSource === nextSource) return false;
    if (previousSource === 'bing') return false;
    return D.hasSourceCache && D.hasSourceCache(previousSource);
}
```

If `normalizeSource` is not exported, use this local fallback:

```js
function normalizeDraftSource(source) {
    return source === 'local' ? 'upload' : (source || 'bing');
}
```

- [ ] **Step 2: Replace temporary `applyWallpaperDraft()`**

Use:

```js
function applyWallpaperDraft() {
    var validation = validateWallpaperDraft();
    if (!validation.valid) {
        refreshWallpaperApplyFooter();
        return;
    }

    var saved = D.loadWallpaper();
    var draft = currentWallpaperDraft();
    var previousSource = normalizeDraftSource(saved.activeSource);
    var nextSource = normalizeDraftSource(draft.activeSource);

    function finishApply() {
        D.saveWallpaper(draft);
        currentMode = D.compatMode(nextSource);
        wallpaperDraftOriginal = JSON.stringify(draft);
        if (nextSource === 'api' && wallpaperDraftApiTestResult) {
            return F.cacheApiResult(selectedDraftApiSource(), draft.providers.api.config.apiType, wallpaperDraftApiTestResult).then(function () {
                if (window.reloadWallpaper) return window.reloadWallpaper();
            });
        }
        if (nextSource === 'rss' && wallpaperDraftRssTestResult && window.reloadWallpaper) {
            return window.reloadWallpaper();
        }
        if (window.reloadWallpaper) return window.reloadWallpaper();
        return Promise.resolve();
    }

    var applyPromise;
    if (sourceNeedsDiscardPrompt(previousSource, nextSource)) {
        if (!confirm(tr('wallpaperDiscardCacheConfirm', '切换来源会丢弃当前来源已缓存的壁纸数据。继续吗？'))) return;
        applyPromise = D.clearWallpaperSourceCache(previousSource).then(finishApply);
    } else {
        applyPromise = finishApply();
    }

    applyPromise.then(function () {
        openWallpaperDraft();
        invalidateWallpaperTab();
        refreshGallery();
    }).catch(function (err) {
        var status = document.getElementById('wallpaperApplyStatus');
        if (status) status.textContent = err && err.message ? err.message : String(err || 'Apply failed');
    });
}
```

- [ ] **Step 3: Add language key**

Add:

```js
wallpaperDiscardCacheConfirm: 'Switching source will discard cached wallpaper data for the current source. Continue?',
```

Chinese:

```js
wallpaperDiscardCacheConfirm: '切换来源会丢弃当前来源已缓存的壁纸数据。继续吗？',
```

- [ ] **Step 4: Run manual confirmation checks**

In browser console:

```js
WallpaperData.setActiveSource('bing');
```

Open settings, select API, and check that clicking Apply does not show a discard prompt when previous source is Bing.

Then simulate API cache:

```js
WallpaperData.setActiveSource('api');
WallpaperData.updateWallpaper(function (m) { m.providers.api.state.lastImageUrl = 'https://example.com/a.jpg'; });
var thumbs = WallpaperData.loadThumbs(); thumbs.api = 'url(data:image/png;base64,AA==)'; WallpaperData.saveThumbs(thumbs);
```

Open settings, select RSS, click Apply, and verify the discard prompt appears.

- [ ] **Step 5: Commit**

```bash
git add js/settings-panel.js js/languages.js
git commit -m "feat: apply wallpaper drafts explicitly"
```

---

### Task 9: Build API Settings UI

**Files:**
- Modify: `js/settings-panel.js`
- Modify: `css/settings.css`
- Modify: `js/languages.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Add API config HTML builder**

Add:

```js
function apiSourceRowHTML(source, apiType, activeId) {
    var hash = D.apiFieldHash(source, apiType);
    var passed = D.isTestPassed(source, hash);
    var dot = passed ? 'passed' : 'failed';
    var checked = source.id === activeId ? ' checked' : '';
    return '<div class="api-source-row' + (checked ? ' selected' : '') + '" data-api-type="' + apiType + '" data-api-source="' + escapeHtml(source.id) + '">' +
        '<span class="source-status-dot ' + dot + '"></span>' +
        '<label class="api-source-main"><input type="radio" name="apiSource" value="' + escapeHtml(source.id) + '"' + checked + '><span><strong>' + escapeHtml(source.name) + '</strong><small>' + escapeHtml(source.url) + '</small></span></label>' +
        '<button type="button" data-action="test-api">' + tr('apiTest', '测试') + '</button>' +
        '<button type="button" data-action="delete-api" aria-label="' + tr('deleteImage', '删除') + '">×</button>' +
        '</div>';
}

function buildApiConfigHTML() {
    var config = currentWallpaperDraft().providers.api.config;
    var apiType = config.apiType === 'json' ? 'json' : 'image';
    var sources = apiType === 'json' ? config.jsonSources : config.imageSources;
    var activeId = apiType === 'json' ? config.activeJsonSourceId : config.activeImageSourceId;
    var rows = sources.map(function (source) { return apiSourceRowHTML(source, apiType, activeId); }).join('');
    function selected(value, current) { return String(value) === String(current) ? ' selected' : ''; }
    return '<div class="api-config" data-api-type="' + apiType + '">' +
        '<div class="api-type-tabs"><button type="button" data-api-type-tab="image" class="' + (apiType === 'image' ? 'active' : '') + '">' + tr('apiTypeImage', '图片/重定向') + '</button><button type="button" data-api-type-tab="json" class="' + (apiType === 'json' ? 'active' : '') + '">' + tr('apiTypeJson', 'JSON') + '</button></div>' +
        '<div class="api-source-list">' + rows + '</div>' +
        '<div class="api-notice" id="apiNotice" hidden></div>' +
        '<div class="api-add-row"><input id="apiNameInput" type="text" placeholder="' + tr('rssNamePlaceholder', '源名称') + '"><input id="apiUrlInput" type="url" placeholder="https://example.com/wallpaper">' + (apiType === 'json' ? '<input id="apiJsonPathInput" type="text" placeholder="data.image.url">' : '') + '<button id="apiAddBtn" type="button">' + tr('rssAdd', '添加') + '</button></div>' +
        '<div class="api-options">' +
        settingItem(tr('rssRefreshInterval', '自动拉取'), '', '<select id="apiRefreshInterval"><option value="0"' + selected(0, config.refreshIntervalMs) + '>' + tr('rssRefreshOff', '关闭') + '</option><option value="-1"' + selected(-1, config.refreshIntervalMs) + '>' + tr('apiRefreshEveryTab', '每次打开') + '</option><option value="86400000"' + selected(86400000, config.refreshIntervalMs) + '>1 天</option><option value="259200000"' + selected(259200000, config.refreshIntervalMs) + '>3 天</option><option value="604800000"' + selected(604800000, config.refreshIntervalMs) + '>7 天</option></select>', 'setting-compact') +
        '</div>' +
        '</div>';
}
```

- [ ] **Step 2: Use API builder in `buildWallpaperHTML()`**

Replace API unavailable HTML with:

```js
api: buildApiConfigHTML()
```

- [ ] **Step 3: Add API event binding**

Call `bindApiConfigEvents()` from `bindWallpaperEvents()`, then add:

```js
function bindApiConfigEvents() {
    var root = modalContent.querySelector('.api-config');
    if (!root) return;
    root.addEventListener('click', onApiConfigClick);
    root.addEventListener('change', onApiConfigChange);
}
```

- [ ] **Step 4: Add API change handlers**

Add:

```js
function onApiConfigChange(e) {
    var config = currentWallpaperDraft().providers.api.config;
    if (e.target.id === 'apiRefreshInterval') {
        config.refreshIntervalMs = parseInt(e.target.value, 10);
        refreshWallpaperApplyFooter();
        return;
    }
    if (e.target.name === 'apiSource') {
        if (config.apiType === 'json') config.activeJsonSourceId = e.target.value;
        else config.activeImageSourceId = e.target.value;
        wallpaperDraftApiTestResult = null;
        invalidateWallpaperTab();
    }
}
```

- [ ] **Step 5: Add API click handlers**

Add handlers for type tab, add, delete, and test:

```js
function onApiConfigClick(e) {
    var target = e.target;
    var config = currentWallpaperDraft().providers.api.config;
    var apiType = config.apiType === 'json' ? 'json' : 'image';
    if (target.dataset.apiTypeTab) {
        config.apiType = target.dataset.apiTypeTab === 'json' ? 'json' : 'image';
        wallpaperDraftApiTestResult = null;
        invalidateWallpaperTab();
        return;
    }
    if (target.id === 'apiAddBtn') {
        var name = document.getElementById('apiNameInput').value.trim();
        var url = document.getElementById('apiUrlInput').value.trim();
        var pathEl = document.getElementById('apiJsonPathInput');
        var list = apiType === 'json' ? config.jsonSources : config.imageSources;
        if (list.length >= 5) return showApiNotice(tr('apiLimit', '最多 5 个 API 源'), 'error');
        if (!F.isHttpUrl(url)) return showApiNotice(tr('apiInvalidUrl', '请输入 http:// 或 https:// 链接'), 'error');
        var id = apiType + '-' + F.generateId();
        var source = { id: id, name: name || url, url: url, test: { status: 'untested', fieldHash: '', testedAt: 0, imageUrl: '', error: '' } };
        if (apiType === 'json') source.jsonPath = pathEl ? pathEl.value.trim() : '';
        list.push(source);
        if (apiType === 'json') config.activeJsonSourceId = id;
        else config.activeImageSourceId = id;
        wallpaperDraftApiTestResult = null;
        invalidateWallpaperTab();
        return;
    }
    var row = target.closest('.api-source-row');
    if (!row) return;
    var listForRow = row.dataset.apiType === 'json' ? config.jsonSources : config.imageSources;
    var source = listForRow.filter(function (item) { return item.id === row.dataset.apiSource; })[0];
    if (!source) return;
    if (target.dataset.action === 'delete-api') {
        listForRow.splice(listForRow.indexOf(source), 1);
        if (row.dataset.apiType === 'json') config.activeJsonSourceId = listForRow[0] ? listForRow[0].id : '';
        else config.activeImageSourceId = listForRow[0] ? listForRow[0].id : '';
        wallpaperDraftApiTestResult = null;
        invalidateWallpaperTab();
        return;
    }
    if (target.dataset.action === 'test-api') {
        runApiSourceTest(source, row.dataset.apiType, target);
    }
}
```

- [ ] **Step 6: Add API test UI functions**

Add:

```js
function showApiNotice(message, type) {
    var el = document.getElementById('apiNotice');
    if (!el) return;
    el.textContent = message || '';
    el.dataset.type = type || 'info';
    el.hidden = !message;
}

function apiErrorMessage(err) {
    var map = {
        INVALID_API_URL: tr('apiInvalidUrl', '请输入 http:// 或 https:// 链接'),
        API_AUTH_REQUIRED: tr('apiAuthRequired', '该接口可能需要鉴权，当前版本仅支持把 token 放在 URL 参数里的 GET 接口'),
        API_CORS_OR_NETWORK: tr('apiCorsFailed', '请求失败，可能是 CORS、网络或权限限制'),
        API_TIMEOUT: tr('apiTimeout', 'API 请求超时'),
        API_JSON_PARSE_FAILED: tr('apiJsonParseFailed', 'JSON 内容无法解析'),
        API_JSON_PATH_FAILED: tr('apiJsonPathFailed', '没有从 JSON 中找到图片 URL'),
        API_NOT_IMAGE: tr('apiNotImage', '响应不是图片'),
        API_IMAGE_DOWNLOAD_FAILED: tr('apiImageDownloadFailed', '图片下载失败')
    };
    return map[err && err.code] || (err && err.message ? err.message : String(err || 'API failed'));
}

function runApiSourceTest(source, apiType, button) {
    button.disabled = true;
    button.classList.add('testing');
    showApiNotice(tr('rssTesting', '正在测试...'), 'info');
    F.testApiSource(source, apiType).then(function (result) {
        source.test = {
            status: 'passed',
            fieldHash: D.apiFieldHash(source, apiType),
            testedAt: Date.now(),
            imageUrl: result.imageUrl || '',
            error: ''
        };
        wallpaperDraftApiTestResult = result;
        showApiNotice(tr('apiTestOk', '测试通过'), 'success');
        refreshWallpaperApplyFooter();
        invalidateWallpaperTab();
    }).catch(function (err) {
        var message = apiErrorMessage(err);
        source.test = {
            status: 'failed',
            fieldHash: D.apiFieldHash(source, apiType),
            testedAt: Date.now(),
            imageUrl: '',
            error: message
        };
        wallpaperDraftApiTestResult = null;
        showApiNotice(message, 'error');
        refreshWallpaperApplyFooter();
    }).finally(function () {
        button.disabled = false;
        button.classList.remove('testing');
    });
}
```

- [ ] **Step 7: Add API CSS**

Add:

```css
.api-type-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 12px;
}

.api-type-tabs button.active {
    border-color: var(--accent);
    background: rgba(255,255,255,0.12);
}

.api-source-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
}

.source-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #ef4444;
}

.source-status-dot.passed {
    background: #22c55e;
}

.api-source-main {
    min-width: 0;
}

.api-source-main span {
    display: grid;
    gap: 2px;
}

.api-source-main small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-muted);
}

.api-add-row {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr) auto;
    gap: 8px;
    margin-top: 12px;
}

.api-config[data-api-type="json"] .api-add-row {
    grid-template-columns: minmax(0, 0.7fr) minmax(0, 1fr) minmax(0, 0.8fr) auto;
}
```

- [ ] **Step 8: Add language keys**

Add English and Chinese keys for:

```js
apiTest, apiTypeImage, apiTypeJson, apiRefreshEveryTab, apiLimit, apiInvalidUrl, apiAuthRequired, apiCorsFailed, apiTimeout, apiJsonParseFailed, apiJsonPathFailed, apiNotImage, apiImageDownloadFailed, apiTestOk
```

- [ ] **Step 9: Run regression script**

Expected: API UI exists; API test helpers pass; applying still needs Task 10 integration.

- [ ] **Step 10: Commit**

```bash
git add js/settings-panel.js css/settings.css js/languages.js
git commit -m "feat: add api wallpaper settings UI"
```

---

### Task 10: Add API Runtime Loading

**Files:**
- Modify: `js/newtab.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Add active API source helper**

Near `activeRssSource()`, add:

```js
function activeApiSource() {
    var config = D.loadApiConfig();
    return D.activeApiSource ? D.activeApiSource(config) : null;
}
```

- [ ] **Step 2: Add API refresh due helper**

Near `isRssRefreshDue()`, add:

```js
function isApiRefreshDue(config, state) {
    var interval = parseInt(config.refreshIntervalMs, 10);
    if (interval === 0) return false;
    if (interval === -1) return true;
    return !state.lastSuccessAt || Date.now() - state.lastSuccessAt >= interval;
}
```

- [ ] **Step 3: Add cached API loader**

Near `tryLoadRssWallpaper()`, add:

```js
function tryLoadApiWallpaper() {
    hideRssOverlay();
    SP.setCurrentMode('api');
    var thumbs = D.loadThumbs();
    if (thumbs.api) D.savePreview(thumbs.api);
    return D.idbGet(D.DB.API_BLOB).then(function (record) {
        if (!record || !record.blob) return false;
        var blob = record.blob;
        if ((!blob.type || blob.type === '') && record.mime) {
            try { blob = new Blob([blob], { type: record.mime }); } catch (e) { }
        }
        return applyWallpaperRespectingBlur(URL.createObjectURL(blob), 'api').then(function () {
            if (thumbs.api) D.savePreview(thumbs.api);
            cacheBingInBackground();
            return true;
        });
    });
}
```

- [ ] **Step 4: Add background API refresh**

Add:

```js
function refreshApiInBackground(force) {
    var config = D.loadApiConfig();
    var state = D.loadWallpaper().providers.api.state || {};
    if (!force && !isApiRefreshDue(config, state)) return Promise.resolve(false);
    var source = activeApiSource();
    if (!source) return Promise.resolve(false);
    return F.refreshApiSource(source, config.apiType).then(function () {
        return true;
    }).catch(function (err) {
        warn('API', 'refresh failed: ' + (err && err.message ? err.message : err));
        return false;
    });
}
```

- [ ] **Step 5: Integrate API into `loadWallpaper()`**

After the RSS block and before the Bing fallback block, add:

```js
if (lastMode === 'api') {
    return tryLoadApiWallpaper().then(function (loaded) {
        refreshApiInBackground(!loaded).then(function (updated) {
            if (updated && D.compatMode(D.getActiveSource()) === 'api') loadWallpaper();
        });
        if (loaded) return;
        return tryLoadCachedBing(bingBlob, meta, today).then(function (loadedBing) {
            if (!loadedBing) return loadBingFromNetwork(meta, today);
        });
    });
}
```

- [ ] **Step 6: Run browser smoke test**

In console:

```js
WallpaperData.updateWallpaper(function (m) {
  m.activeSource = 'api';
  m.providers.api.config.apiType = 'image';
  m.providers.api.config.imageSources = [{ id: 'demo', name: 'Demo', url: 'https://example.com/direct', test: { status: 'passed', fieldHash: WallpaperData.apiFieldHash({ url: 'https://example.com/direct' }, 'image'), testedAt: Date.now(), imageUrl: 'https://example.com/direct', error: '' } }];
  m.providers.api.config.activeImageSourceId = 'demo';
  m.providers.api.config.refreshIntervalMs = 0;
});
reloadWallpaper();
```

Expected: no exception; if no API blob exists, Bing fallback remains visible.

- [ ] **Step 7: Commit**

```bash
git add js/newtab.js
git commit -m "feat: load api wallpaper at runtime"
```

---

### Task 11: Complete Apply Reuse For API Test Result

**Files:**
- Modify: `js/settings-panel.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Ensure API apply stores fresh test state**

Before `D.saveWallpaper(draft)` in `finishApply()`, ensure the selected API source contains the successful test state:

```js
if (nextSource === 'api') {
    var apiConfig = draft.providers.api.config;
    var apiSource = selectedDraftApiSource();
    if (apiSource && wallpaperDraftApiTestResult) {
        apiSource.test = {
            status: 'passed',
            fieldHash: D.apiFieldHash(apiSource, apiConfig.apiType),
            testedAt: Date.now(),
            imageUrl: wallpaperDraftApiTestResult.imageUrl || '',
            error: ''
        };
    }
}
```

- [ ] **Step 2: Ensure RSS apply stores draft test state**

No extra blob write is needed for RSS unless a refresh result has been cached. Ensure `D.saveWallpaper(draft)` persists RSS source test fields.

- [ ] **Step 3: Verify API apply reuses test image**

In browser console, stub `window.fetch` as in the regression script, add a JSON API source, test it, click Apply, and verify:

```js
WallpaperData.idbGet(WallpaperData.DB.API_BLOB).then(function (record) {
  console.log(!!(record && record.blob));
});
```

Expected: `true`.

- [ ] **Step 4: Run regression script**

Expected: all current assertions pass.

- [ ] **Step 5: Commit**

```bash
git add js/settings-panel.js
git commit -m "feat: reuse api test image on apply"
```

---

### Task 12: Polish RSS/API Status Dots And Validation Text

**Files:**
- Modify: `js/settings-panel.js`
- Modify: `css/settings.css`
- Modify: `js/languages.js`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Add RSS status dots to `buildRssConfigHTML()`**

For each RSS source row, compute:

```js
var passed = D.isTestPassed(source, D.rssFieldHash(source));
var statusClass = passed ? 'passed' : 'failed';
```

Add before the label:

```html
<span class="source-status-dot ${statusClass}"></span>
```

Use string concatenation matching the file's current style.

- [ ] **Step 2: Mark sources red when fields change**

When adding sources, set `test.status` to `untested`. When editing API fields in later enhancement paths, reset:

```js
source.test = { status: 'untested', fieldHash: '', testedAt: 0, imageUrl: '', error: '' };
```

- [ ] **Step 3: Improve apply validation messages**

Make `validateWallpaperDraft()` return these exact cases:

```js
if (source === 'rss' && !selectedDraftRssSource()) return { valid: false, reason: tr('rssNeedsSource', '请添加并选择 RSS 源') };
if (source === 'api' && !selectedDraftApiSource()) return { valid: false, reason: tr('apiNeedsSource', '请添加并选择 API 源') };
```

- [ ] **Step 4: Add missing language keys**

Add English and Chinese keys:

```js
rssNeedsSource, apiNeedsSource
```

- [ ] **Step 5: Run visual checks**

Open settings wallpaper tab and verify:

- Built-in RSS rows are red before testing.
- A successful RSS test turns the row green.
- A successful API test turns the row green.
- Backup red sources do not block applying the currently selected green source.

- [ ] **Step 6: Commit**

```bash
git add js/settings-panel.js css/settings.css js/languages.js
git commit -m "feat: show wallpaper source test status"
```

---

### Task 13: Final Verification And Documentation Sync

**Files:**
- Modify if needed: `.claude/rules/20-wallpaper.md`
- Modify if needed: `.claude/rules/60-settings.md`
- Test: `docs/ai-tasks/20260517-api-wallpaper-test.js`

- [ ] **Step 1: Run static checks**

Run:

```powershell
git diff --check
```

Expected: no whitespace errors.

Run:

```powershell
Select-String -Path 'js\preload.js' -Pattern 'indexedDB','fetch','XMLHttpRequest','canvas','WallpaperData'
```

Expected: no matches.

Run:

```powershell
Select-String -Path 'index.html' -Pattern 'wallpaperBack','preload.js','wallpaperFront','js/wallpaper/data.js','js/wallpaper/show.js','js/wallpaper/fetch.js','js/newtab.js'
```

Expected order: `wallpaperBack`, `preload.js`, `wallpaperFront`, then wallpaper modules and `newtab.js`.

- [ ] **Step 2: Run browser regression script**

Open `index.html`, paste `docs/ai-tasks/20260517-api-wallpaper-test.js`, run it.

Expected: `[API wallpaper test] ALL PASSED`.

- [ ] **Step 3: Manual source-switch checks**

Check:

- Bing to API: no discard prompt.
- Bing to RSS: no discard prompt.
- API with cache to RSS: discard prompt appears.
- Cancel discard prompt: saved config and API cache remain unchanged.
- Confirm discard prompt: API cache is cleared and RSS config applies.
- Upload apply with no images: no file picker opens.
- New tab with upload and no images falls back to built-in background or Bing fallback.

- [ ] **Step 4: Manual API checks**

Check:

- Image/redirect API tab can add 5 sources and rejects a 6th.
- JSON API tab can add 5 sources and rejects a 6th.
- JSON manual path resolves an image.
- JSON automatic detection resolves an image when path is blank.
- `401` or `403` shows the auth-specific message.
- Non-image response shows the non-image message.
- Applying after a successful API test does not issue a second API request during apply.

- [ ] **Step 5: Update rules only if implementation changed canonical behavior**

If implementation differs from `.claude/rules/20-wallpaper.md` or `.claude/rules/60-settings.md`, update those files with concise rules:

- API supports `image` and `json` subtypes.
- API uses one existing `ptab_wallpaper_blob_api` cache.
- Wallpaper tab uses explicit `Apply configuration`.
- Bing cache is retained when leaving Bing.

Do not update rules if they already match the final implementation.

- [ ] **Step 6: Final commit**

If docs were updated:

```bash
git add .claude/rules/20-wallpaper.md .claude/rules/60-settings.md
git commit -m "docs: update wallpaper api rules"
```

If no docs changed, do not create an empty commit.
