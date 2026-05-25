# Tasks: TODO.md smoke test

## Implementation Tasks

1. **Create `TODO.md` at repo root**
   - File: `/home/branko/workspaces/agentic-code/.worktrees/99936d4f-f0ef-4b91-91a4-4a94e1c9580b/TODO.md`
   - Content:

     ```markdown
     # TODO

     - pendiente: docs
     - pendiente: tests
     - pendiente: ci
     ```

   - Verification: file exists with correct content
   - Rollback: `git checkout -- TODO.md` or `rm TODO.md`

## Verification Tasks

2. **Verify file existence and content**
   - `test -f TODO.md` returns 0
   - `grep -c "pendiente:" TODO.md` returns 3
   - `git diff --stat` shows only 1 file, 6 lines added

## Review Workload Forecast

- Estimated changed lines: 6
- 400-line budget risk: Low
- Chained PRs recommended: No
- Decision needed before apply: No
