import OpenAI from "openai";
import type { CVSection } from "./types";
import {
  SYSTEM_PROMPT,
  buildUserMessage,
} from "./prompts/extract-cv-sections.prompt";

async function callOpenAI(
  cvText: string,
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
      { role: "user", content: buildUserMessage(cvText, jobDescription) },
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

  return (parsed as { sections: CVSection[] }).sections;
}

export async function extractCVSections(
  cvText: string,
  jobDescription: string
): Promise<CVSection[]> {
  const provider = process.env.LLM_PROVIDER ?? "openai";

  switch (provider) {
    case "openai":
      return callOpenAI(cvText, jobDescription);
    default:
      throw new Error(`Unsupported LLM_PROVIDER: "${provider}"`);
  }
}
