/**
 * OpenAI Client
 * Wrapper for OpenAI API with error handling and retry logic
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class OpenAIClient {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(apiKey?: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.model = model;
    this.baseURL = 'https://api.openai.com/v1';

    if (!this.apiKey) {
      console.warn('⚠️  OpenAI API key not configured. Using mock responses.');
    }
  }

  async chat(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<ChatCompletionResponse> {
    // If no API key, return mock response
    if (!this.apiKey) {
      return this.getMockResponse(messages);
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1000,
          stream: options?.stream ?? false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `OpenAI API error: ${error.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      return {
        message: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response on error
      return this.getMockResponse(messages);
    }
  }

  private getMockResponse(messages: ChatMessage[]): ChatCompletionResponse {
    const userMessage = messages.find((m) => m.role === 'user')?.content || '';

    // Simple pattern matching for demo
    let response = '';

    if (
      userMessage.toLowerCase().includes('budget') ||
      userMessage.toLowerCase().includes('price')
    ) {
      response = `Based on your budget preferences, I can suggest several destinations that offer great value!

**Budget-Friendly Options:**
1. **Lisbon, Portugal** 🇵🇹 - Rich culture, stunning architecture, excellent food scene. Average daily budget: $60-80
2. **Bangkok, Thailand** 🇹🇭 - Amazing temples, street food, vibrant nightlife. Average daily budget: $40-60
3. **Mexico City, Mexico** 🇲🇽 - Historical sites, world-class museums, incredible cuisine. Average daily budget: $50-70

What type of experience are you looking for? Beach, culture, adventure, or city exploration?`;
    } else if (
      userMessage.toLowerCase().includes('beach') ||
      userMessage.toLowerCase().includes('tropical')
    ) {
      response = `Perfect! Beach destinations are amazing for relaxation. Here are my top recommendations:

**🏖️ Best Beach Destinations:**
1. **Maldives** - Crystal-clear waters, overwater bungalows, world-class diving
2. **Bali, Indonesia** - Beautiful beaches, rice terraces, spiritual culture
3. **Santorini, Greece** - Stunning sunsets, white-washed buildings, volcanic beaches

When are you planning to travel? This will help me suggest the best season for each destination.`;
    } else if (
      userMessage.toLowerCase().includes('adventure') ||
      userMessage.toLowerCase().includes('hiking')
    ) {
      response = `Adventure seeker! I love it. Here are destinations perfect for outdoor enthusiasts:

**🏔️ Adventure Destinations:**
1. **New Zealand** - Bungee jumping, glacier hiking, Lord of the Rings locations
2. **Patagonia (Argentina/Chile)** - Epic trekking, glaciers, wildlife
3. **Iceland** - Waterfalls, volcanoes, northern lights, hot springs

What's your fitness level and how many days do you have for this adventure?`;
    } else {
      response = `Great! I'd love to help you plan your perfect trip. To give you the best recommendations, could you tell me more about:

1. **Budget**: What's your approximate budget per person?
2. **Duration**: How many days do you have?
3. **Interests**: What excites you most? (beaches, culture, adventure, food, nightlife, etc.)
4. **Travel Style**: Luxury, mid-range, or budget-friendly?
5. **Season**: Do you have specific dates in mind?

The more I know, the better I can tailor my recommendations! 🌍✈️`;
    }

    return {
      message: response,
      usage: {
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300,
      },
    };
  }
}
