# REFERENCES.md

## This build

- Design spec: `../planning/specs/2026-07-22-proposal-review-web-app-design.md`
- The editor being served: `../identity.md`, `../rules.md`, `../examples.md`, `../reference/`

## Stack

- [Next.js App Router](https://nextjs.org/docs/app) - framework
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) - `@anthropic-ai/sdk`, the review call
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF text extraction
- [mammoth](https://www.npmjs.com/package/mammoth) - `.docx` text extraction
- [Tailwind CSS](https://tailwindcss.com/docs) - styling

## Environment

`.env.local` (gitignored, not committed):

    ANTHROPIC_API_KEY=sk-ant-...

## Deployment

Vercel, matching the rest of Antigravity's stack (see root `../../CLAUDE.md`
Tech Stack section). Set `ANTHROPIC_API_KEY` in the Vercel project's
environment variables, not in code.
