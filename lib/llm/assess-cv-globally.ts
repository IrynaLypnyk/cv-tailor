import OpenAI from "openai";
import type { CVSection, GlobalAssessment } from "./types";
import {
  SYSTEM_PROMPT,
  buildUserMessage,
} from "./prompts/assess-cv-globally.prompt";
import { simulateDelay, MOCK_GLOBAL_ASSESSMENT } from "./mock/fixtures";

async function callOpenAI(
  sections: CVSection[],
  jobDescription: string
): Promise<GlobalAssessment> {
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

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Unexpected response shape from OpenAI: not an object");
  }

  const data = parsed as Record<string, unknown>;

  if (
    !Array.isArray(data.strongMatches) ||
    !Array.isArray(data.underEmphasized) ||
    !Array.isArray(data.needsConfirmation) ||
    !Array.isArray(data.nonActionableGaps) ||
    !Array.isArray(data.recommendedSectionIds)
  ) {
    throw new Error("Unexpected response shape from OpenAI: missing assessment fields");
  }

  return {
    strongMatches: data.strongMatches as string[],
    underEmphasized: data.underEmphasized as string[],
    needsConfirmation: (data.needsConfirmation as Array<Record<string, unknown>>).map(
      (item) => ({
        id: String(item.id ?? ""),
        skill: String(item.skill ?? ""),
        context: String(item.context ?? ""),
        status: null,
      })
    ),
    nonActionableGaps: data.nonActionableGaps as string[],
    recommendedSectionIds: data.recommendedSectionIds as string[],
  };
}

export async function assessCVGlobally(
  sections: CVSection[],
  jobDescription: string
): Promise<GlobalAssessment> {
  const provider = process.env.LLM_PROVIDER ?? "openai";

  switch (provider) {
    case "openai":
      return callOpenAI(sections, jobDescription);
    case "mock":
      await simulateDelay();
      return MOCK_GLOBAL_ASSESSMENT;
    default:
      throw new Error(`Unsupported LLM_PROVIDER: "${provider}"`);
  }
}
