import pytest
from app.schemas.models import SkillItem, SkillGapResult
from app.tools.analysis_tools import calculate_skill_gaps, resolve_prerequisite_chain
from app.tools.exceptions import SkillNotFoundError


class TestCalculateSkillGaps:
    """Unit tests for calculate_skill_gaps."""

    def test_skills_covered_and_missing(self):
        current = [
            SkillItem(skill_name="Python", level="intermediate", years_of_experience=2.0),
            SkillItem(skill_name="SQL & Relational Databases", level="advanced", years_of_experience=3.0),
        ]
        required = ["Python", "SQL & Relational Databases", "Scala 3", "Kafka & Event Streaming"]
        
        result: SkillGapResult = calculate_skill_gaps(current, required, target_level="intermediate")
        
        assert "Python" in result.covered_skills
        assert "SQL & Relational Databases" in result.covered_skills
        assert "Scala 3" in result.missing_skills
        assert "Kafka & Event Streaming" in result.missing_skills
        assert result.insufficient_skills == []

    def test_insufficient_skill_level(self):
        current = [
            SkillItem(skill_name="Python", level="beginner", years_of_experience=0.5),
            SkillItem(skill_name="SQL & Relational Databases", level="intermediate", years_of_experience=1.5),
        ]
        required = ["Python", "SQL & Relational Databases"]
        
        result: SkillGapResult = calculate_skill_gaps(current, required, target_level="intermediate")
        
        assert "Python" in result.insufficient_skills
        assert "SQL & Relational Databases" in result.covered_skills
        assert result.missing_skills == []

    def test_all_skills_missing_when_current_empty(self):
        current = []
        required = ["Python", "PySpark", "Git & CI/CD"]
        
        result: SkillGapResult = calculate_skill_gaps(current, required)
        
        assert len(result.missing_skills) == 3
        assert result.covered_skills == []
        assert result.insufficient_skills == []

    def test_empty_required_skills_returns_empty_result(self):
        current = [SkillItem(skill_name="Python", level="intermediate")]
        result: SkillGapResult = calculate_skill_gaps(current, [])
        assert result.covered_skills == []
        assert result.missing_skills == []
        assert result.insufficient_skills == []


class TestResolvePrerequisiteChain:
    """Unit tests for resolve_prerequisite_chain."""

    def test_foundational_skill_no_prerequisites(self):
        chain = resolve_prerequisite_chain("Basic Programming Concepts")
        assert chain == ["Basic Programming Concepts"]

    def test_skill_with_direct_prerequisites(self):
        chain = resolve_prerequisite_chain("Scala 3")
        # Scala 3 depends on Basic Programming Concepts and Object-Oriented Programming
        assert "Basic Programming Concepts" in chain
        assert "Object-Oriented Programming" in chain
        assert "Scala 3" in chain
        # Pre-requisites must appear before the dependent skill
        assert chain.index("Basic Programming Concepts") < chain.index("Scala 3")
        assert chain.index("Object-Oriented Programming") < chain.index("Scala 3")

    def test_multi_level_prerequisite_chain(self):
        chain = resolve_prerequisite_chain("Functional Programming in Scala")
        # Functional Programming in Scala -> Scala 3 -> (Basic Programming Concepts, OOP)
        assert "Basic Programming Concepts" in chain
        assert "Scala 3" in chain
        assert "Functional Programming in Scala" in chain
        assert chain.index("Scala 3") < chain.index("Functional Programming in Scala")

    def test_known_skills_are_filtered_from_chain(self):
        # If learner already knows Basic Programming Concepts & OOP:
        known = ["Basic Programming Concepts", "Object-Oriented Programming"]
        chain = resolve_prerequisite_chain("Scala 3", known_skills=known)
        assert "Basic Programming Concepts" not in chain
        assert "Object-Oriented Programming" not in chain
        assert "Scala 3" in chain

    def test_shared_prerequisites_are_deduplicated(self):
        chain = resolve_prerequisite_chain(["Scala 3", "Functional Programming in Scala"])
        # Should not have duplicate "Scala 3" or foundational skills
        assert chain.count("Scala 3") == 1
        assert chain.count("Basic Programming Concepts") == 1

    def test_unknown_skill_handled_gracefully(self):
        # An unknown skill should just be appended as its own leaf without crashing
        chain = resolve_prerequisite_chain("SomeNovelSkill")
        assert "SomeNovelSkill" in chain
