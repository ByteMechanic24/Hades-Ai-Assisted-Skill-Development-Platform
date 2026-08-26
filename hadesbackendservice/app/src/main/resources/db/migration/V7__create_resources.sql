CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    provider VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    content_type VARCHAR(64) NOT NULL DEFAULT 'article',
    difficulty VARCHAR(64) NOT NULL DEFAULT 'beginner',
    duration_minutes INT NOT NULL DEFAULT 30,
    quality_score DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_skills (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    skill_id VARCHAR(64) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT uk_resource_skill UNIQUE (resource_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_skills_resource ON resource_skills(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_skills_skill ON resource_skills(skill_id);
