CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    difficulty VARCHAR(64) NOT NULL DEFAULT 'beginner',
    category VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_prerequisites (
    id VARCHAR(64) PRIMARY KEY,
    skill_id VARCHAR(64) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    prerequisite_skill_id VARCHAR(64) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT uk_skill_prereq UNIQUE (skill_id, prerequisite_skill_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skill_prereq_skill ON skill_prerequisites(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_prereq_target ON skill_prerequisites(prerequisite_skill_id);
