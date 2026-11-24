import { GenerateQuizInput } from "@/lib/validations/ai";
import { QuizResponse } from "@/types/ai";
import { getLLMProvider } from "./providers/openai";

export async function generateQuizService(input: GenerateQuizInput): Promise<QuizResponse> {
  const provider = getLLMProvider();
  const count = input.questionCount || 4;

  const prompt = `Generate an interactive ${count}-question technical multiple choice quiz on the topic: "${input.topicTitle}".
Difficulty: ${input.difficulty}

For each question:
1. Provide a clear, real-world engineering question testing practical comprehension, not superficial trivia.
2. Provide exactly 4 options.
3. Indicate the zero-based index of the correct option (0, 1, 2, or 3).
4. Provide a thorough technical explanation of why the correct option is right and why the other options are incorrect.`;

  const schemaInstruction = `Schema definition:
{
  "questions": [
    {
      "id": string (unique slug e.g. "q1"),
      "question": string,
      "options": string[] (length 4),
      "correctOptionIndex": number (0 to 3),
      "explanation": string,
      "difficulty": "Beginner" | "Intermediate" | "Advanced"
    }
  ]
}`;

  const fallback = (): QuizResponse => {
    return {
      topicTitle: input.topicTitle,
      questions: [
        {
          id: "q1",
          question: `What is the primary design motivation behind ${input.topicTitle}?`,
          options: [
            "To increase bundle size and maximize server memory utilization",
            "To isolate concerns, improve maintainability, and handle asynchronous state predictably",
            "To replace all imperative programming with pure functional recursion",
            "To bypass standard HTTP status codes in client-server communication",
          ],
          correctOptionIndex: 1,
          explanation: `The core motivation is isolating concerns and structuring code predictably, allowing systems to scale while preventing runtime regression and state desynchronization.`,
          difficulty: input.difficulty,
        },
        {
          id: "q2",
          question: `Which of the following is considered an anti-pattern when working with ${input.topicTitle}?`,
          options: [
            "Encapsulating side-effects inside managed handlers or hooks",
            "Validating external runtime input with schema validation",
            "Mutating shared global state directly across asynchronous boundaries",
            "Adding automated unit tests for edge-case boundaries",
          ],
          correctOptionIndex: 2,
          explanation: `Mutating shared state directly creates race conditions and unpredictable side effects that are notoriously difficult to debug in concurrent systems.`,
          difficulty: input.difficulty,
        },
        {
          id: "q3",
          question: `When deploying code utilizing ${input.topicTitle} to production, what is the best practice for error handling?`,
          options: [
            "Catch errors silently and suppress all log output",
            "Implement defensive boundaries, structured logging, and user-facing fallback states",
            "Allow unhandled rejections to terminate the parent process",
            "Hardcode mock data directly inside the API consumer",
          ],
          correctOptionIndex: 1,
          explanation: `Production systems require resilience: structured telemetry to diagnose root causes paired with friendly fallback interfaces so users aren't left with broken screens.`,
          difficulty: input.difficulty,
        },
        {
          id: "q4",
          question: `How does ${input.topicTitle} typically optimize runtime performance?`,
          options: [
            "By re-rendering and querying the database on every microtask",
            "By memorizing heavy computations and batching atomic state updates",
            "By converting all relational queries into unindexed full table scans",
            "By disabling HTTP/2 multiplexing across network sockets",
          ],
          correctOptionIndex: 1,
          explanation: `Modern architectures minimize redundant execution by caching idempotent results and batching mutations together.`,
          difficulty: input.difficulty,
        },
      ],
    };
  };

  const response = await provider.generateJSON<QuizResponse>(prompt, schemaInstruction, fallback);

  return {
    topicTitle: input.topicTitle,
    questions: response.data.questions || fallback().questions,
  };
}
