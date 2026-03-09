-- safe174th D1 Schema

CREATE TABLE IF NOT EXISTS signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    street TEXT NOT NULL,
    email TEXT NOT NULL,
    show_public INTEGER DEFAULT 1,
    verified INTEGER DEFAULT 0,
    verify_token TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    street TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    reviewed_at TEXT,
    ip_hash TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_signatures_created ON signatures(created_at);
