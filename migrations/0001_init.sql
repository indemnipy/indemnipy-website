-- Migration number: 0001 	 2026-04-20T23:16:16.783Z
CREATE TABLE IF NOT EXISTS subscribers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  created_at TEXT    NOT NULL,
  user_agent TEXT,
  country    TEXT
);

CREATE INDEX IF NOT EXISTS idx_subscribers_created_at
  ON subscribers(created_at);
