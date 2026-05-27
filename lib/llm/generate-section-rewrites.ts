import OpenAI from "openai";
import type { SectionRewrite } from "./types";
import {
  SYSTEM_PROMPT,
  buildUserMessage,
  type RewriteInput,
} from "./prompts/generate-section-rewrites.prompt";

async function callOpenAI(input: RewriteInput): Promise<SectionRewrite[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(input) },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed: unknown = JSON.parse(raw);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>).rewrites)
  ) {
    throw new Error(
      "Unexpected response shape from OpenAI: missing rewrites array"
    );
  }

  const data = parsed as Record<string, unknown>;

  return (data.rewrites as Array<Record<string, unknown>>).map(
    (r): SectionRewrite => ({
      sectionId: String(r.sectionId ?? ""),
      title: String(r.title ?? ""),
      originalText: String(r.originalText ?? ""),
      rewrittenText: String(r.rewrittenText ?? ""),
      notes: r.notes ? String(r.notes) : undefined,
    })
  );
}

export async function generateSectionRewrites(
  input: RewriteInput
): Promise<SectionRewrite[]> {
  const provider = process.env.LLM_PROVIDER ?? "openai";

  switch (provider) {
    case "openai":
      return callOpenAI(input);
    default:
      throw new Error(`Unsupported LLM_PROVIDER: "${provider}"`);
  }
}
