import { RoadmapNodeType, NodeStatus, NodePriority, NodeMetadata } from "@/types/roadmap";

export interface TemplateNode {
  id: string;
  type: RoadmapNodeType;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  status: NodeStatus;
  priority: NodePriority;
  positionX: number;
  positionY: number;
  metadata?: NodeMetadata;
}

export interface RoadmapTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  nodes: TemplateNode[];
  edges: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    label?: string;
    type?: string;
    animated?: boolean;
  }>;
}

export const ROADMAP_TEMPLATES: RoadmapTemplate[] = [
  {
    id: "frontend-dev",
    name: "Frontend Developer Roadmap",
    category: "Web Development",
    description:
      "Modern client-side engineering: HTML/CSS, JavaScript/TypeScript, React 18/19, Next.js, state management, and performance.",
    icon: "🌐",
    difficulty: "Beginner",
    nodes: [
      {
        id: "fe-1",
        type: "topic",
        title: "Internet & Web Fundamentals",
        description: "How DNS, HTTP/HTTPS, Browsers, and DOM rendering work under the hood.",
        category: "Web Development",
        difficulty: "Beginner",
        estimatedHours: 8,
        status: "Completed",
        priority: "High",
        positionX: 100,
        positionY: 80,
        metadata: {},
      },
      {
        id: "fe-2",
        type: "topic",
        title: "HTML5, Semantic Markup & CSS3",
        description: "Modern CSS Grid, Flexbox, Responsive Design, and Accessibility (a11y).",
        category: "Web Development",
        difficulty: "Beginner",
        estimatedHours: 14,
        status: "Completed",
        priority: "High",
        positionX: 100,
        positionY: 260,
        metadata: {},
      },
      {
        id: "fe-3",
        type: "topic",
        title: "Modern JavaScript & TypeScript",
        description: "ES6+, Async/Await, Event Loop, Closures, Prototypes, and Strict Typing.",
        category: "Web Development",
        difficulty: "Intermediate",
        estimatedHours: 24,
        status: "In Progress",
        priority: "High",
        positionX: 100,
        positionY: 440,
        metadata: {},
      },
      {
        id: "fe-4",
        type: "milestone",
        title: "Milestone: Interactive Web App",
        description: "Build a responsive dynamic application completely with vanilla TypeScript.",
        category: "Web Development",
        difficulty: "Intermediate",
        estimatedHours: 15,
        status: "Not Started",
        priority: "High",
        positionX: 420,
        positionY: 340,
        metadata: { targetDate: "Week 4" },
      },
      {
        id: "fe-5",
        type: "topic",
        title: "React 18 & Next.js App Router",
        description: "Hooks, Server Components, Server Actions, Suspense, and Streaming.",
        category: "Web Development",
        difficulty: "Intermediate",
        estimatedHours: 30,
        status: "Not Started",
        priority: "High",
        positionX: 100,
        positionY: 620,
        metadata: {},
      },
      {
        id: "fe-6",
        type: "project",
        title: "Full-Stack SaaS Storefront",
        description: "Production eCommerce application with Next.js, Stripe, and Tailwind CSS.",
        category: "Web Development",
        difficulty: "Advanced",
        estimatedHours: 25,
        status: "Not Started",
        priority: "High",
        positionX: 420,
        positionY: 580,
        metadata: {},
      },
    ],
    edges: [
      { id: "e-fe-1-2", sourceNodeId: "fe-1", targetNodeId: "fe-2", type: "smoothstep" },
      { id: "e-fe-2-3", sourceNodeId: "fe-2", targetNodeId: "fe-3", type: "smoothstep" },
      { id: "e-fe-2-4", sourceNodeId: "fe-2", targetNodeId: "fe-4", type: "smoothstep" },
      { id: "e-fe-3-4", sourceNodeId: "fe-3", targetNodeId: "fe-4", type: "smoothstep" },
      {
        id: "e-fe-3-5",
        sourceNodeId: "fe-3",
        targetNodeId: "fe-5",
        type: "smoothstep",
        animated: true,
      },
      { id: "e-fe-5-6", sourceNodeId: "fe-5", targetNodeId: "fe-6", type: "smoothstep" },
    ],
  },
  {
    id: "backend-dev",
    name: "Backend Developer Roadmap",
    category: "Computer Science",
    description:
      "APIs, Node.js, Go/Python, relational & NoSQL databases, caching, message queues, and microservices.",
    icon: "⚙️",
    difficulty: "Intermediate",
    nodes: [
      {
        id: "be-1",
        type: "topic",
        title: "Backend Language: Node.js & Go",
        description: "Runtime concurrency, memory management, I/O multiplexing, and HTTP engines.",
        category: "Computer Science",
        difficulty: "Beginner",
        estimatedHours: 20,
        status: "Completed",
        priority: "High",
        positionX: 100,
        positionY: 100,
        metadata: {},
      },
      {
        id: "be-2",
        type: "topic",
        title: "Relational & Document Databases",
        description:
          "PostgreSQL ACID transactions, indexing, indexing strategies, MongoDB, Mongoose.",
        category: "Computer Science",
        difficulty: "Intermediate",
        estimatedHours: 22,
        status: "In Progress",
        priority: "High",
        positionX: 100,
        positionY: 280,
        metadata: {},
      },
      {
        id: "be-3",
        type: "topic",
        title: "Caching & Queues (Redis, RabbitMQ)",
        description: "Distributed locks, pub/sub, cache invalidation, asynchronous worker tasks.",
        category: "Computer Science",
        difficulty: "Intermediate",
        estimatedHours: 16,
        status: "Not Started",
        priority: "Medium",
        positionX: 100,
        positionY: 460,
        metadata: {},
      },
      {
        id: "be-4",
        type: "milestone",
        title: "Milestone: High-Throughput REST API",
        description: "Production API achieving 5,000 req/sec with rate limiting and Redis caching.",
        category: "Computer Science",
        difficulty: "Advanced",
        estimatedHours: 18,
        status: "Not Started",
        priority: "High",
        positionX: 420,
        positionY: 370,
        metadata: { targetDate: "Week 6" },
      },
    ],
    edges: [
      { id: "e-be-1-2", sourceNodeId: "be-1", targetNodeId: "be-2", type: "smoothstep" },
      {
        id: "e-be-2-3",
        sourceNodeId: "be-2",
        targetNodeId: "be-3",
        type: "smoothstep",
        animated: true,
      },
      { id: "e-be-2-4", sourceNodeId: "be-2", targetNodeId: "be-4", type: "smoothstep" },
      { id: "e-be-3-4", sourceNodeId: "be-3", targetNodeId: "be-4", type: "smoothstep" },
    ],
  },
  {
    id: "ai-engineer",
    name: "AI Engineer Roadmap",
    category: "AI & Machine Learning",
    description:
      "LLMs, Prompt Engineering, RAG architectures, Vector DBs, LangChain/LlamaIndex, and model evals.",
    icon: "🧠",
    difficulty: "Advanced",
    nodes: [
      {
        id: "ai-1",
        type: "topic",
        title: "LLM Fundamentals & Tokenization",
        description:
          "Transformer architecture, context windows, tokenizers, embeddings, and API clients.",
        category: "AI & Machine Learning",
        difficulty: "Beginner",
        estimatedHours: 12,
        status: "Completed",
        priority: "High",
        positionX: 100,
        positionY: 100,
        metadata: {},
      },
      {
        id: "ai-2",
        type: "topic",
        title: "RAG & Vector Databases",
        description: "Chunking strategies, hybrid search, Pinecone/ChromaDB/Qdrant, rerankers.",
        category: "AI & Machine Learning",
        difficulty: "Intermediate",
        estimatedHours: 20,
        status: "In Progress",
        priority: "High",
        positionX: 100,
        positionY: 280,
        metadata: {},
      },
      {
        id: "ai-3",
        type: "topic",
        title: "Autonomous Agents & Tool Calling",
        description: "ReAct loop, function calling, structured outputs, multi-agent swarms.",
        category: "AI & Machine Learning",
        difficulty: "Advanced",
        estimatedHours: 28,
        status: "Not Started",
        priority: "High",
        positionX: 100,
        positionY: 460,
        metadata: {},
      },
      {
        id: "ai-4",
        type: "project",
        title: "Local Knowledge RAG Copilot",
        description: "Deploy an offline document search and QA agent using Ollama and LangChain.",
        category: "AI & Machine Learning",
        difficulty: "Advanced",
        estimatedHours: 20,
        status: "Not Started",
        priority: "High",
        positionX: 420,
        positionY: 370,
        metadata: {},
      },
    ],
    edges: [
      { id: "e-ai-1-2", sourceNodeId: "ai-1", targetNodeId: "ai-2", type: "smoothstep" },
      {
        id: "e-ai-2-3",
        sourceNodeId: "ai-2",
        targetNodeId: "ai-3",
        type: "smoothstep",
        animated: true,
      },
      { id: "e-ai-2-4", sourceNodeId: "ai-2", targetNodeId: "ai-4", type: "smoothstep" },
      { id: "e-ai-3-4", sourceNodeId: "ai-3", targetNodeId: "ai-4", type: "smoothstep" },
    ],
  },
  {
    id: "machine-learning",
    name: "Machine Learning Roadmap",
    category: "Data Science",
    description:
      "Linear Algebra, Calculus, Statistics, Supervised/Unsupervised Learning, PyTorch, and Deep Learning.",
    icon: "📊",
    difficulty: "Advanced",
    nodes: [
      {
        id: "ml-1",
        type: "topic",
        title: "Mathematics for Machine Learning",
        description:
          "Linear algebra, matrix decomposition, multivariable calculus, and probability.",
        category: "Data Science",
        difficulty: "Beginner",
        estimatedHours: 25,
        status: "Completed",
        priority: "High",
        positionX: 100,
        positionY: 100,
        metadata: {},
      },
      {
        id: "ml-2",
        type: "topic",
        title: "Classic ML: Scikit-Learn & Feature Engineering",
        description: "Regression, Decision Trees, Random Forests, XGBoost, and cross-validation.",
        category: "Data Science",
        difficulty: "Intermediate",
        estimatedHours: 24,
        status: "In Progress",
        priority: "High",
        positionX: 100,
        positionY: 280,
        metadata: {},
      },
      {
        id: "ml-3",
        type: "topic",
        title: "Deep Learning with PyTorch",
        description: "Backpropagation, Autograd, CNNs for Vision, RNNs & Transformers.",
        category: "Data Science",
        difficulty: "Advanced",
        estimatedHours: 35,
        status: "Not Started",
        priority: "High",
        positionX: 100,
        positionY: 460,
        metadata: {},
      },
      {
        id: "ml-4",
        type: "milestone",
        title: "Milestone: Kaggle Competition Entry",
        description: "Build an end-to-end model pipeline achieving top 15% leaderboard score.",
        category: "Data Science",
        difficulty: "Advanced",
        estimatedHours: 30,
        status: "Not Started",
        priority: "High",
        positionX: 420,
        positionY: 370,
        metadata: { targetDate: "Week 8" },
      },
    ],
    edges: [
      { id: "e-ml-1-2", sourceNodeId: "ml-1", targetNodeId: "ml-2", type: "smoothstep" },
      {
        id: "e-ml-2-3",
        sourceNodeId: "ml-2",
        targetNodeId: "ml-3",
        type: "smoothstep",
        animated: true,
      },
      { id: "e-ml-2-4", sourceNodeId: "ml-2", targetNodeId: "ml-4", type: "smoothstep" },
      { id: "e-ml-3-4", sourceNodeId: "ml-3", targetNodeId: "ml-4", type: "smoothstep" },
    ],
  },
];
