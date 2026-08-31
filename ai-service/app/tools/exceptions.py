class ToolError(Exception):
    """Base exception for all tool operations."""
    pass


class LearnerNotFoundError(ToolError):
    """Raised when a requested learner ID is not found in the data store."""
    def __init__(self, learner_id: str):
        super().__init__(f"Learner with ID '{learner_id}' not found.")
        self.learner_id = learner_id


class GoalNotFoundError(ToolError):
    """Raised when a requested goal is not recognized in the knowledge store."""
    def __init__(self, goal: str):
        super().__init__(f"Goal requirements for '{goal}' not found.")
        self.goal = goal


class SkillNotFoundError(ToolError):
    """Raised when a requested skill is not recognized in the prerequisite graph."""
    def __init__(self, skill_name: str):
        super().__init__(f"Skill '{skill_name}' not found in prerequisite knowledge base.")
        self.skill_name = skill_name
