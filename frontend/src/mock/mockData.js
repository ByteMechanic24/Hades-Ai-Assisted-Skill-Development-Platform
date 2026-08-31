export const initialLearnerProfile = {
  id: "user_01",
  name: "Aman Kumar",
  email: "aman@hades.ai",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  currentRole: "Computer Science Learner",
  targetRole: "Autonomous AI Systems Engineer",
  educationLevel: "Undergraduate / Tech Enthusiast",
  experienceLevel: "Intermediate",
  interests: ["Generative AI", "Agentic Workflows", "Vector Databases", "Deep Learning", "FastAPI"],
  learningPreferences: {
    format: ["Hands-on Projects", "Interactive Labs", "Curated Videos"],
    pace: "Accelerated",
    weeklyHours: 14
  }
};

export const initialLearningGoal = {
  id: "goal_01",
  title: "Master AI Agent Orchestration & Production LLMOps",
  targetRole: "Autonomous AI Systems Engineer",
  timeframeWeeks: 12,
  completedWeeks: 3,
  currentLevel: "Intermediate",
  targetLevel: "Production-Ready Specialist",
  status: "in_progress"
};

// Rich roadmap.sh style interactive tree structure with branches & ranked YouTube playlists
export const interactiveRoadmapData = {
  id: "roadmap_ai_engineer",
  title: "AI Engineer & Autonomous Systems Roadmap",
  description: "Comprehensive step-by-step curriculum with branch nodes, ranked YouTube playlists, and deterministic progress gates.",
  rootTopic: "AI Systems Engineering",
  mainNodes: [
    {
      id: "node_internet_math",
      title: "Foundational Math & Python Internals",
      category: "Core Foundation",
      status: "done", // 'done' | 'learning' | 'skip' | 'pending'
      description: "Mathematical foundations for high-dimensional representations, matrix transformations, and vectorized Python execution.",
      branches: [
        {
          id: "sub_linear_algebra",
          title: "Linear Algebra & Dot Products",
          status: "done",
          summary: "Vector spaces, matrix multiplication, projections, eigenvalues, and dot products as projection metrics in latent space.",
          recommendedResource: {
            title: "Essence of Linear Algebra",
            provider: "3Blue1Brown (Official Series)",
            duration: "3h 40m",
            type: "Video Series",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v1",
              rank: 1,
              title: "Linear Algebra for Machine Learning & Deep Learning",
              channel: "freeCodeCamp.org",
              duration: "3h 56m",
              views: "1.2M views",
              thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80",
              rating: "98% Match"
            },
            {
              id: "v2",
              rank: 2,
              title: "Vectors, Dot Product, and Matrix Operations Explained Visualized",
              channel: "3Blue1Brown",
              duration: "22 mins",
              views: "3.4M views",
              thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80",
              rating: "95% Match"
            }
          ],
          articles: [
            { title: "Matrix Decomposition & Geometric Intuition", duration: "12 min read" },
            { title: "NumPy Vectorization vs CPU Loops Benchmark", duration: "8 min read" }
          ],
          paidCourses: [
            {
              id: "p1",
              title: "Mathematics for Machine Learning: Linear Algebra Specialization",
              provider: "Imperial College London (Coursera)",
              price: "$49 / month",
              discount: "Financial Aid Available",
              rating: "4.9 ★ (14k reviews)",
              duration: "18 hours",
              certificate: true,
              url: "https://coursera.org"
            },
            {
              id: "p2",
              title: "Complete Linear Algebra & Tensor Operations Masterclass",
              provider: "Udemy Pro",
              price: "$14.99",
              discount: "85% Off Sale",
              rating: "4.8 ★",
              duration: "14.5 hours",
              certificate: true,
              url: "https://udemy.com"
            }
          ]
        },
        {
          id: "sub_probability",
          title: "Probability & Bayes Rule in AI",
          status: "done",
          summary: "Conditional probability, Gaussian distributions, maximum likelihood estimation (MLE), and entropy metrics.",
          recommendedResource: {
            title: "Probability Theory for ML",
            provider: "MIT OpenCourseWare",
            duration: "2h 10m",
            type: "University Lecture",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v3",
              rank: 1,
              title: "Bayes Theorem, Clearly Explained with Visual Intuition",
              channel: "StatQuest with Josh Starmer",
              duration: "14 mins",
              views: "980K views",
              thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80",
              rating: "96% Match"
            }
          ],
          articles: [
            { title: "Cross-Entropy Loss Demystified", duration: "10 min read" }
          ]
        },
        {
          id: "sub_python_async",
          title: "Python AsyncIO & Pydantic V2",
          status: "done",
          summary: "Event loops, coroutines, async context managers, and strict schema validation for low-latency agent tools.",
          recommendedResource: {
            title: "Async Python & Pydantic V2 Masterclass",
            provider: "ArjanCodes & HADES",
            duration: "1h 45m",
            type: "Hands-on Lab",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v4",
              rank: 1,
              title: "Complete Python Asyncio Tutorial for Backend & LLM APIs",
              channel: "mCoding",
              duration: "28 mins",
              views: "450K views",
              thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
              rating: "94% Match"
            }
          ],
          articles: [
            { title: "Pydantic V2 Performance Gains & Serialization", duration: "7 min read" }
          ]
        }
      ]
    },
    {
      id: "node_vector_storage",
      title: "Vector Embeddings & Retrieval (RAG)",
      category: "Information Retrieval",
      status: "learning",
      description: "High-dimensional embedding models, chunking strategies, indexing algorithms (HNSW, IVF-PQ), and hybrid reciprocal rank fusion.",
      branches: [
        {
          id: "sub_embeddings_math",
          title: "High-Dimensional Embeddings & Cosine Distance",
          status: "done",
          summary: "Tokenization, transformer latent spaces, dense semantic representations, and cosine similarity calculations.",
          recommendedResource: {
            title: "Embeddings: What They Are and How They Work",
            provider: "Cohere AI Academy",
            duration: "45 mins",
            type: "Interactive Workshop",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v5",
              rank: 1,
              title: "Vector Embeddings for Beginners Explained Simply",
              channel: "Fireship",
              duration: "8 mins",
              views: "890K views",
              thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
              rating: "99% Match"
            },
            {
              id: "v6",
              rank: 2,
              title: "Sentence Transformers & Embedding Fine-Tuning Playlist",
              channel: "James Briggs",
              duration: "1h 15m",
              views: "210K views",
              thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop&q=80",
              rating: "93% Match"
            }
          ],
          articles: [
            { title: "Why Cosine Distance Outperforms Euclidean in High Dimensions", duration: "11 min read" }
          ]
        },
        {
          id: "sub_pgvector_hnsw",
          title: "pgvector, Qdrant & HNSW Indexing",
          status: "learning",
          summary: "Building sub-millisecond approximate nearest neighbor (ANN) search using Hierarchical Navigable Small World graphs in Postgres.",
          recommendedResource: {
            title: "Production pgvector & Index Optimization Lab",
            provider: "HADES Curated Sandbox",
            duration: "50 mins",
            type: "Hands-on Sandbox",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v7",
              rank: 1,
              title: "PostgreSQL pgvector Full Tutorial: Build Vector Search from Scratch",
              channel: "Hussein Nasser",
              duration: "42 mins",
              views: "310K views",
              thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&auto=format&fit=crop&q=80",
              rating: "98% Match"
            },
            {
              id: "v8",
              rank: 2,
              title: "How HNSW Indexes Work in Vector Databases (Visualized Graph)",
              channel: "Pinecone AI",
              duration: "18 mins",
              views: "180K views",
              thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80",
              rating: "95% Match"
            }
          ],
          articles: [
            { title: "Tuning m and ef_construction parameters in HNSW", duration: "14 min read" },
            { title: "Lexical BM25 + Semantic Hybrid Search with Reciprocal Rank Fusion", duration: "12 min read" }
          ],
          paidCourses: [
            {
              id: "p3",
              title: "Vector Databases & Advanced Semantic Search Bootcamp",
              provider: "DeepLearning.AI (Pro Certification)",
              price: "$39",
              discount: "Verified Certificate Included",
              rating: "4.9 ★ (3.2k enrolled)",
              duration: "6 hours",
              certificate: true,
              url: "https://deeplearning.ai"
            },
            {
              id: "p4",
              title: "Production pgvector, Qdrant & Redis Semantic Caching",
              provider: "O'Reilly Learning Pro",
              price: "$49 / month",
              discount: "10-day Free Trial",
              rating: "4.8 ★",
              duration: "8 hours",
              certificate: true,
              url: "https://oreilly.com"
            }
          ]
        },
        {
          id: "sub_reranking",
          title: "Cross-Encoder Re-Ranking & Chunking",
          status: "pending",
          summary: "Sliding window chunking, parent document retrieval, and semantic re-ranking with Cohere/BGE cross-encoders.",
          recommendedResource: {
            title: "Advanced RAG Retrieval Architectures",
            provider: "DeepLearning.AI",
            duration: "1h 20m",
            type: "Video Course",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v9",
              rank: 1,
              title: "Advanced RAG: Chunking Strategies, Rerankers, & Evaluation",
              channel: "LangChain",
              duration: "55 mins",
              views: "140K views",
              thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80",
              rating: "92% Match"
            }
          ],
          articles: [
            { title: "Evaluating Precision@K on Vector Queries", duration: "9 min read" }
          ]
        }
      ]
    },
    {
      id: "node_agent_loops",
      title: "Autonomous Agent Loops & Tool Execution",
      category: "Agent Reasoning",
      status: "pending",
      description: "ReAct reasoning cycles, deterministic schema-bound tool calling, reflection loops, and state machines.",
      branches: [
        {
          id: "sub_react_loop",
          title: "ReAct: Thought, Action, Observation Loop",
          status: "pending",
          summary: "Implementing cyclic reasoning where LLMs generate internal thoughts, invoke APIs, observe results, and iterate.",
          recommendedResource: {
            title: "Building ReAct Agents from Pure Python",
            provider: "HADES Engineering Lab",
            duration: "1h 10m",
            type: "Hands-on Code Blueprint",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v10",
              rank: 1,
              title: "Building AI Agents from Scratch (ReAct Pattern Explained)",
              channel: "AssemblyAI",
              duration: "34 mins",
              views: "420K views",
              thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&auto=format&fit=crop&q=80",
              rating: "97% Match"
            }
          ],
          articles: [
            { title: "Preventing Infinite Tool Calling Loops in Autonomous Agents", duration: "10 min read" }
          ]
        },
        {
          id: "sub_agno_framework",
          title: "Agno / CrewAI Multi-Agent Swarms",
          status: "pending",
          summary: "Hierarchical agent teams with dedicated orchestrator, researcher, reviewer, and coder personas.",
          recommendedResource: {
            title: "Multi-Agent Systems with Agno Framework",
            provider: "Agno Engineering Team",
            duration: "2 hours",
            type: "Full Architecture Guide",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v11",
              rank: 1,
              title: "Agno (Phidata) Tutorial: Build Fast Multi-Agent Python Systems",
              channel: "AI Jason",
              duration: "26 mins",
              views: "190K views",
              thumbnail: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=400&auto=format&fit=crop&q=80",
              rating: "96% Match"
            }
          ],
          articles: [
            { title: "Shared Memory vs Message Bus in Agent Swarms", duration: "13 min read" }
          ]
        }
      ]
    },
    {
      id: "node_production_llmops",
      title: "Production LLMOps, Guardrails & Deterministic Evals",
      category: "Production Infrastructure",
      status: "pending",
      description: "Hardening LLM deployments with semantic caching, hallucination guardrails (NeMo), and automated Ragas benchmarks.",
      branches: [
        {
          id: "sub_guardrails",
          title: "NeMo Guardrails & Prompt Injection Defense",
          status: "pending",
          summary: "Colang dialogue modeling, input/output validation, toxic content filtering, and prompt injection mitigation.",
          recommendedResource: {
            title: "Enterprise LLM Safety with NeMo Guardrails",
            provider: "NVIDIA Developer",
            duration: "1h 30m",
            type: "Workshop",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v12",
              rank: 1,
              title: "How to Secure LLMs: Guardrails, Prompt Injection & Red Teaming",
              channel: "IBM Technology",
              duration: "19 mins",
              views: "230K views",
              thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
              rating: "94% Match"
            }
          ],
          articles: [
            { title: "Deterministic Validation Rules at the Application Boundary", duration: "8 min read" }
          ]
        },
        {
          id: "sub_ragas_eval",
          title: "Continuous Evaluation with Ragas & TruLens",
          status: "pending",
          summary: "Automated quantification of faithfulness, context precision, answer relevancy, and harmonic mean score.",
          recommendedResource: {
            title: "Automated LLM Evaluation Pipelines",
            provider: "Explosion AI",
            duration: "1h 15m",
            type: "Hands-on Lab",
            url: "https://youtube.com"
          },
          rankedVideos: [
            {
              id: "v13",
              rank: 1,
              title: "Evaluating RAG Pipelines with Ragas (Complete Code Walkthrough)",
              channel: "Prompt Engineering",
              duration: "24 mins",
              views: "110K views",
              thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&auto=format&fit=crop&q=80",
              rating: "95% Match"
            }
          ],
          articles: [
            { title: "Building Synthetic Test Datasets with Agno Agents", duration: "12 min read" }
          ]
        }
      ]
    }
  ]
};

export const initialSkills = [
  { id: "sk_1", name: "Vector Databases & Embeddings", category: "Core AI", mastery: 82, target: 95, confidence: "High", trend: "+12%" },
  { id: "sk_2", name: "Agentic Tool Calling & ReAct", category: "Agent Design", mastery: 64, target: 90, confidence: "Medium", trend: "+20%" },
  { id: "sk_3", name: "RAG Evaluation Metrics", category: "LLMOps", mastery: 48, target: 85, confidence: "Improving", trend: "+8%" },
  { id: "sk_4", name: "FastAPI Backend & Pekko HTTP", category: "Architecture", mastery: 78, target: 90, confidence: "High", trend: "+5%" },
  { id: "sk_5", name: "NeMo Guardrails & Safety", category: "Security", mastery: 25, target: 80, confidence: "Needs Work", trend: "0%" },
  { id: "sk_6", name: "Hierarchical Agent Swarms", category: "Agent Design", mastery: 35, target: 85, confidence: "In Progress", trend: "+15%" }
];

export const initialMilestones = [
  {
    id: "ms_01",
    title: "Foundations & High-Dimensional Vectors",
    phase: "Phase 1",
    status: "completed",
    completionDate: "Aug 14, 2026",
    progress: 100,
    skillsEarned: ["Vector Math", "Cosine Distance", "Latent Embeddings"]
  },
  {
    id: "ms_02",
    title: "Production RAG Pipeline Architecture",
    phase: "Phase 1",
    status: "in_progress",
    targetDate: "Aug 26, 2026",
    progress: 65,
    skillsEarned: ["pgvector", "BM25 Hybrid Retrieval", "Context Re-ranking"]
  },
  {
    id: "ms_03",
    title: "Multi-Agent Swarm Orchestration",
    phase: "Phase 2",
    status: "locked",
    targetDate: "Sep 15, 2026",
    progress: 0,
    skillsEarned: ["Agno", "ReAct Loops", "Hierarchical Delegation"]
  },
  {
    id: "ms_04",
    title: "Production LLMOps & Guardrails Capstone",
    phase: "Phase 3",
    status: "locked",
    targetDate: "Oct 05, 2026",
    progress: 0,
    skillsEarned: ["NeMo Guardrails", "Ragas Metric Suite", "Deterministic Evals"]
  }
];

export const initialAssistantMessages = [
  {
    id: "msg_01",
    sender: "assistant",
    timestamp: "10:30 AM",
    content: "Hi Aman! I'm your HADES Contextual Learning Coach. I monitor your active roadmap nodes, current branch progress (*pgvector & HNSW Indexing*), and ranked YouTube learning materials.\n\nClick on any node in the roadmap to view ranked video courses, or ask me directly!"
  }
];

export const suggestedPrompts = [
  "Why is 'pgvector & HNSW Indexing' ranked next in my path?",
  "Recommend the top YouTube playlist for ReAct agents.",
  "Explain Cosine Similarity vs Dot Product simply.",
  "What is the prerequisite for Multi-Agent Swarms?",
  "What are the best free resources for NeMo Guardrails?"
];

// Fallback resources for general catalog search
export const initialResources = [
  {
    id: "res_01",
    title: "Production RAG with Hybrid Search & Semantic Re-ranking",
    provider: "HADES Curated Labs",
    type: "Interactive Lab",
    format: "interactive",
    duration: "45 mins",
    difficulty: "Intermediate",
    rating: 4.9,
    reviewsCount: 312,
    matchScore: 98,
    whyRecommended: "Directly addresses your active vector search node with hands-on code execution.",
    skillsCovered: ["Vector Databases", "pgvector", "BM25 Hybrid Search"],
    progress: 60,
    isSaved: true,
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    url: "#"
  },
  {
    id: "res_02",
    title: "Building Multi-Agent Workflows with Agno & FastAPI",
    provider: "DeepLearning.AI Masterclass",
    type: "Video Course",
    format: "video",
    duration: "2h 15m",
    difficulty: "Advanced",
    rating: 4.8,
    reviewsCount: 840,
    matchScore: 95,
    whyRecommended: "Top-ranked YouTube playlist for Autonomous AI Systems Engineer target role.",
    skillsCovered: ["Agno Framework", "Multi-Agent Swarms", "Tool Routing"],
    progress: 20,
    isSaved: false,
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop&q=80",
    url: "#"
  },
  {
    id: "res_03",
    title: "The Architecture of Deterministic LLM Guardrails",
    provider: "OpenAI Research & HADES AI",
    type: "Technical Article",
    format: "article",
    duration: "18 mins read",
    difficulty: "Intermediate",
    rating: 4.7,
    reviewsCount: 156,
    matchScore: 91,
    whyRecommended: "Recommended to bridge security gap before moving into Phase 3 production deployments.",
    skillsCovered: ["Guardrails", "Hallucination Defense", "Safety Filters"],
    progress: 0,
    isSaved: true,
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80",
    url: "#"
  }
];

export const initialLearningPath = {
  id: "path_ai_agent_eng_2026",
  goalId: "goal_01",
  title: "Personalized Roadmap: AI Agent Architect & Production LLMOps",
  description: "Dynamic AI-generated curriculum tailored for your background in Python & software design, focusing on multi-agent collaboration, vector retrieval, and deterministic evaluation.",
  status: "active",
  overallProgress: 38,
  estimatedHoursLeft: 42,
  pathAdaptationBanner: {
    visible: true,
    timestamp: "Just now",
    title: "Path Adapted by HADES AI Engine",
    message: "Based on your latest progress, we added a targeted module 'Vector Search Deep Dive & Hybrid Retrieval' before Multi-Agent Swarms.",
    type: "enhancement"
  },
  phases: [
    {
      id: "phase_1",
      number: 1,
      title: "Foundations & Vector Architecture",
      description: "Master high-dimensional vector representations, indexing algorithms (HNSW), and semantic search.",
      status: "in_progress",
      progress: 75,
      nodes: [
        {
          id: "node_1_1",
          type: "skill",
          title: "High-Dimensional Vector Math & Embeddings",
          status: "completed",
          estimatedMinutes: 180,
          confidenceScore: 85,
          prerequisites: [],
          description: "Understanding cosine similarity, dot products, and token embeddings in latent space."
        },
        {
          id: "node_1_2",
          type: "resource",
          title: "Vector Search Deep Dive with pgvector & Qdrant",
          status: "in_progress",
          estimatedMinutes: 90,
          resourceType: "Interactive Lab",
          prerequisites: ["node_1_1"],
          description: "Hands-on implementation of HNSW index tuning and hybrid lexical + semantic search."
        },
        {
          id: "node_1_3",
          type: "milestone",
          title: "Milestone 1: Production-Grade RAG Engine Built",
          status: "in_progress",
          prerequisites: ["node_1_2"],
          description: "End-to-end evaluation pipeline with semantic re-ranking and sub-100ms latency."
        }
      ]
    },
    {
      id: "phase_2",
      number: 2,
      title: "Autonomous Agent Reasoning & Tool Use",
      description: "Design ReAct loops, deterministic tool invocation, plan-and-solve workflows, and structured outputs.",
      status: "available",
      progress: 15,
      nodes: [
        {
          id: "node_2_1",
          type: "skill",
          title: "ReAct Loop Architecture & Function Calling",
          status: "in_progress",
          estimatedMinutes: 210,
          confidenceScore: 60,
          prerequisites: [],
          description: "Structuring schema-validated tool definitions and grounding agent reasoning."
        },
        {
          id: "node_2_2",
          type: "resource",
          title: "Agno / CrewAI Multi-Agent Swarm Orchestration",
          status: "available",
          estimatedMinutes: 120,
          resourceType: "Project Blueprint",
          prerequisites: ["node_2_1"],
          description: "Building hierarchical agent teams with dedicated planner, researcher, and executor roles."
        }
      ]
    },
    {
      id: "phase_3",
      number: 3,
      title: "Production LLMOps, Guardrails & Deterministic Evals",
      description: "Hardening LLM deployments with semantic caching, hallucination guardrails, and automated red-teaming.",
      status: "locked",
      progress: 0,
      nodes: [
        {
          id: "node_3_1",
          type: "skill",
          title: "Guardrails, Prompt Injection Defense & Safety",
          status: "locked",
          estimatedMinutes: 150,
          prerequisites: [],
          description: "Deploying NeMo Guardrails and regex/semantic output sanitization."
        }
      ]
    }
  ]
};
