import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const REPO_ROOT = path.resolve(process.cwd(), "..");

export async function loadRules(): Promise<string> {
  const [identity, rules, examples] = await Promise.all([
    readFile(path.join(REPO_ROOT, "identity.md"), "utf-8"),
    readFile(path.join(REPO_ROOT, "rules.md"), "utf-8"),
    readFile(path.join(REPO_ROOT, "examples.md"), "utf-8"),
  ]);

  const referenceDir = path.join(REPO_ROOT, "reference");
  const referenceFiles = (await readdir(referenceDir)).filter((f) => f.endsWith(".md")).sort();
  const referenceContents = await Promise.all(
    referenceFiles.map((f) => readFile(path.join(referenceDir, f), "utf-8"))
  );

  return [identity, rules, examples, ...referenceContents].join("\n\n---\n\n");
}
