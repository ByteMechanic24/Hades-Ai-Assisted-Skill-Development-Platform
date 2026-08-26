CREATE TABLE IF NOT EXISTS learning_paths (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id VARCHAR(64) DEFAULT '',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    estimated_hours INT NOT NULL DEFAULT 0,
    status VARCHAR(64) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user ON learning_paths(user_id);

CREATE TABLE IF NOT EXISTS learning_path_nodes (
    id VARCHAR(64) PRIMARY KEY,
    learning_path_id VARCHAR(64) NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    node_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    estimated_hours INT NOT NULL DEFAULT 0,
    sequence INT NOT NULL DEFAULT 1,
    status VARCHAR(64) NOT NULL DEFAULT 'locked',
    skill_ids TEXT NOT NULL DEFAULT '',
    prerequisite_ids TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_path_node UNIQUE (learning_path_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_path_nodes_path ON learning_path_nodes(learning_path_id);
