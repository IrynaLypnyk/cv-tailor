import OpenAI from "openai";
import type { TailorInput, TailoredCV } from "./types";

const SYSTEM_PROMPT = `You are an expert UK tech recruiter and CV writer.

Your task is to tailor the candidate's CV to match the provided job description.

Rules:
- Do NOT invent technologies, companies, achievements, certifications, or experience that are not in the original CV.
- Do NOT hallucinate. Only work with what the candidate has actually written.
- If something from the job description is missing from the CV, flag it in the "notes" field as a gap — do not add it to the CV.
- Improve wording, reorder bullet points to prioritise relevance, and align language with ATS keywords from the job description.
- Preserve the candidate's real background and voice.

Return a JSON object with exactly these fields:
{
  "professionalSummary": "A concise 3–5 sentence summary tailored to the role",
  "keySkills": ["skill1", "skill2", ...],
  "tailoredExperienceBullets": ["bullet1", "bullet2", ...],
  "atsKeywords": ["keyword1", "keyword2", ...],
  "notes": ["Any gaps or warnings — things in the job description not found in the CV"]
}`;

export async function callOpenAI(input: TailorInput): Promise<TailoredCV> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const client = new OpenAI({ apiKey });

  const userMessage = `Here is the candidate's CV:\n\n${input.cvText}\n\n---\n\nHere is the job description:\n\n${input.jobDescription}`;

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(raw) as TailoredCV;
  return parsed;
}
