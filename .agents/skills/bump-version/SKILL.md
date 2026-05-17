---
name: bump-version
description: Use when bumping the PlainTab version number across all files — manifest.json, 16 README badge URLs, 16 changelog files, AGENTS.md, docs/, and all project docs. Triggered by phrases like "更新版本", "bump version", "upgrade to vX.Y.Z", "发布新版本".
---

# Bump PlainTab Version

## Overview

Automates version bumping across the entire PlainTab project. Covers mechanical replacements (badge URLs, manifest) and content generation (changelog entries in 16 languages, release notes).

## Parameters

Ask the user for:
- **Version number** (e.g., `3.1.2`)
- **Brief changelog** in Chinese — what changed? One sentence per conventional commit line

If the user doesn't provide a changelog, derive it from `git log` since the last version tag.

## Step 1: Mechanical Replacements

### 1a. manifest.json

```
"version": "X.Y.Z",
```

### 1b. Badge URLs (17 READMEs)

```bash
sed -i 's/version-OLD_VERSION-blue/version-NEW_VERSION-blue/g' README.md docs/README_*.md
```

OLD_VERSION is the current version from manifest.json before the edit.

## Step 2: docs/changelog-i18n/ (16 files)

Each `docs/changelog-i18n/XX.txt` needs a new entry at the top, using compact `• vX.Y.Z · ...` format. No sub-bullets, no conventional commit tags.

```
• v3.1.2 · [One sentence in this language covering everything changed]
```

Example (zh-CN):
```
• v3.1.1 · 将 Bing API 切换为 Promise.any 竞速模式并添加 8 秒 AbortController 超时；更新全部 16 语言 README 以反映新的获取策略。
```

Example (en):
```
• v3.1.1 · Switched Bing API to Promise.any race mode with 8-second AbortController timeout; updated all 16 language READMEs to reflect the new fetch strategy.
```

Translate the single-line summary into each of the 16 languages.

Languages: en, zh-CN, zh-TW, hi, es, ar, fr, pt_BR, ru, de, ja, it, tr, vi, ko, pl

## Step 3: docs/changelog.md

Add a new section at the top. Unlike `changelog-i18n/*.txt` (single-line), this uses conventional commit sub-bullets:

```markdown
## vX.Y.Z

[One-line English summary]

- `perf`: description
- `feat`: description

[One-line Chinese summary]

- `perf`: 中文描述
- `feat`: 中文描述
```

## Step 4: docs/release-note.md

**Replace the entire file** with only the current version's content. Do NOT keep old versions. Historical details live in `docs/changelog.md`.

```
**PlainTab vX.Y.Z**

- It is recommended to install online... [English boilerplate]
- For manual installation...

**Changelog (vX.Y.Z)**

- `perf`: description
- `feat`: description

**Summary (vX.Y.Z)**

[One paragraph in English — what, why, impact.]

---

**PlainTab vX.Y.Z**

- 建议前往 [Chrome 网上应用店]... [Chinese boilerplate]

**更新日志 (vX.Y.Z)**

- `perf`: 中文描述
- `feat`: 中文描述

**总结 (vX.Y.Z)**

[一段中文总结。]
```

Key rules:
- Installation boilerplate is identical across versions (only version number changes)
- Changelog uses conventional commit sub-bullets — English tags, translated descriptions
- Summary is a well-written paragraph (not bullet points), bilingual

## Step 4b: docs/store-listing/ (16 files)

Each `docs/store-listing/XX.txt` contains the full Chrome Web Store description for one language. Add the vX.Y.Z changelog entry at the top of the changelog block, using compact `• vX.Y.Z · ...` format. All 16 files must be updated.

## Step 5: Project Docs

### 5a. AGENTS.md

Check and update if it mentions outdated behavior. Common spots:
- "Bing API endpoints" section — if the fetch strategy changed

### 5b. docs/requirements.md

- Update any outdated feature descriptions
- Add iteration history entry under the current month

### 5c. docs/architecture.md

Update any sections describing changed behavior. Use simple language matching the existing tone.

## Step 6: Verify

```bash
grep -r "OLD_VERSION" --include="*.{json,md,txt}" | grep -v node_modules
```

Should return zero results (no stale version references left behind).

Then do a spot check on 2-3 random language files to verify changelog entries were added correctly.

## Common Patterns

### Conventional commit tags

| Tag | Use when |
|-----|---------|
| `perf` | Performance improvement |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructuring, no behavior change |
| `style` | Visual/UI adjustment |
| `chore` | Build, deps, version bumps |

### File count summary

| Category | Count | Files |
|----------|-------|-------|
| manifest | 1 | `manifest.json` |
| README badges | 16 | root (1) + docs/ (15) |
| changelog-i18n | 16 | `docs/changelog-i18n/*.txt` |
| store-listing | 16 | `docs/store-listing/*.txt` |
| changelog.md | 1 | `docs/changelog.md` |
| release-note.md | 1 | `docs/release-note.md` |
| Project docs | 3 | `AGENTS.md`, `docs/requirements.md`, `docs/architecture.md` |
| **Total** | **54** | |
