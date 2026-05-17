# Folder Wallpaper Implementation Plan

Date: 2026-05-18

## Goal

Implement the local folder wallpaper source described in `.claude/rules/20-wallpaper.md`, while matching the current wallpaper settings behavior:

- Wallpaper source edits are draft-only until the user clicks `应用配置`.
- Folder selection validates the directory and stores a pending in-memory mount result, but does not switch wallpaper immediately.
- Applying folder writes the directory handle and first usable index before saving `activeSource: "folder"`.
- Switching away from a non-Bing source with cache follows the existing discard confirmation flow.

## Decisions To Carry Into Code

- Use capability detection only: `window.showDirectoryPicker` and handle permission APIs, not OS checks.
- Keep folder rotation as shuffle only. Treat existing `strategy: "random"` as an alias of the documented `shuffle`; do not expose sequential mode.
- Use file names as the folder-local identity, but use global wallpaper IDs as `folder:<encodedName>` so shared cache maps do not collide with upload/RSS/API IDs.
- `pathLabel` is a friendly label, usually `FileSystemDirectoryHandle.name`. Do not promise a real absolute disk path.
- Do not persist a newly picked handle until `应用配置` succeeds. Keep the picked handle, first indexed files, and first image blob in memory as `wallpaperDraftFolderMount`.
- Do not touch `preload.js` beyond preserving its invariant: first paint only reads `ptab_wallpaper_preview`.
- Do not update `.claude/rules/*` in this task unless the user explicitly asks, because those files may already contain unrelated dirty edits.

## Proposed Model

`ptab_wallpaper.providers.folder`:

```js
{
  config: {
    pathLabel: "",
    strategy: "shuffle"
  },
  state: {
    status: "idle",
    indexedCount: 0,
    completed: false,
    lastScanAt: 0,
    lastError: "",
    shuffleBag: [],
    currentName: ""
  }
}
```

Compatibility:

- Normalize old or empty `strategy` values to `shuffle`.
- Treat `random` as `shuffle`.
- Keep `state.status` within `idle|indexing|ready|needs-permission|empty|error`.

IDB keys already exist:

- `D.DB.FOLDER_HANDLE` -> `FileSystemDirectoryHandle`
- `D.DB.FOLDER_FILES` -> `[{ name, size, lastModified }, ...]`

Shared maps:

- `ptab_wallpaper_thumbs["folder:<encodedName>"]`
- `ptab_wallpaper_blur_thumbs["folder:<encodedName>"]`
- `ptab_wallpaper.cache.meta["folder:<encodedName>"]`

## Task 1: Add Regression Script First

Create `docs/ai-tasks/20260518-folder-wallpaper-test.js`.

Cover:

- Folder IDs encode/decode names and do not look like upload IDs.
- Folder config normalization accepts `random` and emits `shuffle`.
- Unsupported browsers disable folder apply.
- Choosing a mocked folder with supported images enables `应用配置` without persisting immediately.
- Applying folder saves handle/index before `activeSource` changes.
- Folder apply with no images keeps saved wallpaper unchanged.
- Runtime permission loss marks `needs-permission` and keeps existing preview visible.
- Switching from folder to RSS/API/upload triggers the discard confirmation when folder cache exists.

Use browser-console style like the RSS/API regression scripts. For picker behavior, stub `window.showDirectoryPicker` and use fake directory handles for pure helper tests. Do not rely on native picker automation.

Commit suggestion:

```bash
git add docs/ai-tasks/20260518-folder-wallpaper-test.js
git commit -m "test: 添加文件夹壁纸回归脚本"
```

## Task 2: Extend WallpaperData

Modify `js/wallpaper/data.js`.

Add helpers:

- `folderId(name)`
- `folderNameFromId(id)`
- `normalizeFolderConfig(config)`
- `normalizeFolderState(state)`
- `loadFolderConfig()`
- `saveFolderConfig(config)`
- `loadFolderState()`
- `saveFolderState(state)`
- `loadFolderFiles()`
- `saveFolderFiles(files)`
- `loadFolderHandle()`
- `saveFolderHandle(handle)`
- `clearFolderHandleAndIndex()`

Required behavior:

- `loadWallpaper()` and `saveWallpaper()` normalize folder config/state.
- `isUploadId()` must exclude folder IDs.
- `isFolderId()` should use the chosen `folder:` prefix.
- `clearWallpaperSourceCache("folder")` removes folder IDs from order/thumbs/blurThumbs/meta, resets folder state, and deletes `D.DB.FOLDER_HANDLE` and `D.DB.FOLDER_FILES`.
- Delete references before deleting IDB handle/index.
- Do not store original folder images in IDB.

Commit suggestion:

```bash
git add js/wallpaper/data.js
git commit -m "feat: 添加文件夹壁纸数据模型"
```

## Task 3: Add Folder Service Module

Add `js/wallpaper/folder.js` and load it in `index.html` after `js/wallpaper/show.js` and before `js/newtab.js`.

Expose `window.WallpaperFolder`.

Core helpers:

- `isSupported()`
- `pickDirectory()`
- `queryReadPermission(handle)`
- `requestReadPermission(handle)`
- `ensureReadPermission(handle, request)`
- `isSupportedImageName(name)`
- `scanDirectory(handle, options)`
- `scanFirstBatch(handle, limit)`
- `readImageFile(handle, name)`
- `fileRecord(file)`
- `buildShuffleBag(files, currentName)`
- `prepareMount(handle)`
- `preparePreviewFromFile(file, id, blur)`
- `rescan(handle, options)`

Important rules:

- `pickDirectory()` must only be called directly from a user click handler.
- `prepareMount(handle)` validates permission, scans only the first directory level, filters supported image formats, reads at least one usable image, and returns `{ handle, pathLabel, files, firstName, firstFile, firstId, preview, thumb }`.
- The first valid image and `ptab_wallpaper_preview` must be ready before apply can save `activeSource: "folder"`.
- `scanDirectory` should support a limit for first batch, then allow later idle batches.
- Use `requestIdleCallback` for non-critical indexing and thumbnail fill.
- Keep all object URLs scoped and revoke them after use.

Commit suggestion:

```bash
git add index.html js/wallpaper/folder.js
git commit -m "feat: 添加文件夹壁纸服务"
```

## Task 4: Integrate Runtime Loading

Modify `js/newtab.js`.

Add:

- `tryLoadFolderWallpaper()`
- `refreshFolderIndexInBackground()`
- `saveFolderNextPreview(nextName, blur)`
- bounded retry when a file is missing or unreadable

Runtime flow:

1. `preload.js` has already shown `ptab_wallpaper_preview`.
2. `loadWallpaper()` sees `activeSource === "folder"`.
3. Read `D.DB.FOLDER_HANDLE` and `D.DB.FOLDER_FILES`.
4. Query read permission. If unavailable, set `needs-permission`; keep preview if present instead of forcing a blank state.
5. Pick the next name from `shuffleBag`. Rebuild the bag if empty.
6. Read the file by name from the handle.
7. If the file is missing, remove it from files/bag/thumbs/meta and try the next candidate without advancing to a failed image.
8. If `size` or `lastModified` changed, update index and rebuild related thumbs/preview.
9. Apply the original file via the existing double-layer renderer.
10. Only after successful display, advance `currentName` and persist the shortened `shuffleBag`.
11. In idle time, prepare the next preview and optional blur thumbnail.

Fallback:

- If folder cannot read anything and preview exists, keep the current displayed preview and cache Bing in the background.
- If folder cannot read anything and preview is missing, fall back to cached/network Bing.

Commit suggestion:

```bash
git add js/newtab.js
git commit -m "feat: 加载本地文件夹壁纸"
```

## Task 5: Build Settings UI And Draft Apply

Modify `js/settings-panel.js`, `css/settings.css`, and `js/languages.js`.

UI:

- Replace the current folder pending placeholder with a real folder config section.
- Show unsupported state if `WallpaperFolder.isSupported()` is false.
- Add `选择文件夹` button.
- Show selected `pathLabel`, indexed count, status message, and `刷新文件夹` button when applicable.
- Keep the apply footer fixed like RSS/API.
- Do not show sequential strategy. If a compact mode indicator is useful, show `随机` as read-only.

Draft state:

- Add `wallpaperDraftFolderMount`.
- Choosing a folder calls `WallpaperFolder.pickDirectory()` from the click handler, then `prepareMount()`.
- On success, update draft folder config/state and enable apply.
- On cancel, leave the draft unchanged.
- On empty/unsupported folder, keep draft unchanged and show a notice.
- Closing the modal clears `wallpaperDraftFolderMount`.

Validation:

- Folder apply is valid when there is a successful pending mount, or when saved folder config/state is ready and the handle can be verified without prompting.
- If permission requires a prompt, show `需要重新授权` and keep apply disabled until the user clicks choose/reauthorize.

Apply:

- If switching from a non-Bing cached source, reuse the existing discard confirmation flow.
- For folder, save `D.DB.FOLDER_HANDLE`, save `D.DB.FOLDER_FILES`, save preview/thumb/meta, then save wallpaper draft with `activeSource: "folder"`.
- Only after those writes succeed call `reloadWallpaper()`.
- If any write or first image preparation fails, leave saved wallpaper unchanged.

Commit suggestion:

```bash
git add js/settings-panel.js css/settings.css js/languages.js
git commit -m "feat: 添加文件夹壁纸设置界面"
```

## Task 6: Update Quick Panel Gallery

Modify `js/settings-panel.js`.

Behavior:

- Folder quick panel shows current image and a few upcoming `shuffleBag` entries, not the full directory.
- Use cached thumbs when available.
- Missing thumbs show file-name placeholders.
- Fill visible missing thumbs during idle time by reading only those files.
- Folder gallery items are not draggable and not deletable.
- The count line shows `indexedCount` or the current known file count.

Commit suggestion:

```bash
git add js/settings-panel.js
git commit -m "feat: 显示文件夹壁纸预览"
```

## Task 7: Verification

Static checks:

```bash
node --check js/wallpaper/data.js
node --check js/wallpaper/folder.js
node --check js/newtab.js
node --check js/settings-panel.js
node --check js/languages.js
git diff --check
```

Startup invariant:

- Confirm `#wallpaperBack` is before `js/preload.js`.
- Confirm `js/preload.js` does not access IndexedDB, scan folders, use canvas, or fetch.
- Confirm `js/wallpaper/folder.js` does no work at module load beyond defining helpers.

Browser checks:

- Run the folder regression script in `index.html`.
- Pick a folder with supported images; source does not switch until `应用配置`.
- Apply folder; wallpaper changes only after preview and first image are ready.
- Reopen a new tab; preview appears immediately, then original folder image fades in.
- Remove/rename current file; runtime skips it without advancing to a broken state.
- Modify a file; index metadata and thumbnail refresh.
- Revoke permission or clear handle; UI shows reauthorization state and keeps existing preview.
- Switch Bing -> folder: no discard prompt.
- Switch folder -> RSS/API/upload with cache: discard prompt appears.
- Cancel prompt keeps folder cache and saved config.
- Confirm prompt clears folder handle/index/thumbs/meta and applies next source.

## Open Risks

- Native directory picker automation is limited, so tests should isolate pure helper behavior and use manual picker checks for the browser capability path.
- `FileSystemDirectoryHandle` permission persistence differs across browser versions. Treat persisted handles as optimistic and always re-check permission before reading.
- `localStorage` thumbnail capacity can be tight with many sources. Folder must only keep a small visible/next-preview thumbnail set.
- Huge folders need idle batched scanning. The first usable wallpaper should not wait for a full scan.

