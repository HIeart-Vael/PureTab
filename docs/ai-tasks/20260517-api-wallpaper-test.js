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
        window.__apiWallpaperTestResults = results;
        console.log('[API wallpaper test] ' + (failed.length ? 'FAILED ' + failed.length : 'ALL PASSED'));
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
