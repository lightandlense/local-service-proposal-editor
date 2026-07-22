export type Severity = "deal-killer" | "weakens" | "polish";
export type Verdict = "HOLD" | "FIXABLE" | "READY";

export interface Finding {
  rank: number;
  label: string;
  severity: Severity;
  quote: string;
  rule: string;
  reason: string;
  question: string;
}

export interface ParsedReview {
  verdict: Verdict;
  findings: Finding[];
  strongest: string | null;
}

const VERDICT_RE = /verdict:\s*(HOLD|FIXABLE|READY)/i;
const FINDING_HEADER_RE = /^\*\*(\d+)\.\s*(.+?)\s*[—-]\s*(deal-killer|weakens|polish)\*\*$/i;
const STRONGEST_RE = /^Strongest element:\s*(.+)$/i;
const FIELD_PATTERNS: Array<{ key: keyof Omit<Finding, "rank" | "label" | "severity">; re: RegExp }> = [
  { key: "quote", re: /^\*\*The line:\*\*\s*"?(.+?)"?$/i },
  { key: "rule", re: /^\*\*The rule it breaks:\*\*\s*(.+)$/i },
  { key: "reason", re: /^\*\*Why it fails for this reader:\*\*\s*(.+)$/i },
  { key: "question", re: /^\*\*What the fix must answer:\*\*\s*(.+)$/i },
];

// ponytail: hand-rolled line parser over a fixed markdown shape (rules.md's finding format), not a real markdown AST — add a proper parser if the model output ever needs nested formatting.
export function parseReview(raw: string): ParsedReview {
  const lines = raw.split("\n").map(stripQuoteMarker);

  const verdictLine = lines.find((l) => VERDICT_RE.test(l));
  const verdictMatch = verdictLine?.match(VERDICT_RE);
  if (!verdictMatch) {
    throw new Error("parseReview: no verdict line found in model response");
  }
  const verdict = verdictMatch[1].toUpperCase() as Verdict;

  const findings: Finding[] = [];
  let current: Partial<Finding> | null = null;
  let strongest: string | null = null;

  for (const line of lines) {
    const header = line.match(FINDING_HEADER_RE);
    if (header) {
      if (current) findings.push(finalizeFinding(current));
      current = {
        rank: Number(header[1]),
        label: header[2].trim(),
        severity: header[3].toLowerCase() as Severity,
      };
      continue;
    }

    if (current) {
      const field = FIELD_PATTERNS.find((f) => f.re.test(line));
      if (field) {
        const match = line.match(field.re)!;
        current[field.key] = match[1].trim();
        continue;
      }
    }

    const strongestMatch = line.match(STRONGEST_RE);
    if (strongestMatch) strongest = strongestMatch[1].trim();
  }
  if (current) findings.push(finalizeFinding(current));

  return { verdict, findings, strongest };
}

function stripQuoteMarker(line: string): string {
  return line.replace(/^>\s?/, "").trim();
}

function finalizeFinding(f: Partial<Finding>): Finding {
  const required: (keyof Finding)[] = ["rank", "label", "severity", "quote", "rule", "reason", "question"];
  for (const key of required) {
    if (f[key] === undefined) {
      throw new Error(`parseReview: finding #${f.rank ?? "?"} is missing "${key}"`);
    }
  }
  return f as Finding;
}
