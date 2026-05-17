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

    function finish() {
        var failed = results.filter(function (r) { return !r.passed; });
        var summary = {
            total: results.length,
            passed: results.length - failed.length,
            failed: failed.length,
            ok: failed.length === 0
        };
        window.__apiWallpaperTestResults = results;
        window.__apiWallpaperTestSummary = summary;
        console.log('[API wallpaper test] ' + (summary.ok ? 'ALL PASSED' : 'FAILED ' + summary.failed) + ' (' + summary.passed + '/' + summary.total + ')');
    }

    async function run() {
        var D = window.WallpaperData;
        var F = window.WallpaperFetch;

        assert('WallpaperData.loadApiConfig exists', !!(D && D.loadApiConfig));
        assert('WallpaperData.saveApiConfig exists', !!(D && D.saveApiConfig));
        assert('WallpaperData.apiFieldHash exists', !!(D && D.apiFieldHash));
        assert('WallpaperData.hasSourceCache exists', !!(D && D.hasSourceCache));
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

        if (D && D.normalizeApiConfig) {
            var legacyJsonApi = D.normalizeApiConfig({
                url: ' https://example.com/wallpaper.json ',
                jsonPath: ' data.image.url ',
                refreshIntervalMs: -1
            });
            assert('legacy JSON API config migrates to json source', legacyJsonApi.apiType === 'json' &&
                legacyJsonApi.jsonSources.length === 1 &&
                legacyJsonApi.jsonSources[0].url === 'https://example.com/wallpaper.json' &&
                legacyJsonApi.jsonSources[0].jsonPath === 'data.image.url' &&
                legacyJsonApi.activeJsonSourceId === legacyJsonApi.jsonSources[0].id &&
                legacyJsonApi.refreshIntervalMs === -1, JSON.stringify(legacyJsonApi));
            assert('legacy JSON API config drops top-level fields', !Object.prototype.hasOwnProperty.call(legacyJsonApi, 'url') &&
                !Object.prototype.hasOwnProperty.call(legacyJsonApi, 'jsonPath'), JSON.stringify(legacyJsonApi));

            var legacyImageApi = D.normalizeApiConfig({
                url: 'https://example.com/wallpaper.jpg',
                jsonPath: '',
                refreshIntervalMs: 259200000
            });
            assert('legacy image API config migrates to image source', legacyImageApi.apiType === 'image' &&
                legacyImageApi.imageSources.length === 1 &&
                legacyImageApi.imageSources[0].url === 'https://example.com/wallpaper.jpg' &&
                legacyImageApi.activeImageSourceId === legacyImageApi.imageSources[0].id &&
                legacyImageApi.refreshIntervalMs === 259200000, JSON.stringify(legacyImageApi));
            assert('legacy image API config drops top-level fields', !Object.prototype.hasOwnProperty.call(legacyImageApi, 'url') &&
                !Object.prototype.hasOwnProperty.call(legacyImageApi, 'jsonPath'), JSON.stringify(legacyImageApi));

            var clearedLegacyApi = D.normalizeApiConfig(Object.assign({}, legacyJsonApi, {
                imageSources: [],
                jsonSources: [],
                activeImageSourceId: '',
                activeJsonSourceId: ''
            }));
            assert('cleared migrated API config does not recreate legacy source', clearedLegacyApi.imageSources.length === 0 &&
                clearedLegacyApi.jsonSources.length === 0, JSON.stringify(clearedLegacyApi));

            assert('active API source is null without configured sources', D.activeApiSource({
                apiType: 'image',
                imageSources: [],
                jsonSources: []
            }) === null);
        }

        if (D && D.loadWallpaper && D.clearCaches && D.isTestPassed && D.rssFieldHash && D.KEYS) {
            var beforeWallpaper = null;
            try {
                beforeWallpaper = localStorage.getItem(D.KEYS.WALLPAPER);
                D.clearCaches();
                localStorage.setItem(D.KEYS.WALLPAPER, JSON.stringify({
                    providers: {
                        rss: {
                            config: {
                                sources: [{ id: '', name: 'Invalid', url: '', test: { status: 'passed', fieldHash: 'stale' } }]
                            }
                        }
                    }
                }));
                var fallbackRssConfig = D.loadWallpaper().providers.rss.config;
                var fallbackSource = fallbackRssConfig.sources[0];
                assert('RSS fallback sources are normalized with test state', !!(fallbackSource &&
                    fallbackSource.test &&
                    D.isTestPassed(fallbackSource, D.rssFieldHash(fallbackSource)) === false &&
                    fallbackSource.test.status === 'untested'), JSON.stringify(fallbackSource));
            } catch (err) {
                assert('RSS fallback sources are normalized with test state', false, err && (err.code || err.message || String(err)));
            } finally {
                if (beforeWallpaper === null) localStorage.removeItem(D.KEYS.WALLPAPER);
                else localStorage.setItem(D.KEYS.WALLPAPER, beforeWallpaper);
                D.clearCaches();
            }
        }

        if (D && D.hasSourceCache && D.clearWallpaperSourceCache && D.idbPut && D.idbGet && D.idbDelete && D.imageRecord && D.clearCaches && D.KEYS && D.DB) {
            var cacheBeforeWallpaper = null;
            var cacheBeforeThumbs = null;
            var cacheBeforeBlurThumbs = null;
            var cacheBeforeApiRecord = null;
            try {
                cacheBeforeWallpaper = localStorage.getItem(D.KEYS.WALLPAPER);
                cacheBeforeThumbs = localStorage.getItem(D.KEYS.WALLPAPER_THUMBS);
                cacheBeforeBlurThumbs = localStorage.getItem(D.KEYS.WALLPAPER_BLUR_THUMBS);
                cacheBeforeApiRecord = await D.idbGet(D.DB.API_BLOB);

                localStorage.setItem(D.KEYS.WALLPAPER, JSON.stringify({
                    activeSource: 'api',
                    providers: {
                        api: {
                            state: { lastCheckedAt: 1, lastSuccessAt: 1, lastError: '', lastSourceId: 'demo', lastImageUrl: 'https://example.com/api.png' }
                        }
                    },
                    cache: { order: ['bing', 'api'], index: 1, meta: { bing: {}, api: { imageUrl: 'https://example.com/api.png' } } }
                }));
                localStorage.setItem(D.KEYS.WALLPAPER_THUMBS, JSON.stringify({ bing: 'bing-thumb', api: 'api-thumb' }));
                localStorage.setItem(D.KEYS.WALLPAPER_BLUR_THUMBS, JSON.stringify({ api: { blur: 5, thumb: 'api-blur' } }));
                D.clearCaches();
                var apiCacheBlob = await colorBlob('#224466');
                await D.idbPut(D.DB.API_BLOB, D.imageRecord(apiCacheBlob, 'api'));

                assert('API source cache detection sees cached state', D.hasSourceCache('api') === true);
                var clearedApi = await D.clearWallpaperSourceCache('api');
                var clearedApiRecord = await D.idbGet(D.DB.API_BLOB);
                assert('API source cache cleanup clears single-image cache', clearedApi === true &&
                    D.hasSourceCache('api') === false &&
                    D.loadThumbs().api === undefined &&
                    !clearedApiRecord, JSON.stringify({ thumbs: D.loadThumbs(), record: !!clearedApiRecord }));
                assert('Bing source cleanup is a no-op', await D.clearWallpaperSourceCache('bing') === false);
            } catch (err) {
                assert('API source cache cleanup clears single-image cache', false, err && (err.code || err.message || String(err)));
            } finally {
                if (cacheBeforeWallpaper === null) localStorage.removeItem(D.KEYS.WALLPAPER);
                else localStorage.setItem(D.KEYS.WALLPAPER, cacheBeforeWallpaper);
                if (cacheBeforeThumbs === null) localStorage.removeItem(D.KEYS.WALLPAPER_THUMBS);
                else localStorage.setItem(D.KEYS.WALLPAPER_THUMBS, cacheBeforeThumbs);
                if (cacheBeforeBlurThumbs === null) localStorage.removeItem(D.KEYS.WALLPAPER_BLUR_THUMBS);
                else localStorage.setItem(D.KEYS.WALLPAPER_BLUR_THUMBS, cacheBeforeBlurThumbs);
                if (cacheBeforeApiRecord) await D.idbPut(D.DB.API_BLOB, cacheBeforeApiRecord);
                else await D.idbDelete(D.DB.API_BLOB);
                D.clearCaches();
            }
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
            try {
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

                try {
                    var jsonResult = await F.testApiSource({ id: 'j1', name: 'JSON', url: 'https://example.com/json', jsonPath: 'data.image.url' }, 'json');
                    assert('JSON API test returns blob and image URL', !!(jsonResult.blob && jsonResult.imageUrl === 'https://example.com/image.png'));
                } catch (err) {
                    assert('JSON API test returns blob and image URL', false, err && (err.code || err.message || String(err)));
                }

                try {
                    var imageResult = await F.testApiSource({ id: 'i1', name: 'Image', url: 'https://example.com/direct' }, 'image');
                    assert('image API test returns blob', !!(imageResult.blob && imageResult.blob.type === 'image/png'), imageResult.blob && imageResult.blob.type);
                } catch (err) {
                    assert('image API test returns blob', false, err && (err.code || err.message || String(err)));
                }

                try {
                    await F.testApiSource({ id: 'p1', name: 'Private', url: 'https://example.com/private' }, 'image');
                    assert('auth failure rejects', false, 'expected rejection');
                } catch (err) {
                    assert('auth failure has API_AUTH_REQUIRED code', err && err.code === 'API_AUTH_REQUIRED', err && err.code);
                }
            } catch (err) {
                assert('API source test setup completes', false, err && (err.code || err.message || String(err)));
            } finally {
                window.fetch = originalFetch;
            }
        }

        var hasSettingsPanelEnsureFull = !!(window.SettingsPanel && window.SettingsPanel.ensureFull);
        assert('SettingsPanel.ensureFull exists', hasSettingsPanelEnsureFull);
        if (hasSettingsPanelEnsureFull) {
            try {
                await window.SettingsPanel.ensureFull();
                var hasSettingsPanelOpenModal = !!(window.SettingsPanelFull && window.SettingsPanelFull.openModal);
                assert('SettingsPanelFull.openModal exists', hasSettingsPanelOpenModal);
                if (hasSettingsPanelOpenModal) {
                    var before = D && D.loadWallpaper ? JSON.stringify(D.loadWallpaper()) : '';
                    window.SettingsPanelFull.openModal();
                    await wait(0);
                    var wallpaperTab = document.querySelector('.modal-tab[data-tab="wallpaper"]');
                    assert('wallpaper tab exists', !!wallpaperTab);
                    if (wallpaperTab) wallpaperTab.click();
                    await wait(0);
                    var apiDrawerHeader = document.querySelector('.source-drawer[data-source="api"] .source-drawer-header');
                    assert('API source header exists', !!apiDrawerHeader);
                    if (apiDrawerHeader) apiDrawerHeader.click();
                    await wait(0);
                    assert('wallpaper source click does not persist immediately', !!(D && D.loadWallpaper && JSON.stringify(D.loadWallpaper()) === before));
                    var applyBtn = document.getElementById('wallpaperApplyBtn');
                    assert('wallpaper apply button exists', !!applyBtn);
                    assert('wallpaper apply button is disabled without valid change', !!(applyBtn && applyBtn.disabled === true), applyBtn ? String(applyBtn.disabled) : 'missing button');
                }
            } catch (err) {
                assert('SettingsPanel wallpaper UI test completes', false, err && (err.code || err.message || String(err)));
            }
        } else {
            assert('SettingsPanelFull.openModal exists', !!(window.SettingsPanelFull && window.SettingsPanelFull.openModal));
        }

        finish();
    }

    run().catch(function (err) {
        record('fatal error', false, err && (err.code || err.message || String(err)));
        finish();
    });
})();
