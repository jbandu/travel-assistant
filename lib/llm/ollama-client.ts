/**
 * Ollama Client - Local LLM Support
 * Run models locally with Ollama for development and cost savings
 * Install: https://ollama.ai/
 */

import { ChatMessage, ChatCompletionResponse, ChatOptions } from './types';

export class OllamaClient {
  private baseURL: string;
  private model: string;

  constructor(
    baseURL: string = 'http://localhost:11434',
    model: string = 'llama3.1:8b'
  ) {
    this.baseURL = baseURL;
    this.model = model;
  }

  async chat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatCompletionResponse> {
    try {
      // Check if Ollama is running
      await this.checkAvailability();

      // Convert messages to Ollama format
      const prompt = this.formatPrompt(messages);

      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens || 2000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Estimate tokens (Ollama doesn't always provide this)
      const promptTokens = this.estimateTokens(prompt);
      const completionTokens = this.estimateTokens(data.response);

      return {
        message: data.response,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        model: this.model,
        provider: 'ollama',
      };
    } catch (error) {
      console.error('Ollama error:', error);
      throw error;
    }
  }

  /**
   * Format messages into a single prompt for Ollama
   */
  private formatPrompt(messages: ChatMessage[]): string {
    let prompt = '';

    messages.forEach((msg) => {
      if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    });

    prompt += 'Assistant: ';
    return prompt;
  }

  /**
   * Check if Ollama is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if Ollama is running and model is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const available = await this.checkAvailability();
      if (!available) return false;

      // Check if model is pulled
      const response = await fetch(`${this.baseURL}/api/tags`);
      const data = await response.json();

      return data.models?.some((m: any) => m.name.includes(this.model)) || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      const data = await response.json();

      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      return [];
    }
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      return response.ok;
    } catch (error) {
      console.error(`Error pulling model ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Simple token estimation (roughly 4 characters per token)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
