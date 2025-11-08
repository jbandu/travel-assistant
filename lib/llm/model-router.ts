/**
 * Model Router - Intelligent LLM Selection
 * Routes queries to the optimal model based on complexity, cost, and availability
 */

import { AnthropicClient } from './anthropic-client';
import { OpenAIClient } from './openai-client';
import { GeminiClient } from './gemini-client';
import { OllamaClient } from './ollama-client';
import { usageTracker } from './usage-tracker';
import {
  ChatMessage,
  ChatCompletionResponse,
  ChatOptions,
  QueryComplexity,
  ModelConfig,
  ModelProvider,
} from './types';

export class ModelRouter {
  private anthropic: AnthropicClient;
  private openai: OpenAIClient;
  private gemini: GeminiClient;
  private ollama: OllamaClient;
  private useOllamaFirst: boolean;

  // Model configurations with costs and priorities
  private modelConfigs: Record<QueryComplexity, ModelConfig[]> = {
    simple: [
      {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxTokens: 2048,
        temperature: 0.7,
        costPer1MTokens: 0.15,
        priority: 1,
      },
      {
        provider: 'google',
        model: 'gemini-1.5-flash',
        maxTokens: 2048,
        temperature: 0.7,
        costPer1MTokens: 0.075, // Very cheap - $0.075 per 1M input tokens
        priority: 2,
      },
    ],
    medium: [
      {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxTokens: 4000,
        temperature: 0.7,
        costPer1MTokens: 0.15,
        priority: 1,
      },
      {
        provider: 'google',
        model: 'gemini-1.5-flash',
        maxTokens: 4000,
        temperature: 0.7,
        costPer1MTokens: 0.075,
        priority: 2,
      },
      {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        maxTokens: 4000,
        temperature: 0.7,
        costPer1MTokens: 15.0,
        priority: 3,
      },
    ],
    complex: [
      {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        maxTokens: 4000,
        temperature: 0.7,
        costPer1MTokens: 15.0,
        priority: 1,
      },
      {
        provider: 'openai',
        model: 'gpt-4o',
        maxTokens: 4000,
        temperature: 0.7,
        costPer1MTokens: 10.0,
        priority: 2,
      },
      {
        provider: 'google',
        model: 'gemini-1.5-pro',
        maxTokens: 4000,
        temperature: 0.7,
        costPer1MTokens: 1.25, // $1.25 per 1M input tokens
        priority: 3,
      },
    ],
  };

  constructor() {
    this.anthropic = new AnthropicClient();
    this.openai = new OpenAIClient();
    this.gemini = new GeminiClient();
    this.ollama = new OllamaClient();

    // Use Ollama first in development for cost savings
    this.useOllamaFirst = process.env.NODE_ENV === 'development' ||
                           process.env.USE_OLLAMA_FIRST === 'true';
  }

  /**
   * Main chat method - analyzes complexity and routes to best model
   */
  async chat(
    messages: ChatMessage[],
    options?: ChatOptions & { forceProvider?: ModelProvider }
  ): Promise<ChatCompletionResponse> {
    // Allow forcing a specific provider for testing
    if (options?.forceProvider) {
      return this.chatWithProvider(options.forceProvider, messages, options);
    }

    // Try Ollama first in development (free, local, fast!)
    if (this.useOllamaFirst && await this.ollama.isAvailable()) {
      try {
        console.log('🦙 Using Ollama (local LLM)...');
        const response = await this.ollama.chat(messages, options);

        // Log usage (free!)
        await usageTracker.logUsage({
          provider: 'ollama',
          model: response.model || 'llama3.1:8b',
          promptTokens: response.usage?.promptTokens || 0,
          completionTokens: response.usage?.completionTokens || 0,
          totalTokens: response.usage?.totalTokens || 0,
          cost: 0, // Free!
          timestamp: new Date(),
          success: true,
        });

        return response;
      } catch (error) {
        console.log('⚠️  Ollama failed, falling back to cloud providers...');
      }
    }

    // Analyze query complexity
    const complexity = this.analyzeComplexity(messages, options?.context);

    console.log(`🤖 Query complexity: ${complexity}`);

    // Get models for this complexity level, sorted by priority
    const models = this.modelConfigs[complexity].sort(
      (a, b) => a.priority - b.priority
    );

    // Try each model in order until one succeeds
    for (const modelConfig of models) {
      try {
        console.log(`🎯 Trying ${modelConfig.provider} (${modelConfig.model})...`);

        const response = await this.chatWithProvider(
          modelConfig.provider,
          messages,
          {
            ...options,
            model: modelConfig.model,
            maxTokens: modelConfig.maxTokens,
            temperature: modelConfig.temperature,
          }
        );

        // Calculate and log cost
        if (response.usage) {
          const cost = this.calculateCost(
            response.usage.totalTokens,
            modelConfig.costPer1MTokens
          );
          console.log(
            `✅ Success! Used ${response.usage.totalTokens} tokens, cost: $${cost.toFixed(4)}`
          );

          // Track usage
          await usageTracker.logUsage({
            provider: modelConfig.provider,
            model: modelConfig.model,
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens,
            cost,
            timestamp: new Date(),
            complexity,
            success: true,
          });
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ ${modelConfig.provider} failed:`, errorMessage);

        // Track failure
        await usageTracker.logUsage({
          provider: modelConfig.provider,
          model: modelConfig.model,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          timestamp: new Date(),
          complexity,
          success: false,
          error: errorMessage,
        });

        // Continue to next model
      }
    }

    // All models failed - throw error
    throw new Error('All LLM providers failed. Please check API keys and try again.');
  }

  /**
   * Analyze query complexity based on multiple factors
   */
  private analyzeComplexity(
    messages: ChatMessage[],
    context?: any
  ): QueryComplexity {
    const lastUserMessage =
      messages
        .filter((m) => m.role === 'user')
        .pop()
        ?.content.toLowerCase() || '';

    // Count factors that indicate complexity
    let complexityScore = 0;

    // 1. Message length
    const wordCount = lastUserMessage.split(/\s+/).length;
    if (wordCount > 100) complexityScore += 3;
    else if (wordCount > 50) complexityScore += 2;
    else if (wordCount > 20) complexityScore += 1;

    // 2. Conversation history
    const conversationLength = messages.filter((m) => m.role !== 'system').length;
    if (conversationLength > 10) complexityScore += 2;
    else if (conversationLength > 5) complexityScore += 1;

    // 3. Context presence
    if (context && Object.keys(context).length > 0) {
      complexityScore += 2;
    }

    // 4. Complexity keywords
    const complexKeywords = [
      'analyze',
      'compare',
      'optimize',
      'detailed',
      'comprehensive',
      'multiple',
      'itinerary',
      'route',
      'budget breakdown',
    ];
    const hasComplexKeywords = complexKeywords.some((keyword) =>
      lastUserMessage.includes(keyword)
    );
    if (hasComplexKeywords) complexityScore += 2;

    // 5. Simple query patterns
    const simplePatterns = [
      /^(hi|hello|hey)/,
      /^(yes|no|sure|okay)/,
      /^thank/,
      /\?$/,
    ];
    const isSimplePattern = simplePatterns.some((pattern) =>
      pattern.test(lastUserMessage.trim())
    );
    if (isSimplePattern && wordCount < 10) complexityScore = 0;

    // Determine complexity level
    if (complexityScore >= 6) return 'complex';
    if (complexityScore >= 3) return 'medium';
    return 'simple';
  }

  /**
   * Call specific provider
   */
  private async chatWithProvider(
    provider: ModelProvider,
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatCompletionResponse> {
    switch (provider) {
      case 'ollama':
        if (!(await this.ollama.isAvailable())) {
          throw new Error('Ollama is not running or model not available');
        }
        return await this.ollama.chat(messages, options);

      case 'anthropic':
        if (!this.anthropic.isAvailable()) {
          throw new Error('Anthropic API key not configured');
        }
        return await this.anthropic.chat(messages, options);

      case 'openai':
        if (!this.openai.isAvailable()) {
          throw new Error('OpenAI API key not configured');
        }
        return await this.openai.chat(messages, options);

      case 'google':
        if (!this.gemini.isAvailable()) {
          throw new Error('Google AI API key not configured');
        }
        return await this.gemini.chat(messages, options);

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Calculate cost for a given number of tokens
   */
  private calculateCost(tokens: number, costPer1MTokens: number): number {
    return (tokens / 1_000_000) * costPer1MTokens;
  }

  /**
   * Get available providers
   */
  async getAvailableProviders(): Promise<ModelProvider[]> {
    const providers: ModelProvider[] = [];
    if (await this.ollama.isAvailable()) providers.push('ollama');
    if (this.anthropic.isAvailable()) providers.push('anthropic');
    if (this.openai.isAvailable()) providers.push('openai');
    if (this.gemini.isAvailable()) providers.push('google');
    return providers;
  }

  /**
   * Check if at least one provider is available
   */
  async hasAvailableProvider(): Promise<boolean> {
    const providers = await this.getAvailableProviders();
    return providers.length > 0;
  }

  /**
   * Get cost estimate for a query before sending
   */
  estimateCost(
    messages: ChatMessage[],
    complexity?: QueryComplexity
  ): {
    complexity: QueryComplexity;
    estimatedTokens: number;
    estimatedCost: number;
    provider: ModelProvider;
  } {
    const actualComplexity = complexity || this.analyzeComplexity(messages);
    const primaryModel = this.modelConfigs[actualComplexity][0];

    // Rough token estimation (4 chars per token)
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4);

    const estimatedCost = this.calculateCost(
      estimatedTokens,
      primaryModel.costPer1MTokens
    );

    return {
      complexity: actualComplexity,
      estimatedTokens,
      estimatedCost,
      provider: primaryModel.provider,
    };
  }
}
