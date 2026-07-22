# CONTEXT.md - Review Pipeline

## Inputs

- **Draft** - pasted text, or an uploaded `.txt`/`.md`/`.docx`/`.pdf` file,
  from the browser
- **Rules** - `../identity.md`, `../rules.md`, `../examples.md`, every file
  under `../reference/` (repo root, read at request time, never copied
  into this folder)

## Process

1. `lib/extract.ts` turns an uploaded file into plain text. Pasted text
   skips this step.
2. `lib/load-rules.ts` reads the four rules inputs above and concatenates
   them into one system prompt string.
3. `app/api/review/route.ts` sends one Claude API call: system = the rules
   string, user message = the draft text.
4. `lib/parse-review.ts` splits the model's markdown response into
   `{ verdict: "HOLD" | "FIXABLE" | "READY", findings: Finding[] }` per the
   shape `rules.md` defines (`Finding = { rank, label, severity, quote,
   rule, reason, question }`).

## Outputs

- The parsed `{verdict, findings}` object, rendered by `app/page.tsx` as a
  colored verdict badge plus one card per finding.
- Nothing is persisted server-side. State lives in the browser tab for the
  session (paste, review, revise, review again).

## Human check

The user reads the findings, decides whether they're right, and edits
their own draft. The app never writes the fix. Re-submitting the revised
draft is a fresh call through the same pipeline, not a diff or a patch.

## Not built yet (v2)

Inline notation view - highlighting each finding's quote in place inside
the rendered draft instead of a separate card list. See
`../planning/specs/2026-07-22-proposal-review-web-app-design.md` for the
full v1/v2 split.
