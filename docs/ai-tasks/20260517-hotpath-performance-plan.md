# PlainTab Hot Path Performance Plan

## Goal

Make the new tab startup path ruthlessly small: show the cached wallpaper preview immediately, load the full wallpaper smoothly, and move nonessential UI systems out of the first-load path.

## Decisions

- Treat v3.2.0 as the storage migration baseline.
- Do not migrate v1/v2/pt3 data forward. Previous versions had little valuable data, and keeping that migration in the hot data module is not worth the long-term cost.
- Keep migration discipline from v3.2.0 onward with explicit future migrations.
- Commit the migration-baseline reset separately from the runtime performance work.

## Commit Sequence

1. `refactor(storage): reset migration baseline to v3.2.0`
   - Remove old v1/v2 migration maps and migration functions from `js/wallpaper/data.js`.
   - Replace old migration probing with a lightweight current-schema initializer.
   - Simplify `js/preload.js` to read only `ptab_wallpaper_preview`.
   - Update storage tests to assert the new baseline behavior.

2. `perf: shrink new tab startup hot path`
   - Stop settings hydration from writing `localStorage` repeatedly during startup.
   - Gate wallpaper theme extraction before canvas work.
   - Lazy-load command palette JavaScript and CSS on first use.
   - Keep command palette hotkeys available through the lightweight shortcut model.

3. `perf: defer cold settings surfaces`
   - Keep L1 settings available at startup.
   - Defer modal-heavy and gallery-heavy work until those surfaces open.
   - Keep wallpaper rendering and preview persistence ahead of all cold UI work.

## Verification

- `node docs/ai-tasks/20260517-storage-v3-migration-test.js`
- `node docs/ai-tasks/20260517-settings-freedom-test.js`
- `node docs/ai-tasks/20260517-hotpath-performance-test.js`
- Browser smoke test by opening `index.html` directly.
