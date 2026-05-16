# Core Rules

<!-- Loaded automatically at session start for all files -->

## Investigation & Accuracy
- Never speculate about code you have not read. Read files and ripgrep for usages before making claims
- If the user references a file, read it before answering
- If uncertain, say so and propose how to verify. Do not fabricate APIs, paths, or behavior

## Scope Discipline
- Do what has been asked; nothing more, nothing less
- When intent is ambiguous, default to research and recommendations — only edit when explicitly asked
- Make only the changes requested. Do not refactor adjacent code, add docstrings to unchanged code, or create abstractions for a single use
- Follow scoping words ("only", "just", "exactly") literally

## Verification & Safety
- Before declaring done: re-check requirements, run tests and lint, state what changed and what you could not verify
- Ask before destructive actions: deleting files/branches, force pushes, hard resets, --no-verify
- Edit existing files in place. Do not create new files unless required. Clean up scratch files

## Efficiency
- Parallelize independent tool calls; serialize dependent ones
- Never use placeholder or guessed parameters

## Memory Resilience
- Keep `AGENTS.md` as the shared AI entry point. `CLAUDE.md` is only a Claude Code adapter
- Do not recreate the removed root `ai/` directory. Put temporary AI task notes under `docs/ai-tasks/`
- Keep shared skills canonical in `.agents/skills/`; `.claude/skills/` should contain thin Claude adapters
- When updating tool-specific memory files, sync durable project guidance back to `AGENTS.md` or `.claude/rules/`
- If `AGENTS.md` or `CLAUDE.md` is reset, recover project context from `.claude/rules/` before editing
