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
    let prompt = `You are a transcription fixer. Your job is to take potentially messy, auto-transcribed text and convert it into clean, well-formatted markdown.

IMPORTANT INSTRUCTIONS:
- Fix spelling errors, grammar mistakes, and transcription artifacts. If unsure, leave a word as-is.
- Add proper punctuation and capitalization
- Format the text as markdown with appropriate lists, emphasis, etc.
- Lists may only begin with a dash ("-") or asterisk ("*"). Currently only a single \
layer of lists is supported, so ensure lists only contain related information.
- If you see obvious mistakes in your previous generation (provided below), fix them
- Make the text flow naturally and coherently, for example by removing filler words ("umm"), transitions \
that are made redundant by list formatting ("firstly", or "and"/"or" before the last element)
- Remove user mistakes, for example "wait no I meant"
- Do NOT add content that wasn't in the original transcription. This is VERY IMPORTANT - do NOT ADD CONTENT. \
Do NOT add headers.
Do NOT correct the original transcription. Do NOT comment or write notes on what was incorrect, simply point it out.
- Return ONLY the fixed markdown - NO explanations, meta-commentary.

If you do not have enough context to determine if a word should be removed, moved, or fixed (eg. incomplete sentence), please leave it as-is.
`;

    if (previousGeneration && previousGeneration.trim().length > 0) {
      prompt += `PREVIOUS AI GENERATION (may contain errors - please review and correct):
${previousGeneration.trim()}

RAW TRANSCRIPTION TO PROCESS (complete text so far):
${rawTranscription.trim()}

Please provide the complete fixed transcription as markdown. Compare your previous generation with the raw transcription and fix any errors in either. The raw transcription may have spelling/grammar errors, and your previous generation may have mistakes due to limited context:`;
    } else {
      prompt += `RAW TRANSCRIPTION TO FIX:
${rawTranscription.trim()}

Please provide the fixed transcription as markdown. Reminder that PRESERVING THE ORIGINAL TRANSCRIPT'S MEANING IS VERY IMPORTANT, and you should NOT ADD ANY CONTENT that was not in the original transcript:`;
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
