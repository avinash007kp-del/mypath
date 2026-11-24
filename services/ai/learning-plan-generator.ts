import { GenerateLearningPlanInput } from "@/lib/validations/ai";
import { PersonalizedLearningPlanResponse } from "@/types/ai";
import { getLLMProvider } from "./providers/openai";
import { getUserLearningContext } from "./context-builder";

export async function generateLearningPlanService(
  input: GenerateLearningPlanInput
): Promise<PersonalizedLearningPlanResponse> {
  const provider = getLLMProvider();
  const context = await getUserLearningContext();

  const activeRoadmapTitles = context.activeRoadmaps.map((r) => r.title);
  const inProgressTopics = context.inProgressTopics;
  const notStartedTopics = context.notStartedTopics;

  const weeklyHours = input.weeklyHours || 14;
  const dailyTargetHours = Number((weeklyHours / 7).toFixed(1));

  const prompt = `Generate a realistic, high-efficiency weekly learning schedule for a developer.
Weekly Goal: ${weeklyHours} hours total (~${dailyTargetHours} hrs/day)
Active Roadmaps: ${activeRoadmapTitles.length > 0 ? activeRoadmapTitles.join(", ") : "Modern Full-Stack Engineering"}
Topics in progress: ${inProgressTopics.length > 0 ? inProgressTopics.join(", ") : "Core Fundamentals, State Management"}
Ready topics to learn: ${notStartedTopics.length > 0 ? notStartedTopics.join(", ") : "API Design, Testing, CI/CD"}
${input.targetMilestone ? `Target Milestone to Hit: "${input.targetMilestone}"` : ""}

Distribute study sessions across Monday through Sunday. For each day, provide target hours, 1-2 focused topics with an action type ("Deep Dive" | "Hands-on Exercise" | "Review & Flashcards" | "Build Mini-Project"), and an actionable cognitive/productivity tip.`;

  const schemaInstruction = `Schema definition:
{
  "summary": string,
  "weeklyGoalHours": number,
  "weeklyMilestone": string,
  "habitRecommendation": string,
  "dailySchedules": [
    {
      "day": "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
      "targetHours": number,
      "focusTopics": [
        {
          "topicTitle": string,
          "roadmapTitle": string,
          "action": "Deep Dive" | "Hands-on Exercise" | "Review & Flashcards" | "Build Mini-Project",
          "estimatedMinutes": number
        }
      ],
      "practicalTip": string
    }
  ]
}`;

  const fallback = (): PersonalizedLearningPlanResponse => {
    const primaryRoadmap = activeRoadmapTitles[0] || "Full-Stack Web Development";
    const topic1 = inProgressTopics[0] || "Component Architecture & Hooks";
    const topic2 =
      inProgressTopics[1] || notStartedTopics[0] || "Database Schema & Query Optimization";
    const topic3 = notStartedTopics[1] || "API Authentication & Token Rotation";
    const topic4 = notStartedTopics[2] || "Automated Testing with Vitest & Playwright";

    const targetH = Math.round((weeklyHours / 7) * 10) / 10;

    return {
      summary: `Tailored 7-day schedule optimizing your ${weeklyHours} weekly hours across core active roadmaps with deliberate practice and active recall.`,
      weeklyGoalHours: weeklyHours,
      weeklyMilestone:
        input.targetMilestone ||
        `Complete 3 core topics in ${primaryRoadmap} and push a verified code commit.`,
      habitRecommendation:
        "Schedule your study blocks at the exact same hour each day (e.g., 7:00 AM - 8:30 AM) to establish automatic behavioral momentum.",
      dailySchedules: [
        {
          day: "Monday",
          targetHours: targetH,
          focusTopics: [
            {
              topicTitle: topic1,
              roadmapTitle: primaryRoadmap,
              action: "Deep Dive",
              estimatedMinutes: Math.round(targetH * 60),
            },
          ],
          practicalTip:
            "Start your week with high-cognitive theory and mental models before diving into code.",
        },
        {
          day: "Tuesday",
          targetHours: targetH,
          focusTopics: [
            {
              topicTitle: topic1,
              roadmapTitle: primaryRoadmap,
              action: "Hands-on Exercise",
              estimatedMinutes: Math.round(targetH * 60),
            },
          ],
          practicalTip:
            "Write small, focused code snippets from memory without looking at reference solutions.",
        },
        {
          day: "Wednesday",
          targetHours: targetH,
          focusTopics: [
            {
              topicTitle: topic2,
              roadmapTitle: primaryRoadmap,
              action: "Deep Dive",
              estimatedMinutes: Math.round(targetH * 60),
            },
          ],
          practicalTip: "Take concise markdown notes on edge cases and performance trade-offs.",
        },
        {
          day: "Thursday",
          targetHours: targetH,
          focusTopics: [
            {
              topicTitle: topic2,
              roadmapTitle: primaryRoadmap,
              action: "Hands-on Exercise",
              estimatedMinutes: Math.round(targetH * 60),
            },
          ],
          practicalTip:
            "Use the Feynman technique: explain the concept aloud as if teaching a junior developer.",
        },
        {
          day: "Friday",
          targetHours: targetH,
          focusTopics: [
            {
              topicTitle: topic3,
              roadmapTitle: primaryRoadmap,
              action: "Deep Dive",
              estimatedMinutes: Math.round(targetH * 60),
            },
          ],
          practicalTip: "Review security implications and defense-in-depth patterns.",
        },
        {
          day: "Saturday",
          targetHours: Math.max(targetH, 2.5),
          focusTopics: [
            {
              topicTitle: topic4,
              roadmapTitle: primaryRoadmap,
              action: "Build Mini-Project",
              estimatedMinutes: 150,
            },
          ],
          practicalTip:
            "Long focus block: synthesize the week's topics into a tangible GitHub commit.",
        },
        {
          day: "Sunday",
          targetHours: 1,
          focusTopics: [
            {
              topicTitle: "Weekly Synthesis & Active Recall",
              roadmapTitle: primaryRoadmap,
              action: "Review & Flashcards",
              estimatedMinutes: 60,
            },
          ],
          practicalTip: "Review your study logs and celebrate weekly milestone completion.",
        },
      ],
    };
  };

  const response = await provider.generateJSON<PersonalizedLearningPlanResponse>(
    prompt,
    schemaInstruction,
    fallback
  );

  return {
    summary: response.data.summary || "Your customized weekly learning plan",
    weeklyGoalHours: response.data.weeklyGoalHours || weeklyHours,
    weeklyMilestone: response.data.weeklyMilestone || "Complete weekly targets",
    habitRecommendation:
      response.data.habitRecommendation || "Maintain consistency over intensity.",
    dailySchedules: response.data.dailySchedules || fallback().dailySchedules,
  };
}
