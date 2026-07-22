import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractText } from "@/lib/extract";
import { loadRules } from "@/lib/load-rules";
import { parseReview } from "@/lib/parse-review";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 500 });
  }

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
  const anthropic = new Anthropic({ apiKey });

  let message;
  try {
    message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: draft }],
    });
  } catch (err) {
    const detail = err instanceof Anthropic.APIError ? err.message : "The review service is unavailable.";
    return NextResponse.json({ error: detail }, { status: 502 });
  }

  const raw = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

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
