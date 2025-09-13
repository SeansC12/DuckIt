ALTER TABLE sessions 
RENAME COLUMN final_feedback TO "annotated_transcript";

ALTER TABLE sessions
RENAME COLUMN transcript TO "ai_processed_transcript";

ALTER TABLE sessions
ADD column raw_transcript TEXT;

ALTER TABLE sessions 
ADD COLUMN summary TEXT;
