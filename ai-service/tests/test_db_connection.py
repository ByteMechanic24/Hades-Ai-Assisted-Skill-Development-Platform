import os
import pytest
from unittest.mock import patch

from app.core.config import Settings
from app.db.exceptions import (
    DatabaseError,
    DatabaseConfigurationError,
    DatabaseConnectionError,
    DatabasePoolError,
    sanitize_db_url,
)
from app.db.connection import (
    DatabaseManager,
    db_manager,
    get_db,
    check_db_connectivity,
)


class TestDatabaseManagerUnit:
    """Unit tests for configuration, error handling, and URL sanitization without DB dependency."""

    def test_sanitize_db_url(self):
        raw_url = "postgresql://myuser:secret_pass123@localhost:5432/mydb"
        sanitized = sanitize_db_url(raw_url)
        assert "secret_pass123" not in sanitized
        assert "myuser" in sanitized
        assert sanitized == "postgresql://myuser:***@localhost:5432/mydb"

    def test_sanitize_empty_url(self):
        assert sanitize_db_url("") == ""

    def test_missing_database_url_raises_configuration_error(self):
        manager = DatabaseManager(database_url=None)
        with patch("app.db.connection.settings.DATABASE_URL", None):
            with pytest.raises(DatabaseConfigurationError) as exc_info:
                _ = manager.database_url
            assert "DATABASE_URL environment variable is not configured" in str(exc_info.value)

    def test_custom_pool_settings(self):
        manager = DatabaseManager(
            database_url="postgresql://user:pass@localhost:5432/db",
            min_size=2,
            max_size=8,
            timeout=15.0,
        )
        assert manager.min_size == 2
        assert manager.max_size == 8
        assert manager.timeout == 15.0

    def test_invalid_connection_target_raises_sanitized_connection_error(self):
        # Point to an invalid unreachable port
        invalid_manager = DatabaseManager(
            database_url="postgresql://baduser:secretpassword@127.0.0.1:59999/nonexistent_db",
            min_size=1,
            max_size=1,
            timeout=1.0,
        )
        with pytest.raises((DatabaseConnectionError, DatabasePoolError)) as exc_info:
            invalid_manager.check_connectivity()
        error_str = str(exc_info.value)
        assert "secretpassword" not in error_str
        invalid_manager.close()


@pytest.mark.integration
class TestDatabaseConnectivityIntegration:
    """Integration tests verifying real connectivity against PostgreSQL instance."""

    def test_check_connectivity_select_1(self):
        manager = DatabaseManager()
        result = manager.check_connectivity()
        assert result["status"] == "healthy"
        assert result["database"] == "postgresql"
        assert result["result"] == 1

    def test_get_db_context_manager(self):
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 + 1 AS addition;")
                row = cur.fetchone()
                assert row is not None
                assert row[0] == 2

    def test_check_db_connectivity_helper(self):
        is_healthy = check_db_connectivity()
        assert is_healthy is True

    def test_connection_release_and_pool_close(self):
        manager = DatabaseManager()
        pool = manager.get_pool()
        assert pool.closed is False
        
        # Lease and release
        with manager.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT current_database();")
                db_name = cur.fetchone()[0]
                assert db_name == "hcl_learning"

        manager.close()
        assert pool.closed is True
