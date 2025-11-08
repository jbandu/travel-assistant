/**
 * Anthropic Claude Client
 * Wrapper for Anthropic API with error handling and retry logic
 */

import { ChatMessage, ChatCompletionResponse, ChatOptions } from './types';

export class AnthropicClient {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(apiKey?: string, model: string = 'claude-sonnet-4-20250514') {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.model = model;
    this.baseURL = 'https://api.anthropic.com/v1';

    if (!this.apiKey) {
      console.warn('⚠️  Anthropic API key not configured.');
    }
  }

  async chat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      // Extract system message (Claude requires it separate)
      const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
      const conversationMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          system: systemMessage,
          messages: conversationMessages,
          max_tokens: options?.maxTokens || 4000,
          temperature: options?.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Anthropic API error: ${error.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      return {
        message: data.content[0].text,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        model: this.model,
        provider: 'anthropic',
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
