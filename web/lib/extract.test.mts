import { test } from "node:test";
import assert from "node:assert/strict";
import { extractText } from "./extract.ts";

// ponytail: only the branch logic is unit-tested here. Real .pdf/.docx parsing
// is delegated to pdf-parse/mammoth and trusted rather than re-verified with
// fabricated binary fixtures.

test("returns .txt content as-is", async () => {
  const result = await extractText({ name: "draft.txt", buffer: Buffer.from("hello world") });
  assert.equal(result, "hello world");
});

test("returns .md content as-is", async () => {
  const result = await extractText({ name: "draft.md", buffer: Buffer.from("# Heading\n\nBody") });
  assert.equal(result, "# Heading\n\nBody");
});

test("is case-insensitive on extension", async () => {
  const result = await extractText({ name: "DRAFT.TXT", buffer: Buffer.from("hi") });
  assert.equal(result, "hi");
});

test("throws on an unsupported extension", async () => {
  await assert.rejects(() => extractText({ name: "draft.exe", buffer: Buffer.from("x") }));
});
