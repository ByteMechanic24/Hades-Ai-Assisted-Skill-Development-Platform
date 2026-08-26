CREATE TABLE IF NOT EXISTS milestones (
    id VARCHAR(64) PRIMARY KEY,
    learning_path_id VARCHAR(64) NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    required_node_ids TEXT NOT NULL DEFAULT '',
    required_score DOUBLE PRECISION NOT NULL DEFAULT 70.0
);

CREATE INDEX IF NOT EXISTS idx_milestones_path ON milestones(learning_path_id);

CREATE TABLE IF NOT EXISTS user_milestones (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_id VARCHAR(64) NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    status VARCHAR(64) NOT NULL DEFAULT 'locked',
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_user_milestone UNIQUE (user_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS idx_user_milestones_user ON user_milestones(user_id);
