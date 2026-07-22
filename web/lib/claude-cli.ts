import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

interface ClaudeCliResult {
  is_error: boolean;
  result: string;
}

// ponytail: shells out to the local `claude` CLI instead of the Anthropic
// SDK so this runs against Russell's Claude Code subscription login, not a
// billed API key. No automated test here - it's a real paid/quota call, not
// something to hit on every test run. Verified manually via Bash + a Node
// execFile probe before wiring this in.
export async function runClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;

  const { stdout } = await execFileAsync(
    "claude",
    [
      "--print",
      "--system-prompt",
      systemPrompt,
      "--tools",
      "",
      "--output-format",
      "json",
      "--no-session-persistence",
      "--model",
      "claude-sonnet-5",
      userPrompt,
    ],
    { env, maxBuffer: 10 * 1024 * 1024, timeout: 120_000 }
  );

  const parsed = JSON.parse(stdout) as ClaudeCliResult;
  if (parsed.is_error) {
    throw new Error(parsed.result || "claude CLI returned an error");
  }
  return parsed.result;
}
