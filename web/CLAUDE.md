# CLAUDE.md - Proposal Review Web App

## What this is

The web front door for the proposal editor. Paste or upload a draft, get
back a HOLD/FIXABLE/READY verdict and the findings - no Claude Project
needed, no Claude Code session for the *visitor* to run. Same rules as
everywhere else in this repo. Under the hood the server itself shells out
to the local `claude` CLI (see REFERENCES.md - Auth) - so the host running
this app still needs Claude Code installed and logged in.

## Where everything lives

| Need | Go to |
|---|---|
| The pipeline (inputs -> process -> outputs) | `CONTEXT.md` |
| Tech stack, package docs, design spec | `REFERENCES.md` |
| Next.js framework-version warnings | `AGENTS.md` |
| The UI | `app/page.tsx` |
| The API route | `app/api/review/route.ts` |
| File -> text extraction | `lib/extract.ts` |
| Model response -> `{verdict, findings}` | `lib/parse-review.ts` |
| Loading the editor's rules for the system prompt | `lib/load-rules.ts` |
| Shelling out to the local `claude` CLI (subscription auth, not a billed key) | `lib/claude-cli.ts` |
| The actual editor identity/rules/examples | `../identity.md`, `../rules.md`, `../examples.md`, `../reference/` (repo root, one level up) |

## The one rule that matters here

This app never generates a rewrite or a fixed draft. It calls the same
editor defined at the repo root, which critiques and hands back questions.
If a change makes the app produce replacement prose for the user's draft,
that change is wrong regardless of what else it does. See `../rules.md`.

## Running it

    npm install
    npm run dev

No API key needed. Needs the `claude` CLI installed and already logged in
on this machine (`claude auth login` / `claude login`) - see `REFERENCES.md`
- Auth. Not deployable to Vercel or any serverless host for the same reason.
