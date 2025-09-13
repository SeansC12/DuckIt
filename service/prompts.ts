export const ANNOTATION_PROMPT = (
  aiProcessedTranscript: string,
) => `You are an expert reviewer analyzing a transcript for factual accuracy and logical consistency.

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

export const ERROR_EXPLANATION = (
  annotatedTranscript: string,
  aiProcessedTranscript: string,
) => `You are an expert educator providing constructive feedback on a transcript.

You have been given:
1. An annotated transcript with errors highlighted in red
2. The original processed transcript for reference

Your task is to provide comprehensive feedback that includes:
- For each of the highlighted errors in the annotated transcript, explain why it is incorrect
- Be brief and direct, focusing on explaining really quickly what is incorrect and why
- Provide the correct answer
- Order the explanations in the order the errors appear in the transcript. Please number each explanation to match the order of appearance.
- At the end, provide general feedback on common themes or issues you noticed

For example, if the annotated transcript has "The capital of France is ==red==London==/red==", you might say:
1. "The capital of France is London" is incorrect because London is the capital of the UK. The correct answer is Paris.

ANNOTATED TRANSCRIPT (with errors in red):
${annotatedTranscript}

ORIGINAL PROCESSED TRANSCRIPT:
${aiProcessedTranscript}

Please provide your numbered explanations for each highlighted error, followed by general feedback.`;
