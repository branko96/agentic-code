# Design: TODO.md smoke test

## Overview

Single markdown file at repository root. No build system, no config changes, no runtime impact.

## File Structure

`TODO.md` at repo root with:

```markdown
# TODO

- pendiente: docs
- pendiente: tests
- pendiente: ci
```

## Architectural Decisions

- **Location**: Repository root — idiomatic convention, discoverable by contributors and tooling.
- **Format**: GitHub-Flavored Markdown — zero dependencies, renders on GitHub UI.
- **Language**: Spanish (`pendiente:`) — matches the task requirement exactly.
- **Heading**: `# TODO` — standard heading for TODO files.

## Implementation

Single file write operation. No scaffolding, no migrations, no configuration.

## Verification

- `test -f TODO.md` (file exists)
- `grep -c "pendiente:" TODO.md` (3 matches)
- `git diff --stat` (only 1 file changed, 6 lines added)
