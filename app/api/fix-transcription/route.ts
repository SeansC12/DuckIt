import { cerebras } from "@ai-sdk/cerebras";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { rawTranscription, previousGeneration } = await request.json();

    if (!rawTranscription || typeof rawTranscription !== "string") {
      return NextResponse.json(
        { error: "Raw transcription is required and must be a string" },
        { status: 400 },
      );
    }

    const model = cerebras("llama-3.3-70b");

    // Build the prompt with context
    let prompt = `You are a transcription cleaner. Your job is to take messy auto-transcribed speech and convert it into clean, readable markdown.

INSTRUCTIONS:
- Fix spelling errors, grammar mistakes, and transcription artifacts
- Add proper punctuation and capitalization
- Format as clean markdown with lists using "-" or "*" (single level only)
- Remove filler words ("umm", "uh", "like", etc.)
- Remove false starts and self-corrections (e.g., "wait no I meant..." - only keep the final corrected version)
- Remove redundant transitions in lists ("firstly", "and" before last item, "etc")
- Make text flow naturally while preserving the original meaning
- NEVER add content that wasn't spoken
- NEVER add explanatory notes or corrections
- NEVER point out factual errors - just transcribe what was said
- Return ONLY the cleaned markdown text

CRITICAL: If the speaker says something factually incorrect, transcribe it as they said it. Your job is transcription cleaning, not fact-checking.
`;

    if (previousGeneration && previousGeneration.trim().length > 0) {
      prompt += `
PREVIOUS VERSION:
${previousGeneration.trim()}

FULL RAW TRANSCRIPTION:
${rawTranscription.trim()}

Provide the complete cleaned transcription, incorporating any new content and fixing previous errors:`;
    } else {
      prompt += `
RAW TRANSCRIPTION:
${rawTranscription.trim()}

Provide the cleaned transcription:`;
    }

    const result = await generateText({
      model,
      prompt,
      temperature: 0.1, // Low temperature for consistent formatting
      // maxTokens: 2000,
    });

    console.log("AI response:", result.text.trim());

    return NextResponse.json({
      fixedText: result.text.trim(),
    });
  } catch (error) {
    console.error("Error in fix-transcription API:", error);
    return NextResponse.json(
      { error: "Failed to process transcription" },
      { status: 500 },
    );
  }
}
