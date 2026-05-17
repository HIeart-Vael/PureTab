# Core Rules

<!-- Loaded automatically at session start for all files -->

## Investigation & Accuracy

- Never speculate about code you have not read. Read files and search for usages before making claims.
- If the user references a file, read it before answering.
- Treat `.claude/rules/` as the current implementation guide. If the implementation and a rule disagree, the implementation wins for the immediate task, and the rule should be updated when the task asks for documentation sync.
- If uncertain, say so and propose how to verify. Do not fabricate APIs, paths, options, or behavior.

## Scope Discipline

- Do what has been asked; nothing more, nothing less.
- When intent is ambiguous, default to research and recommendations; only edit when explicitly asked.
- Make only the changes requested. Do not refactor adjacent code, add docstrings to unchanged code, or create abstractions for a single use.
- Follow scoping words ("only", "just", "exactly") literally.
- Preserve unrelated user changes in the working tree.

## Project Constraints

- Do not introduce build tools, `npm`, `package.json`, frontend frameworks, lint frameworks, test frameworks, or large runtime dependencies.
- Use vanilla JavaScript, native CSS, static browser APIs, and existing project modules.
- Keep the extension able to run as a standalone web page by opening `index.html`.

## Verification & Safety

- Before declaring done: re-check requirements, run the relevant static checks/tests, and state what changed and what could not be verified.
- Ask before destructive actions: deleting files/branches, force pushes, hard resets, or `--no-verify`.
- Edit existing files in place. Do not create new files unless required. Clean up scratch files.
- For storage and wallpaper changes, verify key names and startup order against `js/wallpaper/data.js`, `js/preload.js`, `index.html`, and `js/newtab.js`.

## First-Paint Discipline

- First paint has priority over structural elegance.
- Do not move `js/preload.js`, make it async, or add network/IDB/canvas/file-system work to it.
- `preload.js` may synchronously read only `ptab_wallpaper_preview` and write `#wallpaperBack`.
- At least one wallpaper layer must always have visible content or the built-in gradient fallback.

## Efficiency

- Parallelize independent reads where possible; serialize dependent edits and verification.
- Prefer fast text search first. If `rg` is unavailable or blocked, use the next best local search without stalling.
- Never use placeholder or guessed parameters.

## Memory Resilience

- Keep `AGENTS.md` as the shared AI entry point. `CLAUDE.md` is only a Claude Code adapter.
- Do not recreate the removed root `ai/` directory. Put temporary AI task notes under `docs/ai-tasks/`.
- Keep shared skills canonical in `.agents/skills/`; `.claude/skills/` should contain thin Claude adapters.
- When updating tool-specific memory files, sync durable project guidance back to `AGENTS.md` or `.claude/rules/`.
- If `AGENTS.md` or `CLAUDE.md` is reset, recover project context from `.claude/rules/` before editing.
