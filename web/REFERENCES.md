# REFERENCES.md

## This build

- Design spec: `../planning/specs/2026-07-22-proposal-review-web-app-design.md`
- The editor being served: `../identity.md`, `../rules.md`, `../examples.md`, `../reference/`

## Stack

- [Next.js App Router](https://nextjs.org/docs/app) - framework
- [Claude Code CLI](https://code.claude.com/docs) - the review call, shelled out via `node:child_process` (`lib/claude-cli.ts`). Not the Anthropic SDK - see Auth below.
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF text extraction
- [mammoth](https://www.npmjs.com/package/mammoth) - `.docx` text extraction
- [Tailwind CSS](https://tailwindcss.com/docs) - styling

## Auth: runs on Russell's Claude subscription, not a billed API key

`lib/claude-cli.ts` calls the local `claude` binary (`claude --print --system-prompt ... --tools "" --output-format json --no-session-persistence`) instead of `@anthropic-ai/sdk`. It explicitly strips `ANTHROPIC_API_KEY`/`ANTHROPIC_AUTH_TOKEN` from the child process's environment so the CLI falls back to its own stored login - the same subscription-based auth Claude Code itself uses, not pay-per-token API billing.

**This only works on a machine where `claude` is installed and already logged in** (`claude auth login` / `claude login`, subscription-based). There is no API key to configure - `.env.local` and `ANTHROPIC_API_KEY` are unused now.

## Deployment

**Not deployable to Vercel or any serverless host** - those environments don't have the `claude` CLI installed or an authenticated session, and there's nowhere to run `claude login` interactively on a stateless function. This has to run somewhere with a persistent filesystem and an already-logged-in `claude` CLI: Russell's own machine, or a VM/always-on box you `ssh` into and log in once.

If a hosted, always-available version is wanted later, that requires either (a) going back to a billed API key on a normal host (Vercel works again), or (b) self-hosting a VM with `claude` logged in and keeping it running. Not decided - flag to Russell before building either.
