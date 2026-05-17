# CLAUDE.md

Claude Code adapter for PlainTab.

Shared project instructions live in `AGENTS.md`. Canonical system rules live in `.claude/rules/`.

Before editing:

1. Read `AGENTS.md`.
2. Read `.claude/rules/00-core.md`.
3. Read the matching rule file under `.claude/rules/` for the touched module.

Important notes:

- Do not recreate the removed root `ai/` directory.
- Treat `.agents/skills/` as the canonical shared skill source.
- Keep `.claude/skills/` as thin Claude adapters.
- Store task notes and temporary AI planning under `docs/ai-tasks/`.
- Keep `CLAUDE.md` short; update `AGENTS.md` for shared guidance.
