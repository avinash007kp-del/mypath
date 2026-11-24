import OpenAI from "openai";
import { ILLMProvider, LLMOptions, LLMResponse, LLMJSONResponse } from "./provider-interface";
import { connectToDatabase } from "@/lib/mongodb";
import AIUsage from "@/models/AIUsage";

export class OpenAIProvider implements ILLMProvider {
  public name = "OpenAI";
  private client: OpenAI | null = null;
  private defaultModel: string;
  private maxTokens: number;

  constructor() {
    this.defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS || "2500", 10);

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey && apiKey.length > 0 && !apiKey.startsWith("your_")) {
      this.client = new OpenAI({ apiKey });
    }
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  private async recordUsage(
    endpoint: string,
    model: string,
    promptTokens: number,
    completionTokens: number,
    success: boolean,
    errorMessage?: string
  ) {
    try {
      await connectToDatabase();
      // Estimated cost calculation ($0.150 per 1M input, $0.600 per 1M output for gpt-4o-mini)
      const inputCost = (promptTokens / 1_000_000) * 0.15;
      const outputCost = (completionTokens / 1_000_000) * 0.6;
      const estimatedCost = Number((inputCost + outputCost).toFixed(6));

      await AIUsage.create({
        endpoint,
        model,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost,
        success,
        errorMessage,
      });
    } catch (err) {
      console.warn("Failed to record AI usage log:", err);
    }
  }

  public async generateText(prompt: string, options: LLMOptions = {}): Promise<LLMResponse> {
    const model = options.model || this.defaultModel;
    const systemPrompt =
      options.systemPrompt ||
      "You are MyPath AI, an expert software architect, engineering mentor, and personalized learning guide.";

    if (!this.client) {
      console.info("OpenAI API key not configured. Using fallback text generation.");
      return {
        content: `I'm your MyPath Learning Assistant. Note: Set OPENAI_API_KEY in .env.local to enable live model inference. Here is your plan:\n\n${prompt}`,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        model: "heuristic-fallback",
        isFallback: true,
      };
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? this.maxTokens,
      });

      const messageContent = response.choices[0]?.message?.content || "";
      const promptTokens = response.usage?.prompt_tokens || 0;
      const completionTokens = response.usage?.completion_tokens || 0;

      this.recordUsage("generateText", model, promptTokens, completionTokens, true);

      return {
        content: messageContent,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        model,
        isFallback: false,
      };
    } catch (error: any) {
      console.error("OpenAI text generation error:", error?.message || error);
      this.recordUsage("generateText", model, 0, 0, false, error?.message);

      return {
        content: `[Notice: Live OpenAI request encountered an issue: ${error?.message || "Connection failed"}. Using offline guidance mode.]\n\nBased on your query: Let's focus on structured fundamentals, active coding practice, and sequential roadmap milestones.`,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        model: "heuristic-fallback",
        isFallback: true,
      };
    }
  }

  public async generateJSON<T>(
    prompt: string,
    schemaInstruction: string,
    fallbackGenerator: () => T,
    options: LLMOptions = {}
  ): Promise<LLMJSONResponse<T>> {
    const model = options.model || this.defaultModel;
    const systemPrompt = `${
      options.systemPrompt ||
      "You are MyPath AI, a precise software engineering and curriculum design engine."
    }\n\nCRITICAL: Respond ONLY with valid, raw RFC 8259 JSON matching the exact schema requested. Do not include markdown code block syntax (like \`\`\`json), commentary, or surrounding prose.\n${schemaInstruction}`;

    if (!this.client) {
      console.info("OpenAI API key not configured. Using deterministic fallback generator.");
      return {
        data: fallbackGenerator(),
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        model: "heuristic-fallback",
        isFallback: true,
      };
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? this.maxTokens,
      });

      const rawContent = response.choices[0]?.message?.content || "{}";
      const promptTokens = response.usage?.prompt_tokens || 0;
      const completionTokens = response.usage?.completion_tokens || 0;

      let parsedData: T;
      try {
        parsedData = JSON.parse(rawContent) as T;
      } catch (parseErr) {
        console.warn("JSON parse error from OpenAI response, using fallback:", parseErr);
        parsedData = fallbackGenerator();
      }

      this.recordUsage("generateJSON", model, promptTokens, completionTokens, true);

      return {
        data: parsedData,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        model,
        isFallback: false,
      };
    } catch (error: any) {
      console.error("OpenAI JSON generation error:", error?.message || error);
      this.recordUsage("generateJSON", model, 0, 0, false, error?.message);

      return {
        data: fallbackGenerator(),
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        model: "heuristic-fallback",
        isFallback: true,
      };
    }
  }
}

// Singleton provider instance
let defaultProvider: ILLMProvider | null = null;

export function getLLMProvider(): ILLMProvider {
  if (!defaultProvider) {
    defaultProvider = new OpenAIProvider();
  }
  return defaultProvider;
}
