import mammoth from "mammoth";

/**
 * Extracts plain text from a .docx file buffer.
 * Processing is entirely in memory — no file is written to disk.
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });

  if (!result.value || result.value.trim().length === 0) {
    throw new Error("Could not extract text from the uploaded file. The document may be empty or in an unsupported format.");
  }

  return result.value.trim();
}
