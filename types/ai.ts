export type AIMode =
  | "general"
  | "roadmap"
  | "next_topic"
  | "resource"
  | "breakdown"
  | "learning_plan"
  | "explainer"
  | "quiz";

export interface IAIMessage {
  _id?: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    actionType?: string;
    cardType?:
      | "roadmap_preview"
      | "next_topic"
      | "resource_list"
      | "breakdown"
      | "learning_plan"
      | "quiz"
      | "explanation";
    payload?: unknown;
  };
  createdAt?: string;
}

export interface IAIConversation {
  _id: string;
  title: string;
  userId?: string;
  mode: AIMode;
  contextRoadmapId?: string;
  contextNodeId?: string;
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedRoadmapTopic {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  prerequisites: string[];
  subtopics: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  practicalProject?: string;
}

export interface GeneratedRoadmapStage {
  name: string;
  description: string;
  estimatedHours: number;
  topics: GeneratedRoadmapTopic[];
}

export interface GeneratedRoadmapMilestone {
  title: string;
  description: string;
  targetWeek: number;
}

export interface GeneratedRoadmapCapstone {
  title: string;
  description: string;
  deliverables: string[];
}

export interface IGeneratedRoadmap {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: string;
  dailyCommitmentHours: number;
  userGoal: string;
  currentLevel: string;
  learningStyle:
    "Hands-on Projects" | "Deep Conceptual & Theory" | "Fast-paced & Practical" | "Balanced";
  stages: GeneratedRoadmapStage[];
  milestones: GeneratedRoadmapMilestone[];
  capstoneProject?: GeneratedRoadmapCapstone;
  status: "draft" | "converted";
  convertedRoadmapId?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export type RecommendationType = "next_topic" | "quick_win" | "career_critical" | "revision";

export interface IAIRecommendation {
  _id: string;
  type: RecommendationType;
  roadmapId: string;
  roadmapTitle?: string;
  nodeId: string;
  topicTitle: string;
  score: number;
  rationale: string;
  estimatedMinutes: number;
  prerequisitesMet: boolean;
  unmetPrerequisites?: string[];
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  status: "active" | "accepted" | "dismissed";
  userId?: string;
  createdAt: string;
}

export interface IAIUsage {
  _id: string;
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  success: boolean;
  errorMessage?: string;
  userId?: string;
  createdAt: string;
}

// Next Topic Recommendation DTO
export interface NextTopicItem {
  type: RecommendationType;
  roadmapId: string;
  roadmapTitle: string;
  nodeId: string;
  topicTitle: string;
  priorityScore: number;
  rationale: string;
  estimatedMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  prerequisitesMet: boolean;
  unmetPrerequisites?: string[];
  tags?: string[];
}

export interface NextTopicResponse {
  summary: string;
  activeRoadmapsAnalyzed: number;
  completedTopicsCount: number;
  recommendations: NextTopicItem[];
}

// Resource Finder DTO
export interface AIResourceItem {
  title: string;
  url: string;
  domain: string;
  type:
    | "Official Doc"
    | "Course"
    | "Interactive Tutorial"
    | "Video"
    | "Article"
    | "Book"
    | "Cheatsheet"
    | "Project Repo";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration?: string;
  description: string;
  free: boolean;
  authorOrPlatform: string;
  isVerified: boolean;
}

export interface ResourceSuggestionResponse {
  topicTitle: string;
  category?: string;
  summary: string;
  resources: AIResourceItem[];
}

// Topic Breakdown DTO
export interface SubtaskItem {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  practicalExercise: string;
  successCriteria: string;
  keyTerminology: string[];
}

export interface TopicBreakdownResponse {
  topicTitle: string;
  totalEstimatedHours: number;
  objectives: string[];
  subtasks: SubtaskItem[];
  suggestedPrerequisites: string[];
  roadmapId?: string;
  nodeId?: string;
}

// Personalized Learning Plan DTO
export interface DailyLearningPlanItem {
  day: string;
  targetHours: number;
  focusTopics: Array<{
    topicTitle: string;
    roadmapTitle: string;
    roadmapId?: string;
    nodeId?: string;
    action: "Deep Dive" | "Hands-on Exercise" | "Review & Flashcards" | "Build Mini-Project";
    estimatedMinutes: number;
  }>;
  practicalTip: string;
}

export interface PersonalizedLearningPlanResponse {
  summary: string;
  weeklyGoalHours: number;
  weeklyMilestone: string;
  dailySchedules: DailyLearningPlanItem[];
  habitRecommendation: string;
}

// Topic Explanation DTO
export interface TopicExplanationResponse {
  topicTitle: string;
  summary: string;
  keyConcepts: string[];
  codeExamples?: Array<{
    language: string;
    title: string;
    code: string;
    explanation: string;
  }>;
  analogies: string[];
  commonPitfalls: string[];
  interviewQuestions: Array<{
    question: string;
    answer: string;
  }>;
}

// Practice Quiz DTO
export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface QuizResponse {
  topicTitle: string;
  questions: QuizQuestionItem[];
}
