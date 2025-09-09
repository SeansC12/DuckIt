export const ANNOTATION_PROMPT = (aiProcessedTranscript: string) => `You are an expert reviewer analyzing a transcript for factual accuracy and logical consistency.

Your task is to create an annotated version of the processed transcript, highlighting any errors, inaccuracies, or problematic statements in red markdown format.

INSTRUCTIONS:
- Review the processed transcript carefully
- Highlight incorrect information, logical fallacies, factual errors, or unsupported claims using the format: \`==red==[incorrect content here]==/red==\`
- You may highlight a word, phrase, or sentence, but not more than one sentence per highlight
- Only highlight content that is genuinely incorrect or problematic
- Do NOT add any commentary or explanations - just return the annotated transcript
- Preserve all original formatting and structure

PROCESSED TRANSCRIPT TO ANNOTATE:
${aiProcessedTranscript}

Return the annotated transcript with red highlights for incorrect content:`;

export const FEEDBACK_PROMPT = (annotatedTranscript: string, aiProcessedTranscript: string) => `You are an expert educator providing constructive feedback on a transcript.

You have been given:
1. An annotated transcript with errors highlighted in red
2. The original processed transcript for reference

Your task is to provide comprehensive feedback that includes:
- A clear summary of what the person got wrong
- Specific explanations of why each highlighted item is incorrect
- Points for improvement with actionable advice
- Suggestions for how to avoid similar mistakes in the future

ANNOTATED TRANSCRIPT (with errors in red):
${annotatedTranscript}

ORIGINAL PROCESSED TRANSCRIPT:
${aiProcessedTranscript}

Please provide detailed, constructive feedback that helps the person understand their mistakes and improve. Structure your response with clear sections and be specific about what was wrong and how to fix it:`;
