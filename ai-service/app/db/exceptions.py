import re


def sanitize_db_url(url: str) -> str:
    """Mask credentials in database URL to prevent credential leakage in logs/errors."""
    if not url:
        return ""
    # Pattern to match postgresql://user:password@host:port/db
    return re.sub(r"://([^:]+):([^@]+)@", r"://\1:***@", url)


class DatabaseError(Exception):
    """Base exception for all database operations."""
    pass


class DatabaseConfigurationError(DatabaseError):
    """Raised when database configuration is missing, malformed, or invalid."""
    pass


class DatabaseConnectionError(DatabaseError):
    """Raised when unable to establish a connection to PostgreSQL."""
    def __init__(self, message: str, original_error: Exception | None = None):
        sanitized_msg = sanitize_db_url(message)
        super().__init__(sanitized_msg)
        self.original_error = original_error


class DatabasePoolError(DatabaseError):
    """Raised when connection pool management fails."""
    pass


class LearnerNotFoundError(DatabaseError):
    """Raised when a learner with the specified external_id is not found in the database."""
    def __init__(self, external_id: str):
        super().__init__(f"Learner with external_id '{external_id}' not found in database.")
        self.external_id = external_id

