-- Add email verification columns to signatures table
ALTER TABLE signatures ADD COLUMN verified INTEGER DEFAULT 0;
ALTER TABLE signatures ADD COLUMN verify_token TEXT;

-- Mark any existing signatures as verified (grandfather them in)
UPDATE signatures SET verified = 1 WHERE verified IS NULL OR verified = 0;

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_signatures_verify_token ON signatures(verify_token);
