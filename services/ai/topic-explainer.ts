import { ExplainTopicInput } from "@/lib/validations/ai";
import { TopicExplanationResponse } from "@/types/ai";
import { getLLMProvider } from "./providers/openai";

export async function explainTopicService(
  input: ExplainTopicInput
): Promise<TopicExplanationResponse> {
  const provider = getLLMProvider();

  const prompt = `Provide an expert engineering explanation of the topic: "${input.topicTitle}".
Target Audience Difficulty: ${input.difficulty}
${input.context ? `Additional Context: ${input.context}` : ""}

Break down:
1. Executive technical summary (2-3 paragraphs)
2. 3-5 core principles / mental models
3. Concrete, clean, syntax-highlighted code example with explanation
4. 2 intuitive real-world analogies
5. 3 common pitfalls or beginner traps to avoid
6. 2 senior-level interview questions and concise model answers`;

  const schemaInstruction = `Schema definition:
{
  "summary": string,
  "keyConcepts": string[],
  "codeExamples": [
    {
      "language": string,
      "title": string,
      "code": string,
      "explanation": string
    }
  ],
  "analogies": string[],
  "commonPitfalls": string[],
  "interviewQuestions": [
    {
      "question": string,
      "answer": string
    }
  ]
}`;

  const fallback = (): Omit<TopicExplanationResponse, "topicTitle"> => {
    return {
      summary: `${input.topicTitle} is a foundational concept in modern software engineering. It provides abstractions that allow developers to write decoupled, maintainable, and high-performance code by managing complexity and standardizing behavioral lifecycles.`,
      keyConcepts: [
        "Encapsulation & Single Responsibility: Isolating logic into predictable boundaries.",
        "Deterministic Execution: Ensuring idempotent behavior across runtime environments.",
        "Composable Interfaces: Designing contracts that integrate smoothly with neighboring systems.",
        "Asynchronous Coordination: Managing non-blocking operations without resource contention.",
      ],
      codeExamples: [
        {
          language: "typescript",
          title: `Idiomatic implementation of ${input.topicTitle}`,
          code: `// Production implementation demonstrating ${input.topicTitle}
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function executeOperation<T>(
  action: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (err: any) {
    console.error("Execution failure:", err);
    return { success: false, error: err?.message || "Unknown error occurred" };
  }
}`,
          explanation:
            "Demonstrates defensive handling, type-safe error boundaries, and standard return types.",
        },
      ],
      analogies: [
        `Like an electrical circuit breaker: It intercepts unpredictable spikes before they cascade through your entire system.`,
        `Like a restaurant expediter: It coordinates between the front-of-house (UI/Client) and the kitchen (Data/Backend) so neither is overwhelmed.`,
      ],
      commonPitfalls: [
        "Premature Optimization: Adding unnecessary caching or complexity before identifying verified bottlenecks.",
        "Ignoring Error Boundaries: Assuming network calls or asynchronous promises will always succeed without fallback states.",
        "Tightly Coupled State: Sharing mutable global state across unrelated components.",
      ],
      interviewQuestions: [
        {
          question: `How does ${input.topicTitle} impact system scalability and maintainability?`,
          answer: `It decouples the caller from the underlying implementation details, enabling independent horizontal scaling, easier unit test mocking, and safe refactoring without breaking API contracts.`,
        },
        {
          question: `What are the trade-offs between this pattern and simpler alternatives?`,
          answer: `While it introduces a slight initial layer of boilerplate or mental overhead, it significantly prevents race conditions, simplifies debugging in production, and standardizes team conventions.`,
        },
      ],
    };
  };

  const response = await provider.generateJSON<Omit<TopicExplanationResponse, "topicTitle">>(
    prompt,
    schemaInstruction,
    fallback
  );

  return {
    topicTitle: input.topicTitle,
    summary: response.data.summary || "",
    keyConcepts: response.data.keyConcepts || [],
    codeExamples: response.data.codeExamples || [],
    analogies: response.data.analogies || [],
    commonPitfalls: response.data.commonPitfalls || [],
    interviewQuestions: response.data.interviewQuestions || [],
  };
}
