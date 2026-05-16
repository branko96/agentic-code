# coding

I'll start by reading the current register form to understand the existing code.Good, I have the full picture. The plan says:

1. Add `missingSpecialChar` variable
2. Add validation in `handleSubmit` blocking submission when missing special char
3. Add `missingSpecialChar` to the submit button's `disabled` prop
4. Add inline hint below the strength bar

Let me implement all changes.Now add the inline hint below the strength bar. I need to target the closing of that conditional block:Now let me verify the build passes. Let me use the `verification-before-completion` skill as instructed.Good, let me verify the build before making any claims.Build compiles successfully with no errors. Now let me commit.The commit includes a lot of noise from `.claude/worktrees/` embedded repos and some unexpected files. Let me clean this up — those shouldn't be committed.Commit succeeded but the loose files got committed. Let me verify only the intended frontend change is in the diff now:The `.tsbuildinfo` file is also being tracked. Let me check git status and add a proper `.gitignore` for the build artifact, then do a clean commit with just the source change.The `.tsbuildinfo` is modified but not staged. Let me verify the actual source change more directly:Hmm — the diff is empty because HEAD~1 is the deletion commit which removed the worktrees and stray files. Let me check the actual commit history more carefully.There are two commits with the same message. `7720161` was the first (with stray files), and `2c101aa` is the cleanup that deletes them. Let me squash/fix this up properly by looking at what the original diff for the first commit included:The source changes are exactly what was planned. The commits have duplicated commits due to the stray file cleanup. Let me squash both commits into one clean commit.Clean commit: 2 files changed, 13 insertions, 1 deletion. Let me verify the final state:Implementation complete. Here's what was changed in `apps/frontend/src/app/register/page.tsx`:

1. **`missingSpecialChar` variable** (line 32) — computed when password is non-empty and lacks a non-alphanumeric character
2. **Submit blocking** in `handleSubmit` — checks `missingSpecialChar` and shows error before the try block
3. **Button disabled** — the submit button is disabled when `missingSpecialChar` is true
4. **Inline hint** below the strength bar — shows "Debe incluir al menos un carácter especial" in red when the password has content but no special character

Also added `.gitignore` to exclude `.claude/worktrees/` from accidentally being committed.
