# API Wallpaper And Wallpaper Tab Apply Design

Date: 2026-05-17

## Goal

Implement API wallpaper as a complete PlainTab wallpaper source while fixing the wallpaper tab interaction model. The wallpaper tab should no longer apply network-source changes implicitly when the settings panel closes. All wallpaper-source configuration changes should use an explicit draft-to-apply flow.

The design must preserve the zero-white-flash wallpaper pipeline, the static extension constraints, and the current `ptab_wallpaper` storage model.

## Existing Model Alignment

PlainTab already stores the active wallpaper provider as `activeSource` with these source values:

- `bing`
- `upload`
- `folder`
- `rss`
- `api`

The existing UI compatibility layer still uses `currentMode` and `compatMode()`, including the legacy `local` value for upload mode. API subtype selection must not add another generic `mode` field.

Use these names:

- `activeSource`: top-level wallpaper source.
- `apiType`: API provider subtype, either `image` or `json`.
- `activeImageSourceId`: selected source inside the image or redirect API list.
- `activeJsonSourceId`: selected source inside the JSON API list.

## Wallpaper Tab Interaction

The wallpaper tab uses a draft model.

Opening the wallpaper tab reads the saved wallpaper model and creates an in-memory draft. User edits update only the draft until the user clicks `Apply configuration`.

Drafted edits include:

- Changing the active wallpaper source.
- Changing RSS source selection and RSS options.
- Changing API type, API source selection, API source fields, and API refresh interval.
- Changing folder selection and folder rotation strategy.
- Choosing upload mode.

No `Cancel changes` button is required. If the user closes the settings panel or leaves the tab without applying, the draft is discarded and the next open shows the saved configuration.

`Apply configuration` is disabled unless there is both:

- A meaningful change from the saved model.
- A valid configuration for the selected source.

The fixed footer shows the disabled reason, such as:

- No unapplied changes.
- Select a valid folder.
- Test the current RSS source first.
- Test the current API source first.
- Fix the invalid URL.

The wallpaper tab layout has three fixed regions:

- Fixed header: title, subtitle, and concise status.
- Scrollable body: source cards and per-source configuration.
- Fixed footer: `Apply configuration` and validation or risk text.

The fixed header and footer do not move when the body scrolls.

## Source-Specific Apply Rules

### Bing

Bing can be applied directly. Bing remains the independent fallback cache and is not deleted when leaving Bing.

Switching from Bing to any other source does not show a discard warning because Bing's image cache is retained.

### Upload

Applying upload mode does not open a file picker. The modal configuration should explain that uploads happen from the first-level settings panel `+` button.

If upload mode has no uploaded images:

- Applying upload mode may still save `activeSource: "upload"`.
- The current page keeps showing the previous visible wallpaper.
- A newly opened tab may show the built-in fallback background until the user uploads images.

### Folder

Folder mode must pass validation before it can be applied.

Invalid states include:

- No folder selected.
- Browser does not support the required folder API.
- Folder permission is unavailable.
- Folder scan finds no supported images.
- Directory handle persistence preparation fails.

When valid, the draft shows the folder label and preflight result. Applying saves the folder config, then starts scanning and thumbnail preparation. If a usable image is available, it can replace the current wallpaper immediately via the normal wallpaper transition.

### RSS

RSS keeps its existing source-list and overlay behavior, but configuration edits are drafted.

The currently selected RSS source must be tested successfully before RSS can be applied. Only the selected RSS source needs to be green; backup sources may remain red without blocking apply.

### API

The currently selected API source must be tested successfully before API can be applied. Applying API reuses the image from the successful test instead of requesting the API again.

## Source Switch Warnings And Cache Cleanup

Bing cache is independent fallback state. Do not delete Bing blob, Bing thumbnail, or Bing blur thumbnail when leaving Bing.

When switching from a non-Bing source to a different source, and that old source has cached wallpaper data, show a confirmation before applying:

- If the user cancels, do not save the draft, do not clear cache, and do not apply.
- If the user confirms, clear the old source cache using the safe delete order, then save and apply the new configuration.

The current page must not be forced to a blank state during cleanup. It may keep the currently visible wallpaper until the new source successfully applies or a future load falls back.

Cleanup scope:

- Upload: remove upload IDs from cache order, delete upload blobs, thumbnails, blur thumbnails, and metadata.
- Folder: delete persisted folder handle and file index, clear folder thumbnails and window state, and never delete disk files.
- RSS: delete all `ptab_wallpaper_blob_rss_*` records, RSS item IDs, thumbnails, blur thumbnails, and metadata; keep RSS source configuration and test state.
- API: delete `D.DB.API_BLOB` (`ptab_wallpaper_blob_api`), `thumbs.api`, `blurThumbs.api`, `meta.api`, and API runtime state; keep API source configuration and test state.
- Bing: retained when leaving Bing.

Delete references before deleting large files.

## API User Experience

API appears as one of the five wallpaper sources.

The API configuration area starts with a horizontal segmented selector:

- Image / redirect
- JSON

The image / redirect tab appears first.

The two API types are visually separate. Each type has its own saved source list and its own add or edit form. Each list accepts up to 5 sources.

Only one API source is active at a time. Selecting a source in the image tab makes that image source the active API source. Selecting a source in the JSON tab switches the active API source to that JSON source.

The API refresh interval is shared by API mode, not duplicated per type. It supports:

- Off.
- Every new tab.
- 1 day.
- 3 days.
- 7 days.

## API Source Types

### Image Or Redirect API

This type is for endpoints where a GET request directly returns an image or redirects to an image.

Each source stores:

```js
{
  id: "",
  name: "",
  url: "",
  test: {
    status: "untested",
    fieldHash: "",
    testedAt: 0,
    imageUrl: "",
    error: ""
  }
}
```

### JSON API

This type is for endpoints where a GET request returns JSON and PlainTab extracts an image URL.

Each source stores:

```js
{
  id: "",
  name: "",
  url: "",
  jsonPath: "",
  test: {
    status: "untested",
    fieldHash: "",
    testedAt: 0,
    imageUrl: "",
    error: ""
  }
}
```

`jsonPath` is optional. If provided, PlainTab uses it first. If omitted, PlainTab tries common fields automatically, such as `url`, `image`, `imageUrl`, `src`, and nested data fields.

JSON paths should support dot notation and array indexes, matching the current wallpaper rules.

## API Network Rules

API wallpaper supports unauthenticated GET requests only in the first version.

Do not add:

- POST body configuration.
- Custom headers.
- Bearer-token fields.
- Cookie or session handling.

If a test returns `401` or `403`, show a specific message explaining that the current version supports only GET APIs where authentication can be included in the URL query string.

Distinguish common failure states:

- Invalid URL.
- Timeout.
- CORS or host permission failure.
- Authentication required.
- JSON parse failure.
- JSON path did not resolve to an image URL.
- Response is not an image.
- Image download failed.

## RSS And API Test State

RSS and API share the same connectivity-state concept.

Every source row shows a status dot:

- Red: untested, failed, or key fields changed after the last successful test.
- Green: test passed and key fields still match the saved `fieldHash`.
- Loading: test is running.

When a user edits a key field, the row returns to red.

For RSS, key fields include source URL and fields that affect the active source identity. For API image sources, key fields include URL. For API JSON sources, key fields include URL and `jsonPath`.

Opening settings reads the last saved test state. A previously successful source stays green only if its key fields still match `fieldHash`.

Built-in RSS sources do not pretend to be green. They become green only after a successful test.

Only the currently selected RSS or API source must be green to enable `Apply configuration`.

## API Data Model

Use the existing `ptab_wallpaper` model. Do not add a separate API root key.

API config lives under `providers.api.config`:

```js
{
  apiType: "image",
  activeImageSourceId: "",
  activeJsonSourceId: "",
  refreshIntervalMs: 86400000,
  imageSources: [],
  jsonSources: []
}
```

API runtime state lives under `providers.api.state`:

```js
{
  lastCheckedAt: 0,
  lastSuccessAt: 0,
  lastError: "",
  lastSourceId: "",
  lastImageUrl: ""
}
```

API large image cache uses the existing IndexedDB key:

- `D.DB.API_BLOB`
- value: `ptab_wallpaper_blob_api`

This key already exists and should be reused. It is not a new key. API mode has one cached image, like Bing.

API thumbnails use existing shared maps:

- `ptab_wallpaper_thumbs.api`
- `ptab_wallpaper_blur_thumbs.api`
- `ptab_wallpaper_preview`

Do not use RSS-style multi-image blob keys for API.

## RSS Data Model Adjustments

RSS keeps the existing multi-image cache:

- `ptab_wallpaper_blob_rss_<id>`

RSS source rows gain persistent test state comparable to API source rows. RSS cached image behavior otherwise remains unchanged.

## Runtime Loading

`newtab.js` continues to read `activeSource` and dispatch by provider.

API loading flow:

1. Read `providers.api.config.apiType` and the active source ID for that type.
2. If `D.DB.API_BLOB` exists, display it first to provide immediate feedback.
3. Check `refreshIntervalMs`.
4. If refresh is due, call the API fetch path.
5. On success, overwrite `D.DB.API_BLOB`, update `thumbs.api`, update `ptab_wallpaper_preview`, update API state, and fade in the new wallpaper.
6. On failure, keep the existing displayed wallpaper and existing API cache, then record the error.

Refresh interval behavior:

- Off: use cache only.
- Every new tab: request on every new-tab load.
- 1 day, 3 days, 7 days: request only when `lastSuccessAt` is older than the interval.

Applying API after a successful test reuses the test image and writes it to `D.DB.API_BLOB`. It does not request the API again during apply.

RSS should also reuse a successful test or refresh result where practical.

## Import And Export Note

There is a separate future idea to add import and export controls to settings tabs.

The exported data should include user configuration, shortcuts, RSS/API source lists, and UI settings. It should not include cached wallpaper blobs, thumbnails, or blur thumbnails by default because those can be large.

This is recorded for later design and is not part of the API wallpaper implementation.

## Verification Scope

Do not add npm, package managers, build tools, frontend frameworks, lint frameworks, or test frameworks.

Verification should cover:

- `preload.js` still reads only `ptab_wallpaper_preview` synchronously.
- `index.html` keeps the wallpaper load order: `wallpaperBack`, `preload.js`, `wallpaperFront`, then other scripts.
- Wallpaper tab edits do not persist until `Apply configuration`.
- Closing settings without applying discards draft changes.
- Fixed header and footer stay visible while the wallpaper tab body scrolls.
- Apply button enables only for meaningful and valid changes.
- Upload mode can apply without opening a picker.
- Folder mode cannot apply until folder validation passes.
- RSS selected source must be green before RSS can apply.
- API selected source must be green before API can apply.
- RSS/API status dots turn red after key field edits and green after successful tests.
- Built-in RSS sources are red until tested.
- API image / redirect sources test image responses and redirects.
- API JSON sources test manual `jsonPath` and automatic field detection.
- API `401` and `403` show the authentication-specific message.
- Timeout, CORS, JSON path, non-image, and download failures show distinct messages.
- Applying API reuses the successful test image.
- API uses existing `D.DB.API_BLOB`; no API multi-image blob keys are introduced.
- Bing cache is retained when leaving Bing.
- Switching from Bing to another source does not prompt.
- Switching away from a non-Bing source with cached data prompts before cleanup.
- Canceling the cleanup prompt leaves saved config and cache unchanged.
- Confirmed cleanup removes references before deleting large files.
- Web mode remains best effort for CORS-limited APIs.

Temporary verification scripts, if needed, belong under `docs/ai-tasks/`.
