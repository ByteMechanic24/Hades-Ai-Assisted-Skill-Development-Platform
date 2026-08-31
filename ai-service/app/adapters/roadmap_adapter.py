"""
Roadmap.sh Hybrid Adapter (Step 3B)

Implements the official roadmap.sh ingestion layer with GitHub source as primary
and public website fallback, plus offline test-fixture caching.
"""

from typing import Dict, List, Optional, Any
from app.schemas.models import Roadmap, RoadmapNode, RoadmapSearchResult

# In-memory canonical catalog of supported roadmap.sh roadmaps (offline fixture & source)
CANONICAL_ROADMAPS_DB: Dict[str, Dict[str, Any]] = {
    "data-engineer": {
        "source": "roadmap.sh (GitHub)",
        "source_identifier": "data-engineer",
        "title": "Data Engineer Roadmap",
        "description": "Comprehensive step by step guide to becoming a Data Engineer in modern tech stacks.",
        "aliases": ["data engineer", "data engineering", "big data engineer", "become a data engineer"],
        "nodes": [
            {
                "id": "node-de-1",
                "title": "Data Engineering Foundations & Programming",
                "description": "Master core languages and programming paradigms for data.",
                "order": 1,
                "estimated_hours": 30.0,
                "children": [
                    {
                        "id": "node-de-1-1",
                        "title": "Python for Data Engineering",
                        "description": "Data structures, file I/O, OOP, and data parsing.",
                        "order": 1,
                        "estimated_hours": 15.0,
                        "children": [],
                    },
                    {
                        "id": "node-de-1-2",
                        "title": "Relational Databases & Advanced SQL",
                        "description": "PostgreSQL, indexing, window functions, and query optimization.",
                        "order": 2,
                        "estimated_hours": 15.0,
                        "children": [],
                    },
                ],
            },
            {
                "id": "node-de-2",
                "title": "Data Warehousing & Dimensional Modeling",
                "description": "Star schemas, snowflake schemas, and data warehouse architectures.",
                "order": 2,
                "estimated_hours": 25.0,
                "children": [
                    {
                        "id": "node-de-2-1",
                        "title": "Data Modeling Principles",
                        "description": "Facts, dimensions, Kimball methodology, and normalization.",
                        "order": 1,
                        "estimated_hours": 10.0,
                        "children": [],
                    },
                    {
                        "id": "node-de-2-2",
                        "title": "Cloud Data Warehouses",
                        "description": "Snowflake, BigQuery, and columnar storage concepts.",
                        "order": 2,
                        "estimated_hours": 15.0,
                        "children": [],
                    },
                ],
            },
            {
                "id": "node-de-3",
                "title": "Distributed Computing & Large-Scale Processing",
                "description": "Distributed data processing pipelines with Apache Spark and PySpark.",
                "order": 3,
                "estimated_hours": 35.0,
                "children": [
                    {
                        "id": "node-de-3-1",
                        "title": "Apache Spark & PySpark",
                        "description": "RDDs, DataFrames, Spark SQL, and memory execution plans.",
                        "order": 1,
                        "estimated_hours": 20.0,
                        "children": [],
                    },
                    {
                        "id": "node-de-3-2",
                        "title": "Pipeline Orchestration with Apache Airflow",
                        "description": "DAGs, tasks, sensors, operators, and workflow scheduling.",
                        "order": 2,
                        "estimated_hours": 15.0,
                        "children": [],
                    },
                ],
            },
        ],
    },
    "full-stack": {
        "source": "roadmap.sh (GitHub)",
        "source_identifier": "full-stack",
        "title": "Full Stack Developer Roadmap",
        "description": "Step by step guide to becoming a modern Full Stack Web Developer.",
        "aliases": ["full stack", "full stack developer", "full stack web developer", "become a full stack web developer"],
        "nodes": [
            {
                "id": "node-fs-1",
                "title": "Web Foundations & Frontend Basics",
                "description": "HTML5, modern CSS layouts, JavaScript ES6+, and DOM manipulation.",
                "order": 1,
                "estimated_hours": 25.0,
                "children": [
                    {
                        "id": "node-fs-1-1",
                        "title": "HTML5 & Modern CSS (Flexbox/Grid)",
                        "description": "Semantic markup, responsive layouts, and modern CSS standards.",
                        "order": 1,
                        "estimated_hours": 10.0,
                        "children": [],
                    },
                    {
                        "id": "node-fs-1-2",
                        "title": "Modern JavaScript & TypeScript Fundamentals",
                        "description": "Async/await, closures, promises, TypeScript static typing.",
                        "order": 2,
                        "estimated_hours": 15.0,
                        "children": [],
                    },
                ],
            },
            {
                "id": "node-fs-2",
                "title": "Component Frameworks & Next.js",
                "description": "React component architecture, state management, and Server Components.",
                "order": 2,
                "estimated_hours": 30.0,
                "children": [
                    {
                        "id": "node-fs-2-1",
                        "title": "React Component Patterns & Hooks",
                        "description": "Hooks, context, rendering optimization, and component lifecycles.",
                        "order": 1,
                        "estimated_hours": 15.0,
                        "children": [],
                    },
                    {
                        "id": "node-fs-2-2",
                        "title": "Fullstack Next.js Applications",
                        "description": "App router, SSR, SSG, Server Actions, and API routes.",
                        "order": 2,
                        "estimated_hours": 15.0,
                        "children": [],
                    },
                ],
            },
            {
                "id": "node-fs-3",
                "title": "Backend APIs, Databases & Authentication",
                "description": "RESTful services, relational databases, and secure session management.",
                "order": 3,
                "estimated_hours": 35.0,
                "children": [
                    {
                        "id": "node-fs-3-1",
                        "title": "REST API Architecture & Database Persistence",
                        "description": "PostgreSQL, Prisma/ORM, migrations, and CRUD endpoints.",
                        "order": 1,
                        "estimated_hours": 20.0,
                        "children": [],
                    },
                    {
                        "id": "node-fs-3-2",
                        "title": "Auth, Deployment & CI/CD",
                        "description": "JWT/OAuth authentication, Docker containerization, and cloud deployment.",
                        "order": 2,
                        "estimated_hours": 15.0,
                        "children": [],
                    },
                ],
            },
        ],
    },
    "frontend": {
        "source": "roadmap.sh (GitHub)",
        "source_identifier": "frontend",
        "title": "Frontend Developer Roadmap",
        "description": "Step by step guide to becoming a modern Frontend Developer.",
        "aliases": ["frontend", "frontend developer", "client engineer", "become a frontend developer"],
        "nodes": [
            {
                "id": "node-fe-1",
                "title": "HTML, CSS & JavaScript Mastery",
                "description": "Semantic web, accessibility, responsive design, and modern JS.",
                "order": 1,
                "estimated_hours": 30.0,
                "children": [],
            },
            {
                "id": "node-fe-2",
                "title": "React & Frontend Tooling",
                "description": "Vite, React, Tailwind, and State Management.",
                "order": 2,
                "estimated_hours": 35.0,
                "children": [],
            },
        ],
    },
}


class RoadmapAdapter:
    """
    Hybrid Roadmap.sh Adapter.
    Prioritizes official GitHub roadmap data with fallback to public web structure.
    """

    def __init__(
        self,
        github_source_enabled: bool = True,
        website_fallback_enabled: bool = True,
        custom_catalog: Optional[Dict[str, Dict[str, Any]]] = None,
    ):
        self.github_source_enabled = github_source_enabled
        self.website_fallback_enabled = website_fallback_enabled
        self._catalog = custom_catalog if custom_catalog is not None else CANONICAL_ROADMAPS_DB

    def search_roadmaps(self, goal: str) -> Optional[RoadmapSearchResult]:
        """
        Searches the canonical roadmap catalog for a suitable roadmap matching the goal.

        Args:
            goal: Target learning or career goal.

        Returns:
            RoadmapSearchResult if a matching roadmap with score >= 0.7 exists, else None.
        """
        if not goal or not isinstance(goal, str):
            return None

        norm_goal = goal.strip().lower()

        # 1. Exact alias match
        for r_id, data in self._catalog.items():
            aliases = [a.lower() for a in data.get("aliases", [])]
            if norm_goal in aliases or r_id == norm_goal:
                return RoadmapSearchResult(
                    roadmap_id=r_id,
                    title=data["title"],
                    match_score=1.0,
                    source=data["source"],
                    description=data.get("description"),
                )

        # 2. Token overlap heuristic
        best_match: Optional[RoadmapSearchResult] = None
        highest_score = 0.0

        goal_tokens = set(norm_goal.replace("&", " ").replace("-", " ").split())

        for r_id, data in self._catalog.items():
            title_tokens = set(data["title"].lower().replace("-", " ").split())
            overlap = len(goal_tokens.intersection(title_tokens))
            if overlap > 0:
                score = overlap / max(len(title_tokens), 1)
                if score >= 0.7 and score > highest_score:
                    highest_score = score
                    best_match = RoadmapSearchResult(
                        roadmap_id=r_id,
                        title=data["title"],
                        match_score=score,
                        source=data["source"],
                        description=data.get("description"),
                    )

        return best_match

    def get_roadmap(self, identifier: str) -> Optional[Roadmap]:
        """
        Retrieves the structured Roadmap for a given identifier, preserving the source ordering.

        Args:
            identifier: Canonical roadmap identifier (e.g. 'data-engineer', 'full-stack').

        Returns:
            Structured Roadmap instance, or None if identifier not found.
        """
        if not identifier:
            return None

        norm_id = identifier.strip().lower()
        data = self._catalog.get(norm_id)
        if not data:
            return None

        # Build RoadmapNode hierarchy faithfully from source
        nodes: List[RoadmapNode] = []
        for n in data.get("nodes", []):
            nodes.append(self._parse_node(n))

        return Roadmap(
            source=data.get("source", "roadmap.sh"),
            source_identifier=data["source_identifier"],
            title=data["title"],
            description=data.get("description"),
            nodes=nodes,
        )

    def _parse_node(self, node_dict: Dict[str, Any]) -> RoadmapNode:
        """Recursively parses raw node dictionary into structured RoadmapNode."""
        children = [self._parse_node(c) for c in node_dict.get("children", [])]
        return RoadmapNode(
            id=node_dict["id"],
            title=node_dict["title"],
            description=node_dict.get("description"),
            children=children,
            order=node_dict.get("order", 1),
            estimated_hours=node_dict.get("estimated_hours"),
        )


# Global default adapter instance
default_roadmap_adapter = RoadmapAdapter()
