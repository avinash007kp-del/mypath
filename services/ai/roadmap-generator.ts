import { getLLMProvider } from "./providers/openai";
import { GenerateRoadmapInput } from "@/lib/validations/ai";
import GeneratedRoadmap from "@/models/GeneratedRoadmap";
import Roadmap from "@/models/Roadmap";
import RoadmapNode from "@/models/RoadmapNode";
import RoadmapEdge from "@/models/RoadmapEdge";
import RoadmapViewport from "@/models/RoadmapViewport";
import { IGeneratedRoadmap, GeneratedRoadmapStage } from "@/types/ai";
import { connectToDatabase } from "@/lib/mongodb";

export async function generateRoadmapService(
  input: GenerateRoadmapInput,
  userId?: string
): Promise<{ roadmap: IGeneratedRoadmap; isFallback: boolean }> {
  await connectToDatabase();
  const provider = getLLMProvider();

  const prompt = `Design a comprehensive, realistic, high-impact learning roadmap for a student aiming to achieve this career goal:
Goal: "${input.careerGoal}"
Current Level: ${input.currentLevel}
Daily Study Commitment: ${input.dailyHours} hours/day
Target Duration: ${input.targetDuration}
Learning Style: ${input.learningStyle}
${input.existingKnowledge ? `Prior Experience: ${input.existingKnowledge}` : ""}
${input.focusAreas ? `Special Focus Areas: ${input.focusAreas}` : ""}

Provide a multi-stage curriculum with 3 to 5 progressive stages. Each stage must contain 3 to 6 essential topics with realistic estimated study hours, explicit prerequisite topic IDs, subtopics, and hands-on mini-projects.
Include 3-4 progressive milestones and 1 capstone project.`;

  const schemaInstruction = `Schema definition:
{
  "title": string,
  "description": string,
  "category": "Web Development" | "AI & Machine Learning" | "Data Science" | "Computer Science" | "Mobile Development" | "Other",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedDuration": string,
  "stages": [
    {
      "name": string,
      "description": string,
      "estimatedHours": number,
      "topics": [
        {
          "id": string (unique slug e.g. "stage1-topic1"),
          "title": string,
          "description": string,
          "estimatedHours": number,
          "prerequisites": string[] (ids of prerequisites),
          "subtopics": string[],
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "practicalProject": string
        }
      ]
    }
  ],
  "milestones": [
    {
      "title": string,
      "description": string,
      "targetWeek": number
    }
  ],
  "capstoneProject": {
    "title": string,
    "description": string,
    "deliverables": string[]
  }
}`;

  const fallback = (): any => {
    const isAi =
      input.careerGoal.toLowerCase().includes("ai") ||
      input.careerGoal.toLowerCase().includes("machine learning");
    const isWeb = !isAi;

    if (isWeb) {
      return {
        title: `${input.careerGoal} Mastery Roadmap`,
        description: `A systematic curriculum engineered to take you from ${input.currentLevel} to professional mastery as a ${input.careerGoal}.`,
        category: "Web Development",
        difficulty: input.currentLevel.includes("Beginner") ? "Beginner" : "Intermediate",
        estimatedDuration: input.targetDuration,
        stages: [
          {
            name: "Stage 1: Core Foundations & Modern Architecture",
            description:
              "Master modern TypeScript, component lifecycles, and state management principles.",
            estimatedHours: 25,
            topics: [
              {
                id: "ts-deep-dive",
                title: "Advanced TypeScript & Type Safety",
                description:
                  "Generics, utility types, discriminating unions, and strict compiler configurations.",
                estimatedHours: 8,
                prerequisites: [],
                subtopics: ["Generics", "Conditional Types", "Type Narrowing", "Zod Validation"],
                difficulty: "Intermediate",
                practicalProject: "Type-safe runtime API validator",
              },
              {
                id: "react-internals",
                title: "React 18 Architecture & Concurrent Rendering",
                description:
                  "Fiber reconciliation, server components, suspense boundaries, and custom hooks.",
                estimatedHours: 10,
                prerequisites: ["ts-deep-dive"],
                subtopics: [
                  "Fiber Architecture",
                  "Server Actions",
                  "Suspense & Transitions",
                  "Custom Hooks",
                ],
                difficulty: "Intermediate",
                practicalProject: "Virtual list & high-performance data grid",
              },
              {
                id: "nextjs-app-router",
                title: "Next.js App Router & Server Components",
                description:
                  "Streaming SSR, route handlers, middleware, layouts, and server action mutations.",
                estimatedHours: 7,
                prerequisites: ["react-internals"],
                subtopics: [
                  "RSC vs Client Components",
                  "Route Segments",
                  "Caching Strategies",
                  "Interceptors",
                ],
                difficulty: "Intermediate",
                practicalProject: "Dynamic multi-tenant SaaS dashboard",
              },
            ],
          },
          {
            name: "Stage 2: Backend Architecture & Database Design",
            description:
              "Scalable APIs, relational and NoSQL modeling, indexing, and high-concurrency patterns.",
            estimatedHours: 35,
            topics: [
              {
                id: "db-modeling",
                title: "PostgreSQL & MongoDB Schema Architecture",
                description:
                  "Relational normalization, B-tree indexes, aggregation pipelines, and transaction isolation.",
                estimatedHours: 12,
                prerequisites: ["ts-deep-dive"],
                subtopics: [
                  "Compound Indexes",
                  "Aggregation Pipelines",
                  "ACID Transactions",
                  "Connection Pooling",
                ],
                difficulty: "Intermediate",
                practicalProject: "Event log analytics pipeline with compound indexes",
              },
              {
                id: "api-security",
                title: "Auth, RBAC & API Security Hardening",
                description:
                  "JWTs with refresh rotation, CSRF protection, rate limiting, and zero-trust auth.",
                estimatedHours: 10,
                prerequisites: ["nextjs-app-router", "db-modeling"],
                subtopics: [
                  "OAuth 2.0 / OIDC",
                  "Role-Based Access Control",
                  "Token Rotation",
                  "Rate Limiting",
                ],
                difficulty: "Advanced",
                practicalProject: "Enterprise OAuth2 and multi-session auth service",
              },
              {
                id: "system-design",
                title: "Caching, Queues & Distributed Systems",
                description:
                  "Redis pub/sub, BullMQ background queues, webhooks, and asynchronous workers.",
                estimatedHours: 13,
                prerequisites: ["api-security"],
                subtopics: [
                  "Redis Caching",
                  "BullMQ Asynchronous Jobs",
                  "Webhooks",
                  "Circuit Breakers",
                ],
                difficulty: "Advanced",
                practicalProject:
                  "Asynchronous task queue with automated retries and dead-letter queues",
              },
            ],
          },
          {
            name: "Stage 3: Cloud Infrastructure & Production Readiness",
            description: "Containerization, CI/CD pipelines, automated testing, and observability.",
            estimatedHours: 25,
            topics: [
              {
                id: "docker-k8s",
                title: "Docker Containerization & Kubernetes Basics",
                description:
                  "Multi-stage Docker builds, image minimization, container orchestration, and health checks.",
                estimatedHours: 10,
                prerequisites: ["system-design"],
                subtopics: [
                  "Multi-stage Dockerfiles",
                  "Compose Networks",
                  "Kubernetes Pods & Services",
                  "Ingress",
                ],
                difficulty: "Intermediate",
                practicalProject: "Production Docker image under 80MB with non-root security",
              },
              {
                id: "observability",
                title: "Monitoring, Structured Logging & OpenTelemetry",
                description:
                  "Distributed tracing, Prometheus metrics, structured JSON logging, and error tracking.",
                estimatedHours: 8,
                prerequisites: ["docker-k8s"],
                subtopics: [
                  "Distributed Tracing",
                  "OpenTelemetry",
                  "Grafana Dashboards",
                  "Alerting Policies",
                ],
                difficulty: "Advanced",
                practicalProject: "End-to-end tracing across Next.js and backend microservices",
              },
              {
                id: "testing-mastery",
                title: "Integration & End-to-End Testing Pipeline",
                description:
                  "Vitest, Playwright automated testing, mock service workers, and GitHub Actions CI.",
                estimatedHours: 7,
                prerequisites: ["docker-k8s"],
                subtopics: [
                  "Vitest Unit Tests",
                  "Playwright E2E",
                  "Mock Service Worker",
                  "CI Automation",
                ],
                difficulty: "Intermediate",
                practicalProject: "Continuous testing workflow running on every pull request",
              },
            ],
          },
        ],
        milestones: [
          {
            title: "Foundation Checkpoint: Type-Safe Full-Stack App",
            description: "Deploy a Next.js app with strict types and database connection.",
            targetWeek: 4,
          },
          {
            title: "Architecture Checkpoint: Scalable API & Background Jobs",
            description: "Implement worker queues, caching, and secure token rotation.",
            targetWeek: 8,
          },
          {
            title: "Production Checkpoint: Automated CI/CD & Tracing",
            description: "Containerized deployment with 90%+ test coverage and observability.",
            targetWeek: 12,
          },
        ],
        capstoneProject: {
          title: "Production Distributed SaaS Platform",
          description:
            "An end-to-end multi-tenant platform featuring authentication, background billing processing, real-time telemetry, and containerized deployment.",
          deliverables: [
            "Next.js App Router front-end with server actions",
            "PostgreSQL/MongoDB database with indexed schema",
            "Redis queue for asynchronous notifications",
            "Automated Playwright test suite in GitHub Actions",
          ],
        },
      };
    } else {
      return {
        title: `${input.careerGoal} Engineering Roadmap`,
        description: `Comprehensive AI engineering curriculum covering math foundations, machine learning algorithms, deep learning, and LLM application engineering.`,
        category: "AI & Machine Learning",
        difficulty: "Intermediate",
        estimatedDuration: input.targetDuration,
        stages: [
          {
            name: "Stage 1: Mathematical Foundations & Python Scientific Stack",
            description:
              "Linear algebra, multivariable calculus, probability, NumPy, and Pandas vectorized computation.",
            estimatedHours: 30,
            topics: [
              {
                id: "linear-algebra-ml",
                title: "Linear Algebra & Matrix Decompositions",
                description:
                  "Eigenvalues, eigenvectors, SVD, dot products, and vector spaces for ML.",
                estimatedHours: 10,
                prerequisites: [],
                subtopics: ["Matrix Operations", "Eigenvalues & Eigenvectors", "SVD", "Tensors"],
                difficulty: "Intermediate",
                practicalProject: "PCA image dimensionality reducer from scratch",
              },
              {
                id: "numpy-pandas-mastery",
                title: "Vectorized Computing with NumPy & Pandas",
                description:
                  "Broadcasting, memory layout, indexing, aggregation, and time series handling.",
                estimatedHours: 10,
                prerequisites: ["linear-algebra-ml"],
                subtopics: [
                  "Broadcasting Rules",
                  "Memory Contiguity",
                  "Data Cleaning",
                  "Feature Engineering",
                ],
                difficulty: "Beginner",
                practicalProject: "Feature engineering pipeline on 1M row dataset",
              },
              {
                id: "classical-ml",
                title: "Classical Machine Learning Algorithms",
                description:
                  "Supervised and unsupervised models: Linear/Logistic Regression, Random Forests, XGBoost, KMeans.",
                estimatedHours: 10,
                prerequisites: ["numpy-pandas-mastery"],
                subtopics: [
                  "Cross Validation",
                  "Hyperparameter Tuning",
                  "XGBoost",
                  "Confusion Matrices",
                ],
                difficulty: "Intermediate",
                practicalProject:
                  "Predictive model with cross-validation and feature importance analysis",
              },
            ],
          },
          {
            name: "Stage 2: Deep Learning & Neural Architectures",
            description:
              "PyTorch fundamentals, backpropagation, CNNs, RNNs, and Attention mechanisms.",
            estimatedHours: 40,
            topics: [
              {
                id: "pytorch-fundamentals",
                title: "PyTorch Tensors, Autograd & Custom Training Loops",
                description:
                  "GPU acceleration, computation graphs, loss functions, optimizers, and DataLoader pipelines.",
                estimatedHours: 12,
                prerequisites: ["classical-ml"],
                subtopics: [
                  "Autograd Graphs",
                  "Custom Dataset/DataLoader",
                  "CUDA Acceleration",
                  "Checkpoints",
                ],
                difficulty: "Intermediate",
                practicalProject: "Custom multi-layer neural network trained on CIFAR-10",
              },
              {
                id: "transformer-architecture",
                title: "Attention Mechanisms & Transformer Architecture",
                description:
                  "Self-attention, multi-head attention, positional encoding, encoder-decoder, and BERT/GPT architectures.",
                estimatedHours: 15,
                prerequisites: ["pytorch-fundamentals"],
                subtopics: [
                  "Scaled Dot-Product",
                  "Multi-Head Attention",
                  "RoPE Positional Embeddings",
                  "KV Cache",
                ],
                difficulty: "Advanced",
                practicalProject: "Mini-GPT language model trained on Shakespeare corpus",
              },
              {
                id: "fine-tuning-lora",
                title: "Parameter-Efficient Fine-Tuning (PEFT & LoRA)",
                description:
                  "Quantization (QLoRA), low-rank adaptation, instruction tuning, and Hugging Face ecosystem.",
                estimatedHours: 13,
                prerequisites: ["transformer-architecture"],
                subtopics: [
                  "LoRA Rank Matrices",
                  "BitsAndBytes 4-bit Quantization",
                  "Instruction Tuning",
                  "Evaluation",
                ],
                difficulty: "Advanced",
                practicalProject: "Fine-tuned Llama model on custom technical documentation",
              },
            ],
          },
          {
            name: "Stage 3: LLM Systems, RAG & Production Agent Architecture",
            description:
              "Vector databases, chunking strategies, semantic search, evaluation, and autonomous tool-calling agents.",
            estimatedHours: 35,
            topics: [
              {
                id: "vector-dbs-embeddings",
                title: "Vector Embeddings & Hybrid Search Systems",
                description:
                  "Embedding models, cosine similarity, HNSW indexing, chunking strategies, and BM25 hybrid search.",
                estimatedHours: 10,
                prerequisites: ["transformer-architecture"],
                subtopics: [
                  "HNSW Graphs",
                  "Hierarchical Chunking",
                  "Re-ranking Models",
                  "Metadata Filtering",
                ],
                difficulty: "Intermediate",
                practicalProject:
                  "High-accuracy code search engine with hybrid BM25 + dense vector retrieval",
              },
              {
                id: "rag-eval-ragas",
                title: "Advanced RAG Pipelines & Evaluation (Ragas)",
                description:
                  "Query transformations, hallucination mitigation, context precision, and automated eval benchmarks.",
                estimatedHours: 12,
                prerequisites: ["vector-dbs-embeddings"],
                subtopics: [
                  "Multi-Query Expansion",
                  "Self-RAG",
                  "Faithfulness Metrics",
                  "Synthetic Evals",
                ],
                difficulty: "Advanced",
                practicalProject:
                  "Production RAG assistant with synthetic test dataset and Ragas benchmark score >0.85",
              },
              {
                id: "agentic-ai-mcp",
                title: "Agentic Workflows & Model Context Protocol (MCP)",
                description:
                  "Tool calling, multi-agent collaboration, state machines, LangGraph, and safe execution sandboxes.",
                estimatedHours: 13,
                prerequisites: ["rag-eval-ragas"],
                subtopics: [
                  "Function Calling",
                  "ReAct Framework",
                  "Model Context Protocol",
                  "Loop Safeguards",
                ],
                difficulty: "Advanced",
                practicalProject:
                  "Autonomous code refactoring agent with automated linting and verification",
              },
            ],
          },
        ],
        milestones: [
          {
            title: "ML Foundation Checkpoint",
            description: "Build and evaluate an end-to-end predictive pipeline.",
            targetWeek: 4,
          },
          {
            title: "Deep Learning Checkpoint",
            description: "Train a custom neural network and fine-tune an open-source LLM.",
            targetWeek: 8,
          },
          {
            title: "AI Systems Checkpoint",
            description: "Deploy an agentic RAG application with evaluation telemetry.",
            targetWeek: 12,
          },
        ],
        capstoneProject: {
          title: "Enterprise Autonomous Technical Agent",
          description:
            "An intelligent agent capable of indexing large codebases, answering complex architectural queries, proposing code changes, and running verification suites.",
          deliverables: [
            "Hybrid vector database indexing engine",
            "Multi-agent reasoning workflow with MCP tool integration",
            "Automated benchmark evaluation report",
          ],
        },
      };
    }
  };

  const response = await provider.generateJSON<any>(prompt, schemaInstruction, fallback);

  const rawData = response.data;

  // Persist generated roadmap to MongoDB
  const generatedDoc = await GeneratedRoadmap.create({
    title: rawData.title || `${input.careerGoal} Roadmap`,
    description: rawData.description || `Generated learning roadmap for ${input.careerGoal}`,
    category: rawData.category || input.preferredCategory || "Web Development",
    difficulty: rawData.difficulty || "Intermediate",
    estimatedDuration: rawData.estimatedDuration || input.targetDuration,
    dailyCommitmentHours: input.dailyHours,
    userGoal: input.careerGoal,
    currentLevel: input.currentLevel,
    learningStyle: input.learningStyle,
    stages: rawData.stages || [],
    milestones: rawData.milestones || [],
    capstoneProject: rawData.capstoneProject,
    status: "draft",
    userId,
  });

  return {
    roadmap: {
      _id: generatedDoc._id.toString(),
      title: generatedDoc.title,
      description: generatedDoc.description,
      category: generatedDoc.category,
      difficulty: generatedDoc.difficulty,
      estimatedDuration: generatedDoc.estimatedDuration,
      dailyCommitmentHours: generatedDoc.dailyCommitmentHours,
      userGoal: generatedDoc.userGoal,
      currentLevel: generatedDoc.currentLevel,
      learningStyle: generatedDoc.learningStyle as any,
      stages: generatedDoc.stages,
      milestones: generatedDoc.milestones,
      capstoneProject: generatedDoc.capstoneProject,
      status: generatedDoc.status,
      createdAt: generatedDoc.createdAt.toISOString(),
      updatedAt: generatedDoc.updatedAt.toISOString(),
    },
    isFallback: response.isFallback,
  };
}

/**
 * Converts a GeneratedRoadmap into full visual Roadmap, RoadmapNodes, and RoadmapEdges
 * so the user can immediately open it in the React Flow Visual Editor!
 */
export async function convertGeneratedRoadmapToVisualRoadmap(
  generatedRoadmapId: string,
  customTitle?: string
): Promise<{ roadmapId: string }> {
  await connectToDatabase();

  const generated = await GeneratedRoadmap.findById(generatedRoadmapId);
  if (!generated) {
    throw new Error("Generated roadmap not found.");
  }

  // Count total topics
  let totalTopics = 0;
  for (const stage of generated.stages) {
    totalTopics += stage.topics?.length || 0;
  }

  // Create main Roadmap
  const newRoadmap = await Roadmap.create({
    title: customTitle || generated.title,
    description: generated.description,
    category: generated.category,
    difficulty: generated.difficulty,
    estimatedDuration: generated.estimatedDuration,
    icon: generated.category.includes("AI") ? "🤖" : "🚀",
    tags: [generated.category, generated.difficulty, "AI-Generated"],
    totalTopics,
    completedTopics: 0,
    progress: 0,
  });

  const roadmapId = newRoadmap._id.toString();

  // Create default viewport
  await RoadmapViewport.create({
    roadmapId,
    x: 100,
    y: 80,
    zoom: 0.9,
  });

  // Layout parameters for React Flow canvas
  const STAGE_SPACING_Y = 280;
  const TOPIC_SPACING_X = 260;
  const TOPIC_ROW_OFFSET_Y = 110;

  const topicIdToCreatedNodeId = new Map<string, string>();
  let currentY = 60;
  let previousStageRootNodeId: string | null = null;

  for (let sIndex = 0; sIndex < generated.stages.length; sIndex++) {
    const stage = generated.stages[sIndex];

    // Create stage header node
    const stageNode = await RoadmapNode.create({
      roadmapId,
      type: "custom",
      title: stage.name,
      description: stage.description,
      category: generated.category,
      difficulty: generated.difficulty,
      estimatedHours: stage.estimatedHours || 20,
      status: sIndex === 0 ? "In Progress" : "Not Started",
      priority: "High",
      positionX: 300,
      positionY: currentY,
      metadata: {
        isStageHeader: true,
        stageIndex: sIndex + 1,
        color: "#4E9F3D",
      },
    });

    const stageNodeId = stageNode._id.toString();

    // Link previous stage to this stage with an edge
    if (previousStageRootNodeId) {
      await RoadmapEdge.create({
        roadmapId,
        sourceNodeId: previousStageRootNodeId,
        targetNodeId: stageNodeId,
        type: "smoothstep",
        label: `Next Stage`,
        animated: true,
      });
    }

    previousStageRootNodeId = stageNodeId;

    // Create topics under this stage
    const topics = stage.topics || [];
    const topicStartX = 300 - ((topics.length - 1) * TOPIC_SPACING_X) / 2;

    for (let tIndex = 0; tIndex < topics.length; tIndex++) {
      const topic = topics[tIndex];
      const topicX = topicStartX + tIndex * TOPIC_SPACING_X;
      const topicY = currentY + TOPIC_ROW_OFFSET_Y;

      const topicNode = await RoadmapNode.create({
        roadmapId,
        type: "custom",
        title: topic.title,
        description: topic.description,
        category: generated.category,
        difficulty: topic.difficulty || "Intermediate",
        estimatedHours: topic.estimatedHours || 4,
        status: "Not Started",
        priority: "Medium",
        positionX: topicX,
        positionY: topicY,
        metadata: {
          subtopics: topic.subtopics || [],
          practicalProject: topic.practicalProject,
          stageName: stage.name,
        },
      });

      const topicNodeId = topicNode._id.toString();
      topicIdToCreatedNodeId.set(topic.id, topicNodeId);

      // Connect stage node to each child topic
      await RoadmapEdge.create({
        roadmapId,
        sourceNodeId: stageNodeId,
        targetNodeId: topicNodeId,
        type: "smoothstep",
        animated: false,
      });
    }

    // Advance Y coordinate for the next stage
    currentY += STAGE_SPACING_Y;
  }

  // Connect explicit topic prerequisites where defined
  for (const stage of generated.stages) {
    for (const topic of stage.topics || []) {
      const targetId = topicIdToCreatedNodeId.get(topic.id);
      if (!targetId) continue;

      for (const prereqId of topic.prerequisites || []) {
        const sourceId = topicIdToCreatedNodeId.get(prereqId);
        if (sourceId && sourceId !== targetId) {
          // Avoid duplicate edges
          const existingEdge = await RoadmapEdge.findOne({
            roadmapId,
            sourceNodeId: sourceId,
            targetNodeId: targetId,
          });

          if (!existingEdge) {
            await RoadmapEdge.create({
              roadmapId,
              sourceNodeId: sourceId,
              targetNodeId: targetId,
              type: "smoothstep",
              label: "Prerequisite",
              animated: false,
            });
          }
        }
      }
    }
  }

  // Update generated roadmap status
  generated.status = "converted";
  generated.convertedRoadmapId = roadmapId;
  await generated.save();

  return { roadmapId };
}
