-- ============================================================
-- HADES AI Personalized Learning Platform
-- Development Seed Data
--
-- Requires:
--   database/migrations/V001__initial_schema.sql
--
-- This is development/reference data only.
-- It does NOT define or modify the schema.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. SKILLS
-- ============================================================

INSERT INTO skills (name, category)
VALUES
    ('Basic Programming Concepts', 'Foundations'),
    ('Object-Oriented Programming', 'Foundations'),
    ('Git & CI/CD', 'DevOps & Tooling'),
    ('SQL & Relational Databases', 'Database'),
    ('Python', 'Programming Languages'),
    ('JavaScript', 'Web Languages'),
    ('HTML & CSS', 'Web Foundations'),
    ('Scala 3', 'Programming Languages'),
    ('Functional Programming in Scala', 'Programming Paradigms'),
    ('Akka / Pekko Concurrency', 'Concurrency & Distributed Systems'),
    ('Distributed Systems & Event Sourcing', 'Architecture & Distributed Systems'),
    ('Kafka & Event Streaming', 'Data Streaming'),
    ('PySpark', 'Data Processing'),
    ('TypeScript', 'Web Languages'),
    ('React', 'Frontend Frameworks'),
    ('Next.js', 'Fullstack Frameworks')
ON CONFLICT (name) DO UPDATE
SET category = EXCLUDED.category;


-- ============================================================
-- 2. SKILL PREREQUISITES
-- ============================================================

INSERT INTO skill_prerequisites (
    skill_id,
    prerequisite_skill_id
)
SELECT
    child.id,
    parent.id
FROM (
    VALUES
        ('Scala 3', 'Basic Programming Concepts'),
        ('Scala 3', 'Object-Oriented Programming'),
        ('Functional Programming in Scala', 'Scala 3'),
        ('Akka / Pekko Concurrency', 'Functional Programming in Scala'),
        ('Distributed Systems & Event Sourcing', 'Akka / Pekko Concurrency'),
        ('Distributed Systems & Event Sourcing', 'SQL & Relational Databases'),
        ('Kafka & Event Streaming', 'Distributed Systems & Event Sourcing'),
        ('PySpark', 'Python'),
        ('PySpark', 'SQL & Relational Databases'),
        ('TypeScript', 'JavaScript'),
        ('React', 'JavaScript'),
        ('React', 'HTML & CSS'),
        ('Next.js', 'React'),
        ('Next.js', 'TypeScript')
) AS v(child_name, parent_name)
JOIN skills child
    ON child.name = v.child_name
JOIN skills parent
    ON parent.name = v.parent_name
ON CONFLICT (skill_id, prerequisite_skill_id) DO NOTHING;


-- ============================================================
-- 3. DEVELOPMENT LEARNER
-- ============================================================

INSERT INTO learners (
    external_id,
    experience_level,
    available_hours_per_week
)
VALUES (
    'learner-1049',
    'intermediate',
    10.0
)
ON CONFLICT (external_id) DO UPDATE
SET
    experience_level = EXCLUDED.experience_level,
    available_hours_per_week = EXCLUDED.available_hours_per_week;


-- ============================================================
-- 4. CURRENT LEARNER SKILLS
-- ============================================================

INSERT INTO learner_skills (
    learner_id,
    skill_id,
    level,
    years_of_experience
)
SELECT
    l.id,
    s.id,
    v.level,
    v.years_of_experience
FROM learners l
JOIN (
    VALUES
        ('Python', 'intermediate', 2.5::numeric),
        ('SQL & Relational Databases', 'intermediate', 2.0::numeric),
        ('Git & CI/CD', 'beginner', 1.0::numeric)
) AS v(name, level, years_of_experience)
    ON TRUE
JOIN skills s
    ON s.name = v.name
WHERE l.external_id = 'learner-1049'
ON CONFLICT (learner_id, skill_id) DO UPDATE
SET
    level = EXCLUDED.level,
    years_of_experience = EXCLUDED.years_of_experience;


-- ============================================================
-- 5. CAREER ASPIRATIONS
-- ============================================================

INSERT INTO learner_career_aspirations (
    learner_id,
    aspiration
)
SELECT
    l.id,
    v.aspiration
FROM learners l
CROSS JOIN (
    VALUES
        ('Senior Distributed Systems Engineer'),
        ('Scala Backend Architect')
) AS v(aspiration)
WHERE l.external_id = 'learner-1049'
ON CONFLICT (learner_id, aspiration) DO NOTHING;


-- ============================================================
-- 6. INTERESTS
-- ============================================================

INSERT INTO learner_interests (
    learner_id,
    interest
)
SELECT
    l.id,
    v.interest
FROM learners l
CROSS JOIN (
    VALUES
        ('Functional Programming'),
        ('Event-Driven Architecture'),
        ('Akka/Pekko')
) AS v(interest)
WHERE l.external_id = 'learner-1049'
ON CONFLICT (learner_id, interest) DO NOTHING;


-- ============================================================
-- 7. LEARNING PREFERENCES
-- ============================================================

INSERT INTO learner_learning_preferences (
    learner_id,
    preference
)
SELECT
    l.id,
    v.preference
FROM learners l
CROSS JOIN (
    VALUES
        ('hands-on'),
        ('project-based'),
        ('code-walkthroughs')
) AS v(preference)
WHERE l.external_id = 'learner-1049'
ON CONFLICT (learner_id, preference) DO NOTHING;


-- ============================================================
-- 8. LEARNER-CREATED GOAL
-- ============================================================

INSERT INTO learner_goals (
    learner_id,
    raw_goal,
    normalized_goal,
    target_role,
    status
)
SELECT
    l.id,
    'Become a Backend Scala & Distributed Systems Engineer',
    'Backend Scala & Distributed Systems',
    'Scala Backend Architect',
    'active'
FROM learners l
WHERE l.external_id = 'learner-1049'
  AND NOT EXISTS (
      SELECT 1
      FROM learner_goals g
      WHERE g.learner_id = l.id
        AND g.raw_goal =
            'Become a Backend Scala & Distributed Systems Engineer'
        AND g.status = 'active'
  );


-- ============================================================
-- 9. REQUIRED SKILLS FOR THE DEVELOPMENT GOAL
-- ============================================================

INSERT INTO goal_required_skills (
    learner_goal_id,
    skill_id,
    required_level
)
SELECT
    g.id,
    s.id,
    v.required_level
FROM learner_goals g
JOIN learners l
    ON l.id = g.learner_id
JOIN (
    VALUES
        ('Basic Programming Concepts', 'intermediate'),
        ('Object-Oriented Programming', 'intermediate'),
        ('Scala 3', 'advanced'),
        ('Functional Programming in Scala', 'advanced'),
        ('Akka / Pekko Concurrency', 'advanced'),
        ('SQL & Relational Databases', 'intermediate'),
        ('Distributed Systems & Event Sourcing', 'advanced'),
        ('Kafka & Event Streaming', 'intermediate')
) AS v(skill_name, required_level)
    ON TRUE
JOIN skills s
    ON s.name = v.skill_name
WHERE l.external_id = 'learner-1049'
  AND g.raw_goal =
      'Become a Backend Scala & Distributed Systems Engineer'
  AND g.status = 'active'
ON CONFLICT (learner_goal_id, skill_id) DO UPDATE
SET required_level = EXCLUDED.required_level;


COMMIT;