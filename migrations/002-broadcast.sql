-- Migration 002: Email broadcast + unsubscribe support

-- Unsubscribe columns on signatures
ALTER TABLE signatures ADD COLUMN unsubscribed INTEGER DEFAULT 0;
ALTER TABLE signatures ADD COLUMN unsubscribe_token TEXT;
ALTER TABLE signatures ADD COLUMN unsubscribed_at TEXT;

-- Backfill unsubscribe tokens for existing rows
-- (SQLite randomblob gives us cryptographically random bytes)
UPDATE signatures
  SET unsubscribe_token = lower(hex(randomblob(16)))
  WHERE unsubscribe_token IS NULL;

-- Index for fast token lookup on unsubscribe
CREATE INDEX IF NOT EXISTS idx_signatures_unsubscribe_token
  ON signatures(unsubscribe_token);

-- Broadcast audit log
CREATE TABLE IF NOT EXISTS broadcasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  recipient_count INTEGER DEFAULT 0,
  sent_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_sent_at ON broadcasts(sent_at);
