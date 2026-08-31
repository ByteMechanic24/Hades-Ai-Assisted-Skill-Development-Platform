from typing import Dict, Any

MOCK_LEARNERS_DB: Dict[str, Dict[str, Any]] = {
    "learner-1049": {
        "learner_id": "learner-1049",
        "target_goal": "Become a Backend Scala & Distributed Systems Engineer",
        "career_aspirations": [
            "Senior Distributed Systems Engineer",
            "Scala Backend Architect",
        ],
        "current_skills": [
            {
                "skill_name": "Python",
                "level": "intermediate",
                "years_of_experience": 2.5,
            },
            {
                "skill_name": "SQL & Relational Databases",
                "level": "intermediate",
                "years_of_experience": 2.0,
            },
            {
                "skill_name": "Git & CI/CD",
                "level": "beginner",
                "years_of_experience": 1.0,
            },
        ],
        "interests": [
            "Functional Programming",
            "Event-Driven Architecture",
            "Akka/Pekko",
        ],
        "available_hours_per_week": 10.0,
        "learning_preferences": [
            "hands-on",
            "project-based",
            "code-walkthroughs",
        ],
        "experience_level": "intermediate",
    },
    "learner-123": {
        "learner_id": "learner-123",
        "target_goal": "Become a Data Engineer",
        "career_aspirations": [
            "Mid-Level Data Engineer",
            "Analytics Engineer",
        ],
        "current_skills": [
            {
                "skill_name": "Python",
                "level": "beginner",
                "years_of_experience": 0.5,
            },
            {
                "skill_name": "SQL & Relational Databases",
                "level": "beginner",
                "years_of_experience": 0.5,
            },
        ],
        "interests": [
            "Data Pipelines",
            "ETL",
            "Apache Spark",
        ],
        "available_hours_per_week": 8.0,
        "learning_preferences": [
            "hands-on",
            "interactive-exercises",
        ],
        "experience_level": "beginner",
    },
}

MOCK_GOAL_REQUIREMENTS_DB: Dict[str, Dict[str, Any]] = {
    "become a backend scala & distributed systems engineer": {
        "goal": "Become a Backend Scala & Distributed Systems Engineer",
        "required_skills": [
            "Basic Programming Concepts",
            "Object-Oriented Programming",
            "Scala 3",
            "Functional Programming in Scala",
            "Akka / Pekko Concurrency",
            "SQL & Relational Databases",
            "Distributed Systems & Event Sourcing",
            "Kafka & Event Streaming",
        ],
        "recommended_experience_level": "intermediate",
        "domain": "Backend & Distributed Systems",
    },
    "become a data engineer": {
        "goal": "Become a Data Engineer",
        "required_skills": [
            "Python",
            "SQL & Relational Databases",
            "Git & CI/CD",
            "Data Warehousing",
            "PySpark",
            "Apache Airflow",
        ],
        "recommended_experience_level": "beginner",
        "domain": "Data Engineering",
    },
    "become a full stack web developer": {
        "goal": "Become a Full Stack Web Developer",
        "required_skills": [
            "HTML & CSS",
            "JavaScript",
            "TypeScript",
            "React",
            "Next.js",
            "SQL & Relational Databases",
            "RESTful API Design",
        ],
        "recommended_experience_level": "beginner",
        "domain": "Web Development",
    },
}

MOCK_SKILL_PREREQUISITES_DB: Dict[str, Dict[str, Any]] = {
    # Foundational skills (No prerequisites)
    "basic programming concepts": {
        "skill_name": "Basic Programming Concepts",
        "prerequisites": [],
        "category": "Foundations",
    },
    "object-oriented programming": {
        "skill_name": "Object-Oriented Programming",
        "prerequisites": [],
        "category": "Foundations",
    },
    "git & ci/cd": {
        "skill_name": "Git & CI/CD",
        "prerequisites": [],
        "category": "DevOps & Tooling",
    },
    "sql & relational databases": {
        "skill_name": "SQL & Relational Databases",
        "prerequisites": [],
        "category": "Database",
    },
    "python": {
        "skill_name": "Python",
        "prerequisites": [],
        "category": "Programming Languages",
    },
    "javascript": {
        "skill_name": "JavaScript",
        "prerequisites": [],
        "category": "Web Languages",
    },
    "html & css": {
        "skill_name": "HTML & CSS",
        "prerequisites": [],
        "category": "Web Foundations",
    },
    # Intermediate / Advanced skills (With prerequisites)
    "scala 3": {
        "skill_name": "Scala 3",
        "prerequisites": [
            "Basic Programming Concepts",
            "Object-Oriented Programming",
        ],
        "category": "Programming Languages",
    },
    "functional programming in scala": {
        "skill_name": "Functional Programming in Scala",
        "prerequisites": [
            "Scala 3",
        ],
        "category": "Programming Paradigms",
    },
    "akka / pekko concurrency": {
        "skill_name": "Akka / Pekko Concurrency",
        "prerequisites": [
            "Functional Programming in Scala",
        ],
        "category": "Concurrency & Distributed Systems",
    },
    "distributed systems & event sourcing": {
        "skill_name": "Distributed Systems & Event Sourcing",
        "prerequisites": [
            "Akka / Pekko Concurrency",
            "SQL & Relational Databases",
        ],
        "category": "Architecture & Distributed Systems",
    },
    "kafka & event streaming": {
        "skill_name": "Kafka & Event Streaming",
        "prerequisites": [
            "Distributed Systems & Event Sourcing",
        ],
        "category": "Data Streaming",
    },
    "pyspark": {
        "skill_name": "PySpark",
        "prerequisites": [
            "Python",
            "SQL & Relational Databases",
        ],
        "category": "Data Processing",
    },
    "typescript": {
        "skill_name": "TypeScript",
        "prerequisites": [
            "JavaScript",
        ],
        "category": "Web Languages",
    },
    "react": {
        "skill_name": "React",
        "prerequisites": [
            "JavaScript",
            "HTML & CSS",
        ],
        "category": "Frontend Frameworks",
    },
    "next.js": {
        "skill_name": "Next.js",
        "prerequisites": [
            "React",
            "TypeScript",
        ],
        "category": "Fullstack Frameworks",
    },
}
