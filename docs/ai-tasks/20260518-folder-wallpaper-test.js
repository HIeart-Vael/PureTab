(function () {
    'use strict';

    var results = [];

    function record(name, passed, detail) {
        results.push({ name: name, passed: !!passed, detail: detail || '' });
        var fn = passed ? console.log : console.error;
        fn('[Folder wallpaper test] ' + (passed ? 'PASS ' : 'FAIL ') + name + (detail ? ' - ' + detail : ''));
    }

    function assert(name, condition, detail) {
        record(name, !!condition, detail);
    }

    function wait(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms || 0); });
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

    function finish() {
        var failed = results.filter(function (r) { return !r.passed; });
        var summary = {
            total: results.length,
            passed: results.length - failed.length,
            failed: failed.length,
            ok: failed.length === 0
        };
        window.__folderWallpaperTestResults = results;
        window.__folderWallpaperTestSummary = summary;
        console.log('[Folder wallpaper test] ' + (summary.ok ? 'ALL PASSED' : 'FAILED ' + summary.failed) + ' (' + summary.passed + '/' + summary.total + ')');
    }

    function fakeFileHandle(name, blob) {
        return {
            kind: 'file',
            name: name,
            getFile: function () {
                return Promise.resolve(new File([blob], name, { type: blob.type || 'image/png', lastModified: 123456 }));
            }
        };
    }

    function fakeDirectoryHandle(entries, options) {
        options = options || {};
        return {
            kind: 'directory',
            name: options.name || 'Wallpapers',
            queryPermission: function () { return Promise.resolve(options.permission || 'granted'); },
            requestPermission: function () { return Promise.resolve(options.requestPermission || options.permission || 'granted'); },
            values: async function* () {
                for (var i = 0; i < entries.length; i++) yield entries[i];
            },
            getFileHandle: function (name) {
                var hit = entries.filter(function (entry) { return entry.kind === 'file' && entry.name === name; })[0];
                return hit ? Promise.resolve(hit) : Promise.reject(Object.assign(new Error('not found'), { name: 'NotFoundError' }));
            }
        };
    }

    async function run() {
        var D = window.WallpaperData;
        var Folder = window.WallpaperFolder;

        assert('WallpaperData.folderId exists', !!(D && D.folderId));
        assert('WallpaperData.folderNameFromId exists', !!(D && D.folderNameFromId));
        assert('WallpaperData.normalizeFolderConfig exists', !!(D && D.normalizeFolderConfig));
        assert('WallpaperData.normalizeFolderState exists', !!(D && D.normalizeFolderState));
        assert('WallpaperData.loadFolderConfig exists', !!(D && D.loadFolderConfig));
        assert('WallpaperData.saveFolderConfig exists', !!(D && D.saveFolderConfig));
        assert('WallpaperData.loadFolderFiles exists', !!(D && D.loadFolderFiles));
        assert('WallpaperData.saveFolderFiles exists', !!(D && D.saveFolderFiles));
        assert('WallpaperData.loadFolderHandle exists', !!(D && D.loadFolderHandle));
        assert('WallpaperData.saveFolderHandle exists', !!(D && D.saveFolderHandle));
        assert('WallpaperFolder module exists', !!Folder);
        assert('WallpaperFolder.prepareMount exists', !!(Folder && Folder.prepareMount));
        assert('WallpaperFolder.buildShuffleBag exists', !!(Folder && Folder.buildShuffleBag));
        assert('WallpaperFolder.isSupportedImageName exists', !!(Folder && Folder.isSupportedImageName));

        if (D && D.folderId && D.folderNameFromId) {
            var id = D.folderId('summer sky 01.jpg');
            assert('folder ID uses folder prefix', /^folder:/.test(id), id);
            assert('folder ID round-trips filename', D.folderNameFromId(id) === 'summer sky 01.jpg', id);
            assert('folder ID is not upload ID', D.isUploadId && D.isUploadId(id) === false, id);
            assert('folder ID is folder ID', D.isFolderId && D.isFolderId(id) === true, id);
        }

        if (D && D.normalizeFolderConfig) {
            var cfg = D.normalizeFolderConfig({ pathLabel: '  Pictures  ', strategy: 'random' });
            assert('folder config normalizes random to shuffle', cfg.strategy === 'shuffle', JSON.stringify(cfg));
            assert('folder config trims path label', cfg.pathLabel === 'Pictures', JSON.stringify(cfg));
        }

        if (D && D.normalizeFolderState) {
            var state = D.normalizeFolderState({
                status: 'strange',
                indexedCount: '7',
                completed: true,
                shuffleBag: ['a.jpg', 3, ''],
                currentName: 'a.jpg'
            });
            assert('folder state normalizes status and bag', state.status === 'idle' &&
                state.indexedCount === 7 &&
                state.completed === true &&
                state.shuffleBag.length === 1 &&
                state.shuffleBag[0] === 'a.jpg', JSON.stringify(state));
        }

        if (D && D.clearWallpaperSourceCache && D.idbPut && D.idbGet && D.idbDelete && D.loadWallpaper && D.saveWallpaper && D.folderId && D.clearCaches && D.KEYS && D.DB) {
            var beforeWallpaper = null;
            var beforeThumbs = null;
            var beforeBlurThumbs = null;
            var beforeHandle = null;
            var beforeFiles = null;
            try {
                beforeWallpaper = localStorage.getItem(D.KEYS.WALLPAPER);
                beforeThumbs = localStorage.getItem(D.KEYS.WALLPAPER_THUMBS);
                beforeBlurThumbs = localStorage.getItem(D.KEYS.WALLPAPER_BLUR_THUMBS);
                beforeHandle = await D.idbGet(D.DB.FOLDER_HANDLE);
                beforeFiles = await D.idbGet(D.DB.FOLDER_FILES);

                var folderId = D.folderId('one.jpg');
                var model = D.loadWallpaper();
                model.activeSource = 'folder';
                model.providers.folder.config = { pathLabel: 'Wallpapers', strategy: 'shuffle' };
                model.providers.folder.state = { status: 'ready', indexedCount: 1, completed: true, lastScanAt: 1, lastError: '', shuffleBag: ['one.jpg'], currentName: 'one.jpg' };
                model.cache.order = ['bing', folderId];
                model.cache.index = 1;
                model.cache.meta = { bing: {}, [folderId]: { name: 'one.jpg' } };
                D.saveWallpaper(model);
                D.saveThumbs({ [folderId]: 'folder-thumb' });
                D.saveBlurThumbs({ [folderId]: { blur: 5, thumb: 'folder-blur' } });
                await D.idbPut(D.DB.FOLDER_HANDLE, { name: 'Wallpapers' });
                await D.idbPut(D.DB.FOLDER_FILES, [{ name: 'one.jpg', size: 10, lastModified: 1 }]);
                D.clearCaches();

                assert('folder source cache detection sees cached state', D.hasSourceCache('folder') === true);
                var cleared = await D.clearWallpaperSourceCache('folder');
                var clearedHandle = await D.idbGet(D.DB.FOLDER_HANDLE);
                var clearedFiles = await D.idbGet(D.DB.FOLDER_FILES);
                assert('folder source cache cleanup clears handle index and refs', cleared === true &&
                    D.hasSourceCache('folder') === false &&
                    !D.loadThumbs()[folderId] &&
                    !clearedHandle &&
                    !clearedFiles, JSON.stringify({ thumbs: D.loadThumbs(), handle: !!clearedHandle, files: !!clearedFiles }));
            } catch (err) {
                assert('folder source cache cleanup clears handle index and refs', false, err && (err.code || err.message || String(err)));
            } finally {
                if (beforeWallpaper === null) localStorage.removeItem(D.KEYS.WALLPAPER);
                else localStorage.setItem(D.KEYS.WALLPAPER, beforeWallpaper);
                if (beforeThumbs === null) localStorage.removeItem(D.KEYS.WALLPAPER_THUMBS);
                else localStorage.setItem(D.KEYS.WALLPAPER_THUMBS, beforeThumbs);
                if (beforeBlurThumbs === null) localStorage.removeItem(D.KEYS.WALLPAPER_BLUR_THUMBS);
                else localStorage.setItem(D.KEYS.WALLPAPER_BLUR_THUMBS, beforeBlurThumbs);
                if (beforeHandle) await D.idbPut(D.DB.FOLDER_HANDLE, beforeHandle);
                else await D.idbDelete(D.DB.FOLDER_HANDLE);
                if (beforeFiles) await D.idbPut(D.DB.FOLDER_FILES, beforeFiles);
                else await D.idbDelete(D.DB.FOLDER_FILES);
                D.clearCaches();
            }
        }

        if (Folder && Folder.isSupportedImageName) {
            assert('folder image extension detection accepts supported files', Folder.isSupportedImageName('a.JPG') &&
                Folder.isSupportedImageName('b.avif') &&
                Folder.isSupportedImageName('c.webp'));
            assert('folder image extension detection rejects unsupported files', Folder.isSupportedImageName('notes.txt') === false);
        }

        if (Folder && Folder.buildShuffleBag) {
            var bag = Folder.buildShuffleBag([{ name: 'a.jpg' }, { name: 'b.jpg' }, { name: 'c.jpg' }], 'b.jpg');
            assert('folder shuffle bag contains each file once and skips current', bag.length === 2 &&
                bag.indexOf('a.jpg') !== -1 &&
                bag.indexOf('c.jpg') !== -1 &&
                bag.indexOf('b.jpg') === -1, JSON.stringify(bag));
        }

        if (Folder && Folder.prepareMount) {
            try {
                var blob = await colorBlob('#33aa66');
                var mount = await Folder.prepareMount(fakeDirectoryHandle([
                    fakeFileHandle('first.png', blob),
                    fakeFileHandle('notes.txt', blob),
                    fakeFileHandle('second.jpg', blob)
                ], { name: 'Demo Folder' }));
                assert('folder prepareMount returns first usable image and preview', !!(mount &&
                    mount.pathLabel === 'Demo Folder' &&
                    mount.files.length === 2 &&
                    mount.firstName &&
                    mount.firstId &&
                    mount.preview &&
                    mount.thumb), JSON.stringify(mount && { pathLabel: mount.pathLabel, files: mount.files.length, firstName: mount.firstName, firstId: mount.firstId, preview: !!mount.preview, thumb: !!mount.thumb }));
            } catch (err) {
                assert('folder prepareMount returns first usable image and preview', false, err && (err.code || err.message || String(err)));
            }

            try {
                await Folder.prepareMount(fakeDirectoryHandle([fakeFileHandle('notes.txt', await colorBlob('#333333'))]));
                assert('folder prepareMount rejects empty image folder', false, 'expected rejection');
            } catch (err) {
                assert('folder prepareMount rejects empty image folder', err && err.code === 'FOLDER_NO_IMAGES', err && err.code);
            }
        }

        var hasSettingsPanelEnsureFull = !!(window.SettingsPanel && window.SettingsPanel.ensureFull);
        assert('SettingsPanel.ensureFull exists', hasSettingsPanelEnsureFull);
        if (hasSettingsPanelEnsureFull) {
            try {
                await window.SettingsPanel.ensureFull();
                assert('SettingsPanelFull.openModal exists', !!(window.SettingsPanelFull && window.SettingsPanelFull.openModal));
                window.SettingsPanelFull.openModal();
                await wait(0);
                var wallpaperTab = document.querySelector('.modal-tab[data-tab="wallpaper"]');
                assert('wallpaper tab exists', !!wallpaperTab);
                if (wallpaperTab) wallpaperTab.click();
                await wait(0);
                var folderHeader = document.querySelector('.source-drawer[data-source="folder"] .source-drawer-header');
                assert('folder source header exists', !!folderHeader);
                if (folderHeader) folderHeader.click();
                await wait(0);
                assert('folder choose button exists', !!document.getElementById('folderChooseBtn'));
                assert('folder status element exists', !!document.getElementById('folderStatus'));
            } catch (err) {
                assert('SettingsPanel folder UI test completes', false, err && (err.code || err.message || String(err)));
            } finally {
                if (window.SettingsPanelFull && window.SettingsPanelFull.isModalOpen && window.SettingsPanelFull.isModalOpen()) {
                    window.SettingsPanelFull.closeModal({ skipEmptyLocalPicker: true });
                }
            }
        }

        finish();
    }

    run().catch(function (err) {
        record('fatal error', false, err && (err.code || err.message || String(err)));
        finish();
    });
})();
