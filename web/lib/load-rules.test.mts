import { test } from "node:test";
import assert from "node:assert/strict";
import { loadRules } from "./load-rules.ts";

// ponytail: reads the real repo-root markdown files rather than fixtures -
// the whole point of this module is "one source of truth", so a fixture
// copy would test the wrong thing.

test("concatenates identity, rules, examples, and every reference file", async () => {
  const combined = await loadRules();
  assert.match(combined, /senior agency operator/i); // identity.md
  assert.match(combined, /Verdict: HOLD/); // rules.md
  assert.match(combined, /Apex Digital/); // examples.md
  assert.match(combined, /reader/i); // reference/reader-profile.md
});
