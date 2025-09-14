-- Create the 4 new score columns

ALTER TABLE sessions
ADD COLUMN accuracy_score INTEGER,
ADD COLUMN familiarity_score INTEGER,
ADD COLUMN clarity_score INTEGER,
ADD COLUMN overall_score INTEGER;
