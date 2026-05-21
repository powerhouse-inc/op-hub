/**
 * Server-side PDF text-layer extraction.
 *
 * Used to ground LLM-extracted values against the actual text content of the
 * PDF so we can detect transcription errors (e.g., wallet address with an
 * inserted space, or a transposed character).
 *
 * Returns an empty string on any failure — callers should treat empty raw
 * text as "no grounding available" and fall back to format-only validation.
 */
import { PDFParse } from "pdf-parse";

export async function extractPdfText(base64Pdf: string): Promise<string> {
  let parser: PDFParse | undefined;
  try {
    const buffer = Buffer.from(base64Pdf, "base64");
    parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    return typeof result.text === "string" ? result.text : "";
  } catch (err) {
    console.warn(
      "extractPdfText failed; continuing without text grounding:",
      err,
    );
    return "";
  } finally {
    await parser?.destroy();
  }
}
