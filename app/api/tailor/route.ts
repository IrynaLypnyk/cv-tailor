import { NextRequest, NextResponse } from "next/server";
import { extractTextFromDocx } from "@/lib/docx/extract-text";
import { generateTailoredCV } from "@/lib/llm/generate-tailored-cv";

export async function POST(req: NextRequest) {
  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request: could not parse form data." },
      { status: 400 }
    );
  }

  const cvFile = formData.get("cv");
  const jobDescription = formData.get("jobDescription");

  if (!cvFile || !(cvFile instanceof File)) {
    return NextResponse.json(
      { error: "Missing field: cv (must be a .docx file)." },
      { status: 400 }
    );
  }

  if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing field: jobDescription." },
      { status: 400 }
    );
  }

  if (!cvFile.name.endsWith(".docx")) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a .docx file." },
      { status: 415 }
    );
  }

  try {
    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const cvText = await extractTextFromDocx(buffer);
    const result = await generateTailoredCV(cvText, jobDescription.trim());

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
