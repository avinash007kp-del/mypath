export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: "json_object" | "text";
}

export interface LLMResponse {
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  isFallback: boolean;
}

export interface LLMJSONResponse<T> {
  data: T;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  isFallback: boolean;
}

export interface ILLMProvider {
  name: string;
  isConfigured(): boolean;
  generateText(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
  generateJSON<T>(
    prompt: string,
    schemaInstruction: string,
    fallbackGenerator: () => T,
    options?: LLMOptions
  ): Promise<LLMJSONResponse<T>>;
}
