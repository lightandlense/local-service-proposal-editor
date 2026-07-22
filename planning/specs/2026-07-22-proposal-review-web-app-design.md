# Proposal Review Web App - Design Spec
**Date:** 2026-07-22
**Project path:** `E:\Antigravity\Projects\proposal-editor\web`

---

## Overview

A one-page web app so a non-technical user can paste or upload a proposal
draft and get the editor's review back, without a Claude Project or Claude
Code. Same editor, same rules, new front door: `identity.md`, `rules.md`,
`examples.md`, and `reference/` at the repo root stay the single source of
truth and load as the system prompt. The web app never forks its own copy of
the rules.

This exists because the paste-and-go slash command (`.claude/skills/proposal-review/`)
already covers "seamless" for anyone with Claude Code installed, but Russell
wants an option for himself or a client with neither Claude Code nor a Claude
Project: open a URL, drop a file, read the notes.

## v1 scope

- Textarea to paste a draft, or drag-and-drop / file-picker upload
  (`.txt`, `.md`, `.docx`, `.pdf`)
- Extract plain text server-side, call the Claude API with the repo's
  identity/rules/examples/reference files as system prompt, draft as the
  user message
- Render the response: a colored verdict badge (HOLD red / FIXABLE amber /
  READY green) plus the findings list, each finding a card with its quote,
  rule, reason, and question
- "Review again" - paste or re-upload the revised draft, same page, fresh
  review appended below the previous one so the user can see what changed
- No accounts, no saved history beyond the current browser session

## v2 (not this pass)

- **Inline notation view** - render the draft text itself with each
  finding's quote highlighted in place (a redline/track-changes read), click
  a highlight to see the full finding in a side panel. This is the closest
  the tool gets to "notes on the document" instead of "notes in a list", and
  it is the main reason a v2 exists. Needs a quote-to-span matcher against
  the original text (exact substring match, same discipline `hod-review`'s
  `check.py` uses to gate LLM output elsewhere in this competition).
- Export the review as a markdown or PDF file
- Password gate if this ever needs to go in front of a client instead of
  just Russell

## Pipeline

    paste text OR upload file
        |
    [extract.ts] - pdf-parse / mammoth / plain read -> draft text
        |
    [review.ts] - Anthropic API call, system prompt = identity.md + rules.md
    |             + examples.md + reference/*.md, user message = draft text
        |
    [parse response] - split verdict line from the findings list
        |
    render: verdict badge + finding cards

## API route (`app/api/review/route.ts`)

Behavior:
- Accepts `{ draft: string }` (already-extracted text; extraction happens
  client-side-adjacent in a separate upload route, or inline before this
  call - implementer's choice)
- Reads `identity.md`, `rules.md`, `examples.md`, and every file under
  `reference/` from the repo root at request time (or bundles them at build
  time - either is fine, there is no reason to duplicate their content into
  a second copy anywhere)
- Calls the Claude API once, model TBD at build time (pick the cheapest
  model that holds the finding format under test, per SHARED_TOOLS.md
  model-selection guidance)
- Returns `{ verdict: "HOLD" | "FIXABLE" | "READY", findings: Finding[] }`
  where `Finding = { rank, label, severity, quote, rule, reason, question }`,
  parsed from the model's markdown response per the shape in `rules.md`

## File Structure

    proposal-editor/
    +-- identity.md, rules.md, examples.md, reference/   (existing, unchanged)
    +-- .claude/skills/proposal-review/                  (existing, unchanged)
    +-- planning/specs/                                  (this file)
    +-- web/
        +-- app/
        |   +-- page.tsx              - paste/upload UI + results panel
        |   +-- api/review/route.ts   - the API route above
        +-- lib/
        |   +-- extract.ts            - file -> plain text
        |   +-- parse-review.ts       - model markdown -> Finding[]
        +-- package.json

## Dependencies

| Package | Purpose |
|---------|---------|
| `next` | app framework, matches AgentTeam's default stack |
| `@anthropic-ai/sdk` | the review call |
| `pdf-parse` | extract text from uploaded PDFs |
| `mammoth` | extract text from uploaded `.docx` |
| `tailwindcss` | styling, matches AgentTeam's default stack |

## Out of Scope

- Rewriting or auto-fixing the draft, in any version - the editor's core
  rule (never rewrite) applies to the web app exactly as it applies to the
  Claude Project and the slash command
- Multi-user accounts, saved review history across sessions
- Any document type outside local-service marketing/automation proposals -
  same domain the markdown rules already enforce
- Editing `identity.md`/`rules.md`/`examples.md`/`reference/` as part of
  this build - the web app is a new front door, not a rules rewrite
