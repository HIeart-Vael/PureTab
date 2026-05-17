(function () {
    'use strict';

    var results = [];

    function record(name, passed, detail) {
        results.push({ name: name, passed: passed, detail: detail || '' });
        var fn = passed ? console.log : console.error;
        fn('[RSS test] ' + (passed ? 'PASS ' : 'FAIL ') + name + (detail ? ' - ' + detail : ''));
    }

    function assert(name, condition, detail) {
        record(name, !!condition, detail);
    }

    function wait(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms || 0); });
    }

    async function expectRejects(name, promise, check, detail) {
        try {
            await promise;
            record(name, false, detail || 'expected rejection');
        } catch (err) {
            record(name, check ? check(err) : true, detail || (err && err.message ? err.message : String(err)));
        }
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

    function thumbForBlob(blob) {
        var url = URL.createObjectURL(blob);
        return window.WallpaperShow.thumbnail(url).then(function (thumb) {
            URL.revokeObjectURL(url);
            return thumb;
        }, function (err) {
            URL.revokeObjectURL(url);
            throw err;
        });
    }

    async function run() {
        var D = window.WallpaperData;
        var F = window.WallpaperFetch;

        assert('WallpaperData.defaultRssConfig exists', !!(D && D.defaultRssConfig), 'required RSS config helper');
        assert('WallpaperData.loadRssConfig exists', !!(D && D.loadRssConfig), 'required RSS config loader');
        assert('WallpaperFetch.isHttpUrl exists', !!(F && F.isHttpUrl), 'required URL validator');
        assert('WallpaperFetch.parseRssItems exists', !!(F && F.parseRssItems), 'required parser');

        if (D && D.defaultRssConfig) {
            var config = D.defaultRssConfig();
            assert('default RSS has two sources', config.sources && config.sources.length === 2, JSON.stringify(config.sources || []));
            assert('default RSS includes NASA APOD', config.sources && config.sources[0] && config.sources[0].url.indexOf('apod.nasa.gov') !== -1);
            assert('default RSS includes Bing RSSHub', config.sources && config.sources[1] && config.sources[1].url.indexOf('rsshub.app/bing') !== -1);
            assert('default RSS summary is bottom expanded', config.summaryPosition === 'bottom' && config.summaryMode === 'expanded');
        }

        if (F && F.isHttpUrl) {
            assert('RSS URL validator accepts https', F.isHttpUrl('https://example.com/feed.xml'));
            assert('RSS URL validator rejects javascript', !F.isHttpUrl('javascript:alert(1)'));
        }

        if (F && F.parseRssItems) {
            var sample = '<?xml version="1.0"?><rss><channel><item><title>Example</title><link>https://example.com/post</link><pubDate>Sun, 17 May 2026 00:00:00 GMT</pubDate><description><![CDATA[<p>Hello</p><img src="https://example.com/image.jpg">]]></description></item></channel></rss>';
            var items = F.parseRssItems(sample, 'https://example.com/feed.xml', { id: 'sample', name: 'Sample' });
            assert('RSS parser finds one image item', items.length === 1, JSON.stringify(items));
            assert('RSS parser extracts image URL', items[0] && items[0].imageUrl === 'https://example.com/image.jpg');
            assert('RSS parser extracts article link', items[0] && items[0].link === 'https://example.com/post');
            assert('RSS parser strips HTML description', items[0] && items[0].description === 'Hello');

            var atomSample = '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Atom Example</title><link rel="alternate" href="/atom-post"/><updated>2026-05-17T00:00:00Z</updated><content type="html"><![CDATA[<p>Atom body</p><img src="/atom.jpg">]]></content></entry></feed>';
            var atomItems = F.parseRssItems(atomSample, 'https://example.com/feed.xml', { id: 'atom', name: 'Atom' });
            assert('Atom parser extracts content image', atomItems[0] && atomItems[0].imageUrl === 'https://example.com/atom.jpg', JSON.stringify(atomItems));
            assert('Atom parser extracts alternate link', atomItems[0] && atomItems[0].link === 'https://example.com/atom-post');

            var noImageSample = '<?xml version="1.0"?><rss><channel><item><title>No image</title><link>https://example.com/text</link><description>Plain text only</description></item></channel></rss>';
            var noImageItems = F.parseRssItems(noImageSample, 'https://example.com/feed.xml', { id: 'no-image', name: 'No image' });
            assert('RSS parser returns zero items when feed has no images', noImageItems.length === 0, JSON.stringify(noImageItems));

            if (F.testRssSource) {
                var originalFetch = window.fetch;
                window.fetch = function () {
                    return Promise.resolve(new Response(noImageSample, {
                        status: 200,
                        headers: { 'Content-Type': 'application/rss+xml' }
                    }));
                };
                await expectRejects('RSS test rejects feeds without images', F.testRssSource({ id: 'no-image', name: 'No image', url: 'https://example.com/feed.xml' }), function (err) {
                    return err && err.code === 'NO_RSS_IMAGES';
                }, 'expected NO_RSS_IMAGES');
                window.fetch = originalFetch;
            }
        }

        if (D && F && window.SettingsPanel && window.SettingsPanel.ensureFull) {
            var beforeModel = JSON.parse(JSON.stringify(D.loadWallpaper()));
            var originalReload = window.reloadWallpaper;
            var originalFetchForUi = window.fetch;
            var reloadCount = 0;
            window.reloadWallpaper = function () {
                reloadCount++;
                return Promise.resolve();
            };

            await window.SettingsPanel.ensureFull();
            D.setActiveSource('rss');
            if (window.SettingsPanelFull && window.SettingsPanelFull.openModal) {
                window.SettingsPanelFull.openModal();
                await wait(0);
                var wallpaperTab = document.querySelector('.modal-tab[data-tab="wallpaper"]');
                if (wallpaperTab) wallpaperTab.click();
                await wait(0);
                var alternateRadio = document.querySelector('input[name="rssSource"]:not(:checked)');
                if (alternateRadio) {
                    alternateRadio.click();
                    await wait(0);
                    assert('RSS source change does not reload immediately', reloadCount === 0, 'reloadCount=' + reloadCount);
                }
                var summaryToggle = document.getElementById('rssShowSummary');
                if (summaryToggle) {
                    summaryToggle.click();
                    await wait(0);
                    assert('RSS option change does not reload immediately', reloadCount === 0, 'reloadCount=' + reloadCount);
                }

                var testButton = document.querySelector('.rss-test-btn');
                if (testButton) {
                    window.fetch = function () {
                        return new Promise(function (resolve) {
                            setTimeout(function () {
                                resolve(new Response('<?xml version="1.0"?><rss><channel><item><title>Delayed</title><link>https://example.com/delayed</link><description><![CDATA[<img src="https://example.com/delayed.jpg">]]></description></item></channel></rss>', {
                                    status: 200,
                                    headers: { 'Content-Type': 'application/rss+xml' }
                                }));
                            }, 30);
                        });
                    };
                    testButton.click();
                    await wait(0);
                    assert('RSS test button shows loading state', testButton.disabled === true && testButton.classList.contains('testing'), 'disabled=' + testButton.disabled + ', class=' + testButton.className);
                    var loadingNotice = document.querySelector('#rssNotice');
                    assert('RSS test shows visible loading notice', !!(loadingNotice && !loadingNotice.hidden && loadingNotice.textContent.indexOf('测试') !== -1), loadingNotice && loadingNotice.textContent);
                    await wait(80);
                    assert('RSS test shows result notice', !!(loadingNotice && !loadingNotice.hidden && loadingNotice.dataset.type === 'success'), loadingNotice && loadingNotice.textContent);
                    assert('RSS test button restores after result', testButton.disabled === false && !testButton.classList.contains('testing'), 'disabled=' + testButton.disabled + ', class=' + testButton.className);
                    window.fetch = originalFetchForUi;
                }

                if (window.SettingsPanelFull.closeModal) {
                    window.SettingsPanelFull.closeModal({ skipEmptyLocalPicker: true });
                    await wait(0);
                    assert('RSS changes reload once when modal closes', reloadCount === 1, 'reloadCount=' + reloadCount);
                }
            }

            window.reloadWallpaper = originalReload;
            window.fetch = originalFetchForUi;
            D.saveWallpaper(beforeModel);
        }

        if (D && window.WallpaperShow && window.reloadWallpaper) {
            var beforeRssModel = JSON.parse(JSON.stringify(D.loadWallpaper()));
            var beforeThumbs = JSON.parse(JSON.stringify(D.loadThumbs()));
            var beforePreview = D.loadPreview();
            var beforeUi = D.loadUI ? JSON.parse(JSON.stringify(D.loadUI())) : null;
            var originalFetchBingUrl = F.fetchBingUrl;
            var originalCacheBingBlob = F.cacheBingBlob;
            var rssIds = ['rss_test_current', 'rss_test_next'];
            var blobA = await colorBlob('#ef4444');
            var blobB = await colorBlob('#22c55e');
            var thumbA = await thumbForBlob(blobA);
            var thumbB = await thumbForBlob(blobB);
            var thumbs = D.loadThumbs();
            thumbs[rssIds[0]] = thumbA;
            thumbs[rssIds[1]] = thumbB;
            D.saveThumbs(thumbs);
            await D.idbPut(D.imgKey(rssIds[0]), { blob: blobA, mime: 'image/png', name: 'RSS current', source: 'rss', id: rssIds[0] });
            await D.idbPut(D.imgKey(rssIds[1]), { blob: blobB, mime: 'image/png', name: 'RSS next', source: 'rss', id: rssIds[1] });
            if (beforeUi) {
                beforeUi.wallpaper = beforeUi.wallpaper || {};
                beforeUi.wallpaper.blur = 0;
                D.saveUI(beforeUi);
            }
            F.fetchBingUrl = function () { return Promise.reject(new Error('skip bing in rss test')); };
            F.cacheBingBlob = function () { return Promise.resolve(null); };
            D.updateWallpaper(function (model) {
                model.activeSource = 'rss';
                model.providers.rss.config.sources = [{ id: 'rss-test', name: 'RSS test', url: 'https://example.com/rss.xml', builtIn: false }];
                model.providers.rss.config.activeSourceId = 'rss-test';
                model.providers.rss.config.refreshIntervalMs = 0;
                model.providers.rss.state.lastSuccessAt = Date.now();
                model.providers.rss.state.lastError = '';
                model.cache.order = rssIds.slice();
                model.cache.index = 0;
                model.cache.meta = model.cache.meta || {};
                model.cache.meta[rssIds[0]] = { sourceId: 'rss-test', title: 'RSS current', description: '', link: '', imageUrl: 'https://example.com/a.png' };
                model.cache.meta[rssIds[1]] = { sourceId: 'rss-test', title: 'RSS next', description: '', link: '', imageUrl: 'https://example.com/b.png' };
            });

            await window.reloadWallpaper();
            assert('RSS load advances index after displaying current item', D.getActiveIndex() === 1, 'index=' + D.getActiveIndex());
            assert('RSS runtime records displayed current item', window.WallpaperShow.currentOriginalId === rssIds[0], 'currentOriginalId=' + window.WallpaperShow.currentOriginalId);
            assert('RSS preview thumbnail points to next item after wallpaper apply', D.loadPreview() === thumbB, 'preview matched next=' + (D.loadPreview() === thumbB) + ', current=' + (D.loadPreview() === thumbA));

            await window.reloadWallpaper();
            assert('RSS second load records second displayed item', window.WallpaperShow.currentOriginalId === rssIds[1], 'currentOriginalId=' + window.WallpaperShow.currentOriginalId);
            assert('RSS second load prepares first item for next preview', D.loadPreview() === thumbA, 'preview matched first=' + (D.loadPreview() === thumbA) + ', second=' + (D.loadPreview() === thumbB));

            if (window.SettingsPanelFull && window.SettingsPanelFull.open) {
                window.SettingsPanelFull.open();
                await wait(0);
                var firstRssThumb = document.querySelector('#wallpaperGallery .wallpaper-thumb[data-source="rss"]');
                assert('RSS gallery starts with displayed wallpaper thumbnail', firstRssThumb && firstRssThumb.dataset.id === rssIds[1], 'first=' + (firstRssThumb && firstRssThumb.dataset.id) + ', current=' + rssIds[1]);
                if (window.SettingsPanelFull.close) window.SettingsPanelFull.close({ skipEmptyLocalPicker: true });
            }

            F.fetchBingUrl = originalFetchBingUrl;
            F.cacheBingBlob = originalCacheBingBlob;
            D.saveWallpaper(beforeRssModel);
            D.saveThumbs(beforeThumbs);
            D.savePreview(beforePreview);
            if (beforeUi) D.saveUI(beforeUi);
            await D.idbDeleteMany(rssIds.map(function (id) { return D.imgKey(id); }));
        }

        var rssInfo = document.getElementById('rssWallpaperInfo');
        var searchBar = document.getElementById('searchBar');
        assert('RSS overlay container exists', !!rssInfo);
        if (rssInfo && searchBar) {
            var rssZ = parseInt(getComputedStyle(rssInfo).zIndex, 10);
            var searchZ = parseInt(getComputedStyle(searchBar).zIndex, 10);
            assert('search bar layers above RSS overlay', searchZ > rssZ, 'search z=' + searchZ + ', rss z=' + rssZ);
        }

        var failed = results.filter(function (item) { return !item.passed; });
        console.log('[RSS test] Complete: ' + (results.length - failed.length) + '/' + results.length + ' passed');
        window.__plainTabRssTestResults = results;
        return { passed: failed.length === 0, results: results };
    }

    return run();
})();
