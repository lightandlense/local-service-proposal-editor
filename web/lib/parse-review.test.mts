import { test } from "node:test";
import assert from "node:assert/strict";
import { parseReview } from "./parse-review.ts";

const SAMPLE = `
**Verdict: HOLD**

> **1. The proposal opens with you, not them — deal-killer**
> **The line:** "Apex Digital is a full-service digital marketing agency..."
> **The rule it breaks:** R1 — open with their problem, not your services.
> **Why it fails for this reader:** The owner skims this on their phone.
> **What the fix must answer:** What did you find about their web presence?
>
> **2. Guaranteed rankings — deal-killer**
> **The line:** "Rankings guaranteed within 60 days or your money back."
> **The rule it breaks:** R3 — no guarantees on outcomes you don't control.
> **Why it fails for this reader:** Marks you as the agency that burned them.
> **What the fix must answer:** What can you honestly commit to at 90 days?
>
> Strongest element: your pricing is realistic for this market.
`;

test("parses verdict, findings in order, and the strongest-element line", () => {
  const result = parseReview(SAMPLE);
  assert.equal(result.verdict, "HOLD");
  assert.equal(result.findings.length, 2);

  assert.equal(result.findings[0].rank, 1);
  assert.equal(result.findings[0].severity, "deal-killer");
  assert.match(result.findings[0].label, /opens with you/);
  assert.match(result.findings[0].quote, /^Apex Digital/);
  assert.match(result.findings[0].rule, /^R1/);

  assert.equal(result.findings[1].rank, 2);
  assert.match(result.findings[1].quote, /Rankings guaranteed/);

  assert.equal(result.strongest, "your pricing is realistic for this market.");
});

test("accepts FIXABLE and READY verdicts case-insensitively", () => {
  const fixable = parseReview("**verdict: fixable**\n\nStrongest element: fine as-is.");
  assert.equal(fixable.verdict, "FIXABLE");
  assert.equal(fixable.findings.length, 0);
});

test("throws when no verdict line is present", () => {
  assert.throws(() => parseReview("no verdict here, just prose about a proposal"));
});

test("throws when a finding is missing a required field", () => {
  const broken = `
**Verdict: READY**

> **1. Something — polish**
> **The line:** "x"
`;
  assert.throws(() => parseReview(broken));
});
