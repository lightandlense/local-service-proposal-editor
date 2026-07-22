import { NextRequest, NextResponse } from "next/server";
import { extractText } from "@/lib/extract";
import { loadRules } from "@/lib/load-rules";
import { runClaude } from "@/lib/claude-cli";
import { parseReview } from "@/lib/parse-review";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const text = form.get("text");

  let draft: string;
  try {
    if (file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      draft = await extractText({ name: file.name, buffer });
    } else if (typeof text === "string" && text.trim()) {
      draft = text.trim();
    } else {
      return NextResponse.json(
        { error: "Provide a draft: paste text or attach a file." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Could not read that file." }, { status: 400 });
  }

  const system = await loadRules();

  let raw: string;
  try {
    raw = await runClaude(system, draft);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "The review service is unavailable.";
    return NextResponse.json({ error: detail }, { status: 502 });
  }

  try {
    const parsed = parseReview(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Could not parse the editor's response.", raw },
      { status: 502 }
    );
  }
}
