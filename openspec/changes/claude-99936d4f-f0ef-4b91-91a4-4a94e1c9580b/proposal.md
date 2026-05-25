# Proposal: TODO.md smoke test

## Goal

Add a TODO.md file at repo root with 3 pending items (docs, tests, ci) as a smoke test of the SDD flow.

## Approach

Single file creation, no code changes. The file signals outstanding work items in markdown checklist format.

## Alternatives considered

- README badges: more visible but pollutes README with work-in-progress state
- GitHub Issues: proper tracking but defeats the smoke-test purpose (too heavy)

## Decision

Direct TODO.md at root — idiomatic, zero-dependency, trivially revertible.

## Scope

- **In scope**: TODO.md creation only
- **Out of scope**: Documentation content, test writing, CI config

## Risks

None. This is a static markdown file with no runtime impact.
