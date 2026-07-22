"use client";

import { useState } from "react";
import type { Finding, ParsedReview, Verdict } from "@/lib/parse-review";

const VERDICT_STYLE: Record<Verdict, string> = {
  HOLD: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  FIXABLE: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  READY: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
};

const SEVERITY_STYLE: Record<Finding["severity"], string> = {
  "deal-killer": "text-red-700 dark:text-red-400",
  weakens: "text-amber-700 dark:text-amber-400",
  polish: "text-zinc-500 dark:text-zinc-400",
};

interface ReviewRun {
  id: number;
  parsed: ParsedReview;
}

export default function Home() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<ReviewRun[]>([]);

  async function submitReview() {
    if (!file && !text.trim()) {
      setError("Paste a draft, or attach a file.");
      return;
    }
    setLoading(true);
    setError(null);

    const form = new FormData();
    if (file) form.set("file", file);
    else form.set("text", text);

    try {
      const res = await fetch("/api/review", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setRuns((prev) => [{ id: Date.now(), parsed: data as ParsedReview }, ...prev]);
    } catch {
      setError("Could not reach the review service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Proposal Review
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Paste a local-service marketing or automation proposal draft, or attach a file.
            It critiques; it never rewrites.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!!file}
            placeholder="Paste your draft here..."
            rows={10}
            className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-black outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="file"
                accept=".txt,.md,.docx,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs underline"
                >
                  clear
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={submitReview}
              disabled={loading}
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {loading ? "Reviewing..." : runs.length > 0 ? "Review again" : "Review"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </section>

        <section className="flex flex-col gap-8">
          {runs.map((run) => (
            <ReviewResult key={run.id} parsed={run.parsed} />
          ))}
        </section>
      </main>
    </div>
  );
}

function ReviewResult({ parsed }: { parsed: ParsedReview }) {
  return (
    <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <span
        className={`inline-block w-fit rounded-full px-3 py-1 text-sm font-semibold ${VERDICT_STYLE[parsed.verdict]}`}
      >
        {parsed.verdict}
      </span>

      {parsed.findings.map((finding) => (
        <div
          key={finding.rank}
          className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium text-black dark:text-zinc-100">
              {finding.rank}. {finding.label}
            </span>
            <span className={`text-xs font-semibold uppercase ${SEVERITY_STYLE[finding.severity]}`}>
              {finding.severity}
            </span>
          </div>
          <p className="italic text-zinc-600 dark:text-zinc-400">&ldquo;{finding.quote}&rdquo;</p>
          <p className="text-zinc-500 dark:text-zinc-500">{finding.rule}</p>
          <p className="text-zinc-700 dark:text-zinc-300">{finding.reason}</p>
          <p className="font-medium text-black dark:text-zinc-100">{finding.question}</p>
        </div>
      ))}

      {parsed.strongest && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Strongest element: {parsed.strongest}
        </p>
      )}
    </div>
  );
}
