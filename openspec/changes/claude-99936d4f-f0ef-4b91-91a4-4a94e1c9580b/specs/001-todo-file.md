# Spec: TODO.md creation

## Capability: Root TODO.md

- A file named `TODO.md` must exist at the repository root
- Content must be valid GitHub-flavored Markdown
- Must contain exactly 3 list items, each prefixed with `- pendiente:`
- Items in order: `docs`, `tests`, `ci`
- The file must NOT contain any other content beyond the 3 bullets and a preceding heading

## Constraints

- No existing files may be modified
- No runtime dependencies introduced
- No CI configuration changes
