import logging
from contextlib import contextmanager
from typing import Generator, Optional, Dict, Any
import psycopg
from psycopg_pool import ConnectionPool, PoolTimeout

from app.core.config import settings
from app.db.exceptions import (
    DatabaseError,
    DatabaseConfigurationError,
    DatabaseConnectionError,
    DatabasePoolError,
    sanitize_db_url,
)

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages PostgreSQL connection pooling and lifecycle."""

    def __init__(
        self,
        database_url: Optional[str] = None,
        min_size: Optional[int] = None,
        max_size: Optional[int] = None,
        timeout: Optional[float] = None,
    ):
        self._database_url = database_url
        self._min_size = min_size
        self._max_size = max_size
        self._timeout = timeout
        self._pool: Optional[ConnectionPool] = None

    @property
    def database_url(self) -> str:
        url = self._database_url or settings.DATABASE_URL
        if not url:
            raise DatabaseConfigurationError(
                "DATABASE_URL environment variable is not configured."
            )
        return url

    @property
    def min_size(self) -> int:
        return self._min_size if self._min_size is not None else settings.DATABASE_POOL_MIN_SIZE

    @property
    def max_size(self) -> int:
        return self._max_size if self._max_size is not None else settings.DATABASE_POOL_MAX_SIZE

    @property
    def timeout(self) -> float:
        return self._timeout if self._timeout is not None else settings.DATABASE_POOL_TIMEOUT

    def get_pool(self) -> ConnectionPool:
        """Retrieve or initialize the connection pool."""
        if self._pool is None or self._pool.closed:
            url = self.database_url
            try:
                self._pool = ConnectionPool(
                    conninfo=url,
                    min_size=self.min_size,
                    max_size=self.max_size,
                    timeout=self.timeout,
                    open=True,
                )
                logger.info(
                    "Initialized PostgreSQL connection pool for %s (min=%d, max=%d)",
                    sanitize_db_url(url),
                    self.min_size,
                    self.max_size,
                )
            except Exception as e:
                sanitized_msg = sanitize_db_url(str(e))
                raise DatabaseConnectionError(
                    f"Failed to initialize PostgreSQL connection pool: {sanitized_msg}",
                    original_error=e,
                ) from e
        return self._pool

    @contextmanager
    def get_connection(self) -> Generator[psycopg.Connection, None, None]:
        """Context manager to lease a connection from the pool and return it upon exit."""
        pool = self.get_pool()
        try:
            with pool.connection() as conn:
                yield conn
        except PoolTimeout as e:
            raise DatabasePoolError("Connection pool acquisition timed out.") from e
        except psycopg.OperationalError as e:
            sanitized_msg = sanitize_db_url(str(e))
            raise DatabaseConnectionError(
                f"PostgreSQL operational error: {sanitized_msg}",
                original_error=e,
            ) from e
        except Exception as e:
            if isinstance(e, (DatabaseError, DatabaseConnectionError, DatabasePoolError)):
                raise
            sanitized_msg = sanitize_db_url(str(e))
            raise DatabaseConnectionError(
                f"Unexpected database connection error: {sanitized_msg}",
                original_error=e,
            ) from e

    def check_connectivity(self) -> Dict[str, Any]:
        """Execute a simple query (SELECT 1) to verify database health."""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1 AS health_check;")
                    result = cur.fetchone()
                    if result and result[0] == 1:
                        return {
                            "status": "healthy",
                            "database": "postgresql",
                            "check_query": "SELECT 1",
                            "result": 1,
                        }
                    raise DatabaseConnectionError("Unexpected query result during connectivity check.")
        except Exception as e:
            if isinstance(e, DatabaseError):
                raise
            sanitized_msg = sanitize_db_url(str(e))
            raise DatabaseConnectionError(
                f"Database connectivity check failed: {sanitized_msg}",
                original_error=e,
            ) from e

    def close(self) -> None:
        """Close the connection pool and release all active resources."""
        if self._pool is not None and not self._pool.closed:
            try:
                self._pool.close()
                logger.info("Closed PostgreSQL connection pool.")
            except Exception as e:
                logger.warning("Error closing connection pool: %s", sanitize_db_url(str(e)))
            finally:
                self._pool = None


# Singleton instance for general application use
db_manager = DatabaseManager()


@contextmanager
def get_db(manager: Optional[DatabaseManager] = None) -> Generator[psycopg.Connection, None, None]:
    """Convenience context manager for yielding database connections."""
    active_manager = manager or db_manager
    with active_manager.get_connection() as conn:
        yield conn


def init_db(database_url: Optional[str] = None) -> DatabaseManager:
    """Initialize database connection manager with optional explicit URL."""
    global db_manager
    if database_url:
        db_manager = DatabaseManager(database_url=database_url)
    db_manager.get_pool()
    return db_manager


def close_db(manager: Optional[DatabaseManager] = None) -> None:
    """Close the active database manager pool."""
    active_manager = manager or db_manager
    active_manager.close()


def check_db_connectivity(manager: Optional[DatabaseManager] = None) -> bool:
    """Convenience boolean helper for database health."""
    active_manager = manager or db_manager
    res = active_manager.check_connectivity()
    return res.get("status") == "healthy"
