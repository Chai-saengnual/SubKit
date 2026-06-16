# SubKit Remediation 2026-06 — Shared Design Doc

**Branch convention:** All work lands on a single feature branch `codex/remediation-2026-06`, based on `main` (NOT on top of the in-flight `codex/fix-reminder-and-invoice-access` branch which has the issue #1 PR).

**Repo:** `https://github.com/Chai-saengnual/subkit`
**Local workspace:** `/Users/chalermpolsaengnual/Library/CloudStorage/OneDrive-Personal/01-CHAI_WORKSPACE/01-CHAI PROJECTS/Dev-Projects/Project-Subkit`
**Reference review:** `REVIEW.md` at repo root (already written — 500 lines, do not rewrite).
**Live app:** `https://subkit-ten.vercel.app/`
**Supabase project:** `hncffbdvniedxfkawjhl.supabase.co`

## What this plan covers

The 10 items in REVIEW.md §12, ranked by effort-vs-impact:

| # | Item | Where | Priority |
|---|---|---|---|
| 1 | Real README.md | new file at repo root | High — first impression |
| 2 | CSP meta tag | `index.html` <head> | High — defense in depth |
| 3 | Escape HTML in `tgMsg` for Telegram | `index.html:2201-2210` | High — real bug |
| 4 | "Stale rates" footer indicator | `index.html:1440` | Medium |
| 5 | `Promise.allSettled` in `send-reminders` | `supabase/functions/send-reminders/index.ts:75-126` | Medium |
| 6 | Unique constraint for `(id, last_remind)` race | new SQL migration | Medium |
| 7 | Document secrets model in README | rolled into item 1 | — |
| 8 | `await window.supabase` defensive load | `index.html:1167-1175` | Low |
| 9 | Refactor monolith into modules | skipped for v0.x | Skip |
| 10 | Add unit tests for `effectiveAmount`/`advanceDate` | new test file | Medium |

Items 1 (covers 7), 2-4-8 (all in `index.html`), and 5-6-10 (edge function + tests) are split into 3 parallel tracks.

## Item 9 (refactor) is explicitly out of scope

Per REVIEW.md §6 — "Refactor at v1.0, not before." Do not touch this.

## In-flight PR

`codex/fix-reminder-and-invoice-access` (issue #1) is open. The user will merge that separately. The new branch `codex/remediation-2026-06` MUST be cut from `main`, not from that branch, to avoid mixing concerns.

## Worker conventions

- **No `push` to remote.** Commit locally, report commit hash in `deliverable.md`.
- **Branch:** start from `origin/main`, create `codex/remediation-2026-06`, push branch (NO commits to remote, but push the branch ref so verifier can fetch).
  - Actually, since workers can be cold-started, simpler: do all work in worktree on `codex/remediation-2026-06` and never push. The user will pull locally.
  - Even simpler: just work on a single shared branch locally. If multiple workers run in parallel, the orchestrator handles sequencing.
- **Format `deliverable.md` like:**
  ```markdown
  # <task title>
  - Branch: codex/remediation-2026-06
  - Commits: <list of commit hashes with one-line descriptions>
  - Files changed: <paths>
  - Behavior change: <what user-visible behavior differs>
  - Test evidence: <commands run, output>
  - Open questions: <anything the user should know>
  ```

## Test conventions

- There is no existing test framework. The new unit tests (item 10) introduce a minimal one: `deno test` for the edge function, plus a tiny `node --test` or vanilla `assert` runner for the JS helpers.
- For HTML changes, the verifier runs `node -e "..."` style smoke checks against the served file.

## Code style constraints

- Match the existing style: `var` everywhere, no semicolons optional (current file uses no semis), template strings, 2-space indent. Do NOT "modernize" the codebase — that's item 9.
- Inline `onclick=` handlers stay. We're not adding a build step.
- The `esc()` helper at `index.html:1273` is the canonical sanitizer — reuse it.
