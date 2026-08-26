CREATE TABLE IF NOT EXISTS progress_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(128) NOT NULL,
    entity_id VARCHAR(64) NOT NULL DEFAULT '',
    payload TEXT NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_progress_events_user ON progress_events(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_type ON progress_events(event_type);
