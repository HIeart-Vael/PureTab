# RSS Wallpaper Design

Date: 2026-05-17

## Goal

Implement RSS as a complete PlainTab wallpaper source while preserving the zero-white-flash wallpaper pipeline, static extension constraints, and the existing `ptab_wallpaper` storage model.

## User Experience

RSS appears as one of the five wallpaper sources in the wallpaper settings tab. When selected, it exposes an RSS configuration area with:

- An RSS source list with at most 5 sources.
- Two default built-in sources:
  - NASA APOD: `https://apod.nasa.gov/apod.rss`
  - Bing RSSHub: `https://rsshub.app/bing`
- A mutually exclusive selector so only one RSS source is active at a time.
- A test button on every source row.
- Delete controls, including for built-in sources.
- A form for adding custom sources.
- Global RSS options for refresh and article overlay behavior.

The active RSS source fetches the newest available feed entries, up to 12. Each cached item stores the wallpaper image, title or description, and article link.

RSS article information is shown as an overlay on the new-tab page when enabled. It does not auto-open links. The article link opens only when the user clicks it.

The overlay has global settings:

- Show summary: on or off.
- Show article link: on or off.
- Position: top or bottom.
- Display mode: expanded strip or collapsed `i` button.

The overlay does not try to avoid the search bar. Instead, the search bar always has a higher layer and remains clickable and editable even if the overlay visually extends underneath it.

## Refresh Behavior

The automatic RSS refresh interval is a global RSS setting:

- Off.
- 1 day.
- 3 days.
- 7 days.

RSS loading prioritizes local cached content. Opening a new tab must not wait on the network before showing a wallpaper. If the active RSS source is due for refresh, PlainTab checks the feed in the background.

On successful refresh:

- Parse the most recent feed entries, up to 12.
- Extract image URLs from RSS and Atom fields, including `enclosure`, `media:content`, HTML in `description` or `content`, and common image fields where available.
- Download usable images.
- Cache image blobs in IndexedDB.
- Generate thumbnails for first paint and gallery use.
- Store lightweight item metadata in `ptab_wallpaper.cache.meta`.
- Delete RSS blobs no longer referenced by the newest 12-item cache window.

On failure:

- Keep the existing RSS cache.
- Update `providers.rss.state.lastCheckedAt` and `lastError`.
- Do not switch away from RSS if RSS was already active and cached content exists.
- If RSS has no cache and first activation fails, remain on or return to Bing.

RSS rotation uses the cached order from newest to oldest, then cycles through the list across new-tab opens.

## Data Model

Use the existing `ptab_wallpaper` model. Do not add a separate RSS root key.

RSS config lives under `providers.rss.config`:

```js
{
  sources: [
    {
      id: "nasa-apod",
      name: "NASA APOD",
      url: "https://apod.nasa.gov/apod.rss",
      builtIn: true
    },
    {
      id: "bing-rsshub",
      name: "Bing",
      url: "https://rsshub.app/bing",
      builtIn: true
    }
  ],
  activeSourceId: "nasa-apod",
  refreshIntervalMs: 86400000,
  showSummary: true,
  showLink: true,
  summaryPosition: "bottom",
  summaryMode: "expanded"
}
```

RSS runtime state lives under `providers.rss.state`:

```js
{
  lastCheckedAt: 0,
  lastSuccessAt: 0,
  lastImageUrl: "",
  lastError: "",
  lastTestAt: 0
}
```

The active RSS cache uses the shared cache fields:

- `cache.order`: RSS item IDs, each prefixed with `rss_`.
- `cache.index`: shared rotation index.
- `cache.meta[rss_<id>]`: article metadata.

RSS metadata should include:

```js
{
  sourceId: "nasa-apod",
  sourceName: "NASA APOD",
  title: "",
  description: "",
  link: "",
  imageUrl: "",
  publishedAt: 0,
  fetchedAt: 0
}
```

Large files use the existing RSS IndexedDB prefix:

- `ptab_wallpaper_blob_rss_<id>`

Thumbnails use the existing `ptab_wallpaper_thumbs` map.

## Settings UI

The RSS drawer in the wallpaper tab has three parts.

### Source List

Each source row shows:

- Radio selector.
- Source name.
- Shortened URL.
- Test button.
- Delete button.

The list accepts up to 5 sources. When the limit is reached, the add form is disabled or shows a clear limit message.

The add form contains:

- Source name.
- Feed URL.
- Add button.

URLs must be `http://` or `https://`.

### Global RSS Options

The drawer includes:

- Auto refresh interval select: off, 1 day, 3 days, 7 days.
- Summary position select: top or bottom.
- Summary mode select: expanded strip or collapsed `i` button.
- Show summary toggle.
- Show link toggle.

These settings are global for RSS, not per source.

### Status

The RSS area shows concise status text, such as:

- Cached `8/12` items.
- Last successful refresh time.
- Last test result.
- Web mode CORS limitation where relevant.

## Wallpaper Reset

The bottom of the wallpaper tab includes a separate "restore default wallpaper settings" action. It is distinct from the appearance tab reset.

After user confirmation, it:

- Sets the active wallpaper source to Bing.
- Restores the default RSS source list and RSS config.
- Resets RSS, API, and folder provider config.
- Clears RSS, API, upload, and folder cached wallpaper blobs.
- Clears active-source thumbnails, blur thumbnails, cache order, metadata, and preview.
- Keeps UI appearance settings.
- Keeps language settings.
- Keeps search settings.
- Keeps command palette shortcuts and shortcut data.

## Permissions And Web Mode

Extension mode is the complete support target. RSS fetch and image download should request or rely on host permissions for the relevant feed and image hosts.

Web mode remains best effort. Because static `index.html` cannot bypass feed CORS restrictions, RSS testing or refresh may fail for sources that do not permit browser fetches. In that case, show a clear status message instead of silently failing.

No proxy service or backend is introduced.

## Testing And Verification

Do not add npm, package managers, build tools, or test frameworks.

Verification should cover:

- Default RSS sources appear.
- Source list enforces a 5-source limit.
- Source selection is mutually exclusive.
- RSS URL validation accepts only `http://` or `https://`.
- Test button reports success and expected failure states.
- NASA APOD and Bing RSSHub can be tested in extension mode where permissions allow.
- Refresh caches up to 12 RSS items.
- Cached item metadata includes image, description, and article link.
- RSS mode loads cached wallpaper before network refresh.
- Failed refresh keeps existing cached wallpaper.
- Summary overlay supports top, bottom, expanded, and `i` modes.
- Search bar remains interactive above the summary overlay.
- Restore default wallpaper settings resets only wallpaper data and preserves non-wallpaper settings.

Temporary verification scripts, if needed, belong under `docs/ai-tasks/`.
