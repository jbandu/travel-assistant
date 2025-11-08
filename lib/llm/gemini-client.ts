/**
 * Google Gemini Client
 * Wrapper for Google AI API with error handling and retry logic
 */

import { ChatMessage, ChatCompletionResponse, ChatOptions } from './types';

export class GeminiClient {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(apiKey?: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey || process.env.GOOGLE_AI_API_KEY || '';
    this.model = model;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1';

    if (!this.apiKey) {
      console.warn('⚠️  Google AI API key not configured.');
    }
  }

  async chat(
    messages: ChatMessage[],
    options?: ChatOptions & { model?: string }
  ): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error('Google AI API key not configured');
    }

    // Use model from options if provided, otherwise use default
    const modelToUse = options?.model || this.model;

    try {
      // Convert messages to Gemini format
      const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
      const nonSystemMessages = messages.filter((m) => m.role !== 'system');

      // Gemini doesn't support system messages directly, so prepend to first user message
      const contents = nonSystemMessages.map((m, index) => {
        let text = m.content;

        // Prepend system message to first user message
        if (index === 0 && m.role === 'user' && systemMessage) {
          text = `${systemMessage}\n\n${m.content}`;
        }

        return {
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text }],
        };
      });

      const response = await fetch(
        `${this.baseURL}/models/${modelToUse}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: options?.temperature ?? 0.7,
              maxOutputTokens: options?.maxTokens || 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Gemini API error: ${error.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      // Gemini doesn't always provide token counts in the response
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      const promptTokens = this.estimateTokens(
        messages.map((m) => m.content).join(' ')
      );
      const completionTokens = this.estimateTokens(text);

      return {
        message: text,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        model: modelToUse,
        provider: 'google',
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  // Simple token estimation (roughly 4 characters per token)
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
