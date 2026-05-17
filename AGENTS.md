# AGENTS.md

Shared instructions for AI agents working on PlainTab.

PlainTab is a Chrome/Edge Manifest V3 new-tab extension. It is also able to run as a standalone web page by opening `index.html` directly.

## Rule Priority

Use this order when instructions conflict:

1. `.claude/rules/00-core.md`
2. The matching file under `.claude/rules/`
3. This `AGENTS.md`
4. Tool-specific adapters such as `CLAUDE.md`
5. Reference docs and task notes

Before changing core behavior, read `00-core.md` and the relevant module rule. Use `.claude/rules/README.md` as the rule map.

## Project Constraints

Do not introduce:

- Build tools
- `npm` or `package.json`
- Frontend frameworks
- Lint or test frameworks
- Large runtime dependencies

Use vanilla JavaScript, native CSS, and static browser extension assets.

## Required Rule Files

- Rule map: `.claude/rules/README.md`
- Core behavior: `.claude/rules/00-core.md`
- Storage, IndexedDB, localStorage, migrations: `.claude/rules/10-storage.md`
- Wallpaper rendering, first paint, image lifecycle: `.claude/rules/20-wallpaper.md`
- Language detection and fallback: `.claude/rules/30-language.md`
- Startup flow and global interactions: `.claude/rules/40-runtime.md`
- Search behavior: `.claude/rules/50-search.md`
- Settings panel UI and state: `.claude/rules/60-settings.md`
- Command palette: `.claude/rules/70-command-palette.md`

## Startup Invariants

`index.html` loading order is part of the zero-white-flash design:

1. `#wallpaperBack` exists first
2. `js/preload.js` runs synchronously
3. `#wallpaperFront` exists
4. Other DOM follows
5. `js/languages.js`
6. Main runtime scripts

Do not move `preload.js`, make it async, or add network work to the first-paint path.

## Wallpaper And Storage Safety

The wallpaper system uses a stable back layer and a transition front layer. At least one layer must always have visible content.

Storage safety rules:

- Write large data before writing references
- Remove references before deleting large data
- Access IndexedDB through the storage module, not from unrelated UI code
- Revoke Blob URLs when they are no longer needed
- Preserve localStorage key compatibility unless a migration exists

## Performance And UI Rules

- First paint has priority over structural elegance
- Startup code must avoid long main-thread work
- Use `requestIdleCallback` for non-critical follow-up work where appropriate
- Batch DOM writes and avoid layout thrashing
- Animate only `opacity` and `transform`
- Keep UI quiet, minimal, and content-first
- Do not use heavy glassmorphism, overshoot easing, or large-area scale animations
- Prefer CSS class changes over dynamic transition/transform style writes in JavaScript
- Keep shared visual tokens centralized in CSS variables

## Scope Discipline

- Make the smallest change that solves the task
- Do not rewrite stable modules for style or architecture alone
- Do not add abstractions unless they remove real duplicated complexity
- In fix tasks: fix the bug, do not redesign the system
- Preserve unrelated user changes in the working tree

## AI Documentation Layout

There is no root `ai/` directory. Do not recreate it.

Use these locations instead:

- `AGENTS.md`: shared AI entry point
- `CLAUDE.md`: Claude Code adapter only
- `.claude/rules/`: canonical project rules
- `.agents/skills/`: canonical shared skills for Codex and generic agents
- `.claude/skills/`: thin Claude adapters that point to `.agents/skills/`
- `docs/ai-tasks/`: task plans, review notes, and temporary AI work records

Tool caches such as `.superpowers/` and `.playwright-mcp/` are not project documentation.

## Skill Ownership

Keep reusable project skills under `.agents/skills/` and commit them to git. Claude-specific copies under `.claude/skills/` should be adapters only, so the long workflow has one source of truth.

When changing a shared skill:

1. Edit `.agents/skills/<skill>/SKILL.md`.
2. Keep `.claude/skills/<skill>/SKILL.md` as a short adapter.
3. Update `.agents/README.md` if ownership rules change.

## Running The Project

Extension mode:

- Open `chrome://extensions`
- Enable developer mode
- Load this directory as an unpacked extension

Web mode:

- Open `index.html` directly in a browser

## Commits

Use Conventional Commits:

- `feat:`
- `fix:`
- `perf:`
- `refactor:`
- `chore:`
- `docs:`
