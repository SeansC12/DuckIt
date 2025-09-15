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
- For each of the highlighted errors in the annotated transcript, write out the mistake and explain why it is incorrect
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

export const SCORE_PROMPT = (
  annotatedTranscript: string,
  summary: string,
) => `You are an expert evaluator assessing the quality of a user's transcript. Your main goal would be to judge how well the student recited their material.

You have been given:
1. An annotated transcript with errors highlighted in red
2. A summary of the transcript

Your task is to provide a quality score for the user's transcript based on each of following criteria:
- Accuracy: How factually correct and precise was the student's explanation based on the original material? (0-100 points)
- Familiarity: Does the student show confidence and fluency, or do they hesitate and struggle to recall information? (0-100 points)
- Clarity: How clearly and logically did the student explain their ideas? Was the explanation easy to follow? (0-100 points)

After you have generated each of the scores for each criteria, generate a final overall score out of 100 points, it may not be an average of the three scores, but should reflect your overall impression of the quality of the transcript.

Finally, STRICTLY return your scores in the following CSV format, with no additional commentary or explanation:
accuracy_score,familiarity_score,clarity_score,overall_score

For example:
85,90,80,88

There should be no additional text, just the four scores in CSV format. No decimals, no percentage signs, no commentary.

ANNOTATED TRANSCRIPT (with errors in red):
${annotatedTranscript}

SUMMARY OF THE TRANSCRIPT:
${summary}

Please provide your scores now:`;

export const TITLE_PROMPT = (
  aiProcessedTranscript: string,
) => `You are an expert at creating concise, descriptive titles for transcripts.

Your task is to generate a short title (5 words or less) that accurately captures the main topic or theme of the transcript.

INSTRUCTIONS:
- Review the raw and processed transcripts carefully
- Identify the key subject or focus of the content
- Create a title that is clear, engaging, and relevant to the transcript
- Keep it very short - 5 words or less
- Do NOT add any additional commentary or explanation - just return the title

PROCESSED TRANSCRIPT:
${aiProcessedTranscript}

Generate a concise title (5 words or less) that captures the main topic:`;
