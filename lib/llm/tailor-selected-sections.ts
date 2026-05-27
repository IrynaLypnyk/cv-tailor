import OpenAI from "openai";
import type { CVSection } from "./types";
import {
  SYSTEM_PROMPT,
  buildUserMessage,
} from "./prompts/tailor-selected-sections.prompt";

interface TailoredSectionResult {
  id: string;
  tailoredText: string;
}

async function callOpenAI(
  sections: CVSection[],
  jobDescription: string
): Promise<CVSection[]> {
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
      { role: "user", content: buildUserMessage(sections, jobDescription) },
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
    !Array.isArray((parsed as Record<string, unknown>).sections)
  ) {
    throw new Error("Unexpected response shape from OpenAI: missing sections array");
  }

  const results = (parsed as { sections: TailoredSectionResult[] }).sections;

  const tailoredById = new Map(results.map((r) => [r.id, r.tailoredText]));

  return sections.map((section) => ({
    ...section,
    tailoredText: tailoredById.get(section.id) ?? section.originalText,
  }));
}

export async function tailorSelectedSections(
  sections: CVSection[],
  jobDescription: string
): Promise<CVSection[]> {
  const provider = process.env.LLM_PROVIDER ?? "openai";

  switch (provider) {
    case "openai":
      return callOpenAI(sections, jobDescription);
    default:
      throw new Error(`Unsupported LLM_PROVIDER: "${provider}"`);
  }
}
