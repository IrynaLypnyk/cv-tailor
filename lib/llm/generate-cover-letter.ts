import OpenAI from "openai";
import {
  COVER_LETTER_SYSTEM_PROMPT,
  buildCoverLetterUserMessage,
  type CoverLetterInput,
} from "./prompts/generate-cover-letter.prompt";

async function callOpenAI(input: CoverLetterInput): Promise<string> {
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
      { role: "system", content: COVER_LETTER_SYSTEM_PROMPT },
      { role: "user", content: buildCoverLetterUserMessage(input) },
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
    typeof (parsed as Record<string, unknown>).coverLetter !== "string"
  ) {
    throw new Error(
      "Unexpected response shape from OpenAI: missing coverLetter string"
    );
  }

  return (parsed as { coverLetter: string }).coverLetter;
}

export async function generateCoverLetter(
  input: CoverLetterInput
): Promise<string> {
  const provider = process.env.LLM_PROVIDER ?? "openai";

  switch (provider) {
    case "openai":
      return callOpenAI(input);
    default:
      throw new Error(`Unsupported LLM_PROVIDER: "${provider}"`);
  }
}
