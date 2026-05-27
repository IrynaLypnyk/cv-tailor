// TODO: Add Nebius (or other providers) here as an alternative to OpenAI.
// To add a new provider:
// 1. Create lib/llm/<provider>.ts implementing the same TailorInput → TailoredCV signature.
// 2. Add a case for it below using the LLM_PROVIDER env variable.

import { callOpenAI } from "./openai";
import type { TailoredCV, TailorInput } from "./types";

export async function generateTailoredCV(
  cvText: string,
  jobDescription: string
): Promise<TailoredCV> {
  const input: TailorInput = { cvText, jobDescription };
  const provider = process.env.LLM_PROVIDER ?? "openai";

  switch (provider) {
    case "openai":
      return callOpenAI(input);
    default:
      throw new Error(`Unsupported LLM_PROVIDER: "${provider}"`);
  }
}
