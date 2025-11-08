/**
 * Shared types for LLM clients
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  provider?: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  stream?: boolean;
  context?: any;
}

export type ModelProvider = 'anthropic' | 'openai' | 'google' | 'ollama';
export type QueryComplexity = 'simple' | 'medium' | 'complex';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  costPer1MTokens: number;
  priority: number; // Lower = higher priority for fallback
}

export interface UsageLog {
  provider: ModelProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: Date;
  complexity?: QueryComplexity;
  success: boolean;
  error?: string;
}
