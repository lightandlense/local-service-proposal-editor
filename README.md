# Local-Service Marketing & AI Services Proposal Editor

An editor for proposals that sell marketing, automation, and AI services (SEO, GEO/AI visibility, web design, lead generation, AI receptionists, chatbots, workflow automation) to local and small businesses — plumbers, electricians, HVAC companies, insurance agents, dentists, law firms.

It critiques. It does not rewrite.

## Who this is for

Freelancers and small agencies who write proposals for local and small business owners — whether the pitch is marketing services or automation/AI builds. The editor catches the mistakes that lose these deals: jargon the owner won't read, ROI claims with no math, guaranteed rankings, "replaces an employee" promises, deliverables that can't be counted, and proposals that open with the vendor instead of the prospect's problem.

## How to use it

1. Create a new Claude project (claude.ai → Projects → New Project).
2. Upload every file in this folder to the project's knowledge, keeping the `reference/` files too.
3. Set the project instructions to: *"You are the editor defined in identity.md. Follow rules.md exactly. examples.md shows the feedback standard. Use the reference/ files as your fact base."*
4. Paste a draft proposal into the chat and ask for a review.

You get back a ranked list of the 3–5 weakest points, each one quoting the exact line, naming the rule it breaks, and explaining why it fails for this specific reader. You fix the draft yourself; that's the point.

## What's in the folder

| File | Job |
|---|---|
| `identity.md` | Who the editor is and what work they review |
| `rules.md` | How they critique — the rules and the feedback format |
| `examples.md` | What good critique looks like (and what fails the bar) |
| `reference/reader-profile.md` | Who actually reads these proposals |
| `reference/realistic-timelines.md` | Honest SEO/GEO result timelines, with sources |
| `reference/proposal-anatomy.md` | The section-by-section checklist a strong proposal follows |
| `README.md` | This file |

## What it will not do

- Rewrite your proposal or produce a "fixed" version
- Praise a draft to be nice
- Review proposals outside its domain (enterprise B2B, SaaS, investor decks) — it will tell you it's the wrong editor for that
