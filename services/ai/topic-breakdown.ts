import { BreakdownTopicInput } from "@/lib/validations/ai";
import { TopicBreakdownResponse, SubtaskItem } from "@/types/ai";
import { getLLMProvider } from "./providers/openai";
import { connectToDatabase } from "@/lib/mongodb";
import DailyGoal from "@/models/DailyGoal";
import RoadmapNode from "@/models/RoadmapNode";

export async function breakdownTopicService(
  input: BreakdownTopicInput
): Promise<TopicBreakdownResponse> {
  const provider = getLLMProvider();

  const isDetailed = input.depthLevel?.includes("Detailed");
  const count = isDetailed ? 6 : 4;

  const prompt = `Deconstruct the technical topic "${input.topicTitle}" into ${count} sequential, bite-sized, practical learning subtasks.
Difficulty: ${input.difficulty}

For each subtask, include:
1. Clear technical title
2. Concrete explanation
3. Estimated study/practice time in minutes (between 20 and 60 minutes)
4. A specific hands-on coding or implementation exercise
5. Clear, measurable success criteria
6. 2-3 key technical terms to master`;

  const schemaInstruction = `Schema definition:
{
  "totalEstimatedHours": number,
  "objectives": string[],
  "suggestedPrerequisites": string[],
  "subtasks": [
    {
      "id": string (unique slug e.g. "subtask-1"),
      "title": string,
      "description": string,
      "estimatedMinutes": number,
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "practicalExercise": string,
      "successCriteria": string,
      "keyTerminology": string[]
    }
  ]
}`;

  const fallback = (): Omit<TopicBreakdownResponse, "topicTitle"> => {
    return {
      totalEstimatedHours: 4,
      objectives: [
        `Understand the core mental model and architectural mechanics of ${input.topicTitle}`,
        `Implement a clean, idiomatic code example from scratch`,
        `Apply debugging techniques and handle edge cases or performance bottlenecks`,
        `Synthesize knowledge into a practical mini-project`,
      ],
      suggestedPrerequisites: ["Fundamental Programming Concepts", "Language Syntax & Tooling"],
      subtasks: [
        {
          id: "step-1-mental-model",
          title: "Conceptual Foundations & Mental Model",
          description: `Examine the problem ${input.topicTitle} solves, its underlying abstractions, and how it compares to legacy alternatives.`,
          estimatedMinutes: 30,
          difficulty: "Beginner",
          practicalExercise: `Write a short architectural comparison summary comparing ${input.topicTitle} with standard patterns.`,
          successCriteria:
            "Can clearly articulate the core motivation and lifecycle without looking at documentation.",
          keyTerminology: ["Abstractions", "Lifecycle", "Design Patterns"],
        },
        {
          id: "step-2-implementation",
          title: "Hands-on Implementation & Syntax",
          description: `Construct a minimal, working code demonstration showcasing the primary API or workflow.`,
          estimatedMinutes: 45,
          difficulty: "Intermediate",
          practicalExercise: `Create a standalone module implementing ${input.topicTitle} with proper type definitions and error handling.`,
          successCriteria:
            "Code compiles cleanly and successfully passes a manual validation test run.",
          keyTerminology: ["API Surface", "Type Signatures", "Error Handling"],
        },
        {
          id: "step-3-edge-cases",
          title: "Edge Cases, Error Boundaries & Optimizations",
          description: `Investigate failure modes, asynchronous race conditions, memory leaks, or common anti-patterns.`,
          estimatedMinutes: 40,
          difficulty: "Intermediate",
          practicalExercise: `Write unit tests covering boundary values and simulate unexpected input states.`,
          successCriteria: "All edge-case assertions pass with meaningful error reporting.",
          keyTerminology: ["Edge Cases", "Defensive Programming", "Profiling"],
        },
        {
          id: "step-4-mini-project",
          title: "Synthesis Mini-Project & Production Polish",
          description: `Integrate ${input.topicTitle} into a real-world scenario with clean modular structure and documentation.`,
          estimatedMinutes: 50,
          difficulty: "Advanced",
          practicalExercise: `Build a small utility or feature demonstrating end-to-end functionality ready for code review.`,
          successCriteria:
            "Production-ready implementation with clear README instructions and verified behavior.",
          keyTerminology: ["Integration", "Modular Architecture", "Documentation"],
        },
      ],
    };
  };

  const response = await provider.generateJSON<Omit<TopicBreakdownResponse, "topicTitle">>(
    prompt,
    schemaInstruction,
    fallback
  );

  return {
    topicTitle: input.topicTitle,
    roadmapId: input.roadmapId,
    nodeId: input.nodeId,
    totalEstimatedHours: response.data.totalEstimatedHours || 4,
    objectives: response.data.objectives || [],
    suggestedPrerequisites: response.data.suggestedPrerequisites || [],
    subtasks: response.data.subtasks || [],
  };
}

/**
 * Adds AI breakdown subtasks directly as daily goal tasks for today or a chosen date
 */
export async function addSubtasksToDailyGoals(
  date: string,
  subtasks: SubtaskItem[],
  topicTitle: string,
  roadmapId?: string,
  nodeId?: string
) {
  await connectToDatabase();

  let goal = await DailyGoal.findOne({ date });
  if (!goal) {
    goal = new DailyGoal({
      date,
      targetMinutes: 60,
      completedMinutes: 0,
      tasks: [],
    });
  }

  const newTasks = subtasks.map((st) => ({
    id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: `${topicTitle}: ${st.title}`,
    targetMinutes: st.estimatedMinutes || 30,
    completedMinutes: 0,
    completed: false,
    roadmapId,
    nodeId,
    nodeTitle: topicTitle,
  }));

  goal.tasks.push(...newTasks);
  const totalTargetMinutes = goal.tasks.reduce(
    (acc: number, t: any) => acc + (t.targetMinutes || 30),
    0
  );
  if (totalTargetMinutes > goal.targetMinutes) {
    goal.targetMinutes = totalTargetMinutes;
  }

  await goal.save();
  return goal;
}

/**
 * Updates a roadmap node's metadata with breakdown subtasks
 */
export async function addSubtopicsToRoadmapNode(nodeId: string, subtasks: SubtaskItem[]) {
  await connectToDatabase();

  const node = await RoadmapNode.findById(nodeId);
  if (!node) {
    throw new Error("Roadmap node not found");
  }

  const subtopicTitles = subtasks.map((s) => s.title);
  const existingSubtopics = Array.isArray(node.metadata?.subtopics)
    ? (node.metadata.subtopics as string[])
    : [];

  node.metadata = {
    ...(node.metadata || {}),
    aiBreakdown: subtasks,
    subtopics: Array.from(new Set([...existingSubtopics, ...subtopicTitles])),
  };

  await node.save();
  return node;
}
