import { cerebras } from "@ai-sdk/cerebras";
import { generateText } from "ai";
import { ANNOTATION_PROMPT, ERROR_EXPLANATION } from "./prompts";

interface Critique {
  annotatedTranscript: string;
  summary: string;
}

export async function generateCritique(
  rawTranscript: string,
  aiProcessedTranscript: string,
): Promise<Critique> {
  const model = cerebras("llama-3.3-70b");

  // First API call: Generate annotated transcript
  const annotationResult = await generateText({
    model,
    prompt: ANNOTATION_PROMPT(aiProcessedTranscript),
    temperature: 0.2,
  });

  // Second API call: Generate comprehensive feedback
  const feedbackResult = await generateText({
    model,
    prompt: ERROR_EXPLANATION(annotationResult.text, aiProcessedTranscript),
    temperature: 0.3,
  });

  return {
    annotatedTranscript: annotationResult.text.trim(),
    summary: feedbackResult.text.trim(),
  };
}
