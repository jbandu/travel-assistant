/**
 * Trip Planning Agent
 * Specialized AI agent for destination discovery and itinerary planning
 */

import { BaseAgent, Message, AgentContext, AgentResponse } from './base-agent';
import { ModelRouter } from '../llm';
import { WeatherService } from '../weather';

export class TripPlanningAgent extends BaseAgent {
  private llmRouter: ModelRouter;
  private weatherService: WeatherService;

  constructor(userProfile?: any) {
    const systemPrompt = TripPlanningAgent.buildSystemPrompt(userProfile);
    super('trip_planning', systemPrompt);
    this.llmRouter = new ModelRouter();
    this.weatherService = new WeatherService();
  }

  private static buildSystemPrompt(userProfile?: any): string {
    let basePrompt = `You are an expert travel planning AI assistant with deep knowledge of global destinations, travel logistics, and budget optimization.

Your role:
- Help travelers discover perfect destinations based on their preferences, budget, and interests
- Provide detailed, personalized recommendations with practical information
- Consider seasonal factors, weather patterns, local events, and pricing trends
- Ask clarifying questions to understand traveler needs better
- Suggest multi-destination itineraries when appropriate
- Provide budget estimates and cost-saving tips

Guidelines:
- Be enthusiastic and inspiring but also practical
- Use emojis sparingly for visual appeal
- Provide specific, actionable recommendations
- Always consider safety, visa requirements, and travel logistics
- Ask follow-up questions to refine recommendations
- Format responses clearly with headers and bullet points`;

    // Add user profile context if available
    if (userProfile && userProfile.preferences) {
      const prefs = userProfile.preferences;
      basePrompt += `\n\n--- USER PROFILE CONTEXT ---\nYou are assisting ${userProfile.firstName || 'a traveler'}. Use this context to provide personalized recommendations:\n`;

      if (prefs.interests && prefs.interests.length > 0) {
        basePrompt += `\n🎯 Interests: ${prefs.interests.join(', ')}`;
      }

      if (prefs.travelStyle) {
        basePrompt += `\n💰 Travel Style: ${prefs.travelStyle} (${prefs.travelStyle === 'budget' ? 'cost-conscious, value-oriented' : prefs.travelStyle === 'luxury' ? 'premium experiences, high-end accommodations' : 'balanced comfort and value'})`;
      }

      if (prefs.preferredBudgetRange) {
        basePrompt += `\n💵 Typical Budget: $${prefs.preferredBudgetRange.min}-$${prefs.preferredBudgetRange.max} ${prefs.preferredBudgetRange.currency || 'USD'}`;
      }

      if (prefs.activityLevel) {
        basePrompt += `\n⚡ Activity Level: ${prefs.activityLevel}`;
      }

      if (prefs.groupPreference) {
        basePrompt += `\n👥 Usually travels: ${prefs.groupPreference}`;
      }

      if (prefs.visitedCountries && prefs.visitedCountries.length > 0) {
        basePrompt += `\n✈️  Previously visited: ${prefs.visitedCountries.join(', ')}`;
      }

      if (prefs.favoriteDestinations && prefs.favoriteDestinations.length > 0) {
        basePrompt += `\n❤️  Favorite destinations: ${prefs.favoriteDestinations.join(', ')}`;
      }

      if (prefs.bucketList && prefs.bucketList.length > 0) {
        basePrompt += `\n📋 Bucket list: ${prefs.bucketList.join(', ')}`;
      }

      if (prefs.dietaryRestrictions && prefs.dietaryRestrictions.length > 0) {
        basePrompt += `\n🍽️  Dietary needs: ${prefs.dietaryRestrictions.join(', ')}`;
      }

      if (prefs.languages && prefs.languages.length > 0) {
        basePrompt += `\n🗣️  Languages: ${prefs.languages.join(', ')}`;
      }

      basePrompt += `\n\nIMPORTANT: Use this context proactively. Make recommendations that align with their interests, budget, and travel style. Reference their past trips when relevant. Avoid suggesting places they've already visited unless they specifically ask. Prioritize destinations from their bucket list when appropriate.`;
    }

    basePrompt += `\n\nKey information to gather (if not in profile):
1. Budget (total or per day)
2. Duration (number of days)
3. Interests (beach, culture, adventure, food, nightlife, etc.)
4. Travel style (luxury, mid-range, budget)
5. Season/dates
6. Group size and composition (solo, couple, family, friends)
7. Previous travel experience

When you have enough information, suggest 3-5 destinations with:
- Brief description and highlights
- Best time to visit
- Estimated budget breakdown
- Must-see attractions
- Local tips and insider recommendations`;

    return basePrompt;
  }

  async processMessage(
    userMessage: string,
    conversationHistory: Message[],
    context: AgentContext
  ): Promise<AgentResponse> {
    try {
      // Format messages for LLM
      const messages = this.formatMessages(userMessage, conversationHistory);

      // Call LLM Router (automatically selects best model)
      const response = await this.llmRouter.chat(
        messages.map((m) => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: m.content,
        })),
        {
          temperature: 0.7,
          maxTokens: 2000,
          context, // Pass context for complexity analysis
        }
      );

      // Extract potential trip data from conversation
      const tripData = this.extractTripData(
        userMessage,
        conversationHistory,
        response.message
      );

      // Generate suggestions for quick replies
      const suggestions = this.generateSuggestions(response.message);

      return {
        message: response.message,
        suggestions,
        data: tripData,
        confidence: 0.85,
      };
    } catch (error) {
      console.error('Trip Planning Agent error:', error);
      return {
        message:
          "I apologize, but I'm having trouble processing your request right now. Could you please try rephrasing your question?",
        suggestions: [
          'Tell me about budget-friendly destinations',
          'I want to plan a beach vacation',
          'Suggest adventure destinations',
        ],
      };
    }
  }

  private extractTripData(
    userMessage: string,
    history: Message[],
    agentResponse: string
  ): any {
    const data: any = {
      preferences: {},
    };

    // Extract budget
    const budgetMatch = userMessage.match(/\$(\d+)/);
    if (budgetMatch) {
      data.preferences.budget = parseInt(budgetMatch[1]);
    }

    // Extract duration
    const durationMatch = userMessage.match(/(\d+)\s*(?:days?|weeks?)/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[0].toLowerCase().includes('week')
        ? 'weeks'
        : 'days';
      data.preferences.duration = { value, unit };
    }

    // Extract interests
    const interests = [];
    if (userMessage.toLowerCase().includes('beach')) interests.push('beach');
    if (userMessage.toLowerCase().includes('culture'))
      interests.push('culture');
    if (userMessage.toLowerCase().includes('adventure'))
      interests.push('adventure');
    if (userMessage.toLowerCase().includes('food')) interests.push('food');

    if (interests.length > 0) {
      data.preferences.interests = interests;
    }

    // Extract destinations mentioned in agent response
    const destinations: string[] = [];
    const destinationPatterns = [
      /\*\*([A-Z][a-z]+(?:,?\s+[A-Z][a-z]+)*)\*\*/g,
    ];

    for (const pattern of destinationPatterns) {
      const matches = agentResponse.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && !destinations.includes(match[1])) {
          destinations.push(match[1]);
        }
      }
    }

    if (destinations.length > 0) {
      data.suggestedDestinations = destinations.slice(0, 5);
    }

    return data;
  }

  private generateSuggestions(agentResponse: string): string[] {
    const suggestions: string[] = [];

    // Add contextual suggestions based on agent response
    if (agentResponse.toLowerCase().includes('budget')) {
      suggestions.push('Show me mid-range options');
      suggestions.push('What about luxury destinations?');
    }

    if (agentResponse.toLowerCase().includes('beach')) {
      suggestions.push('Tell me more about beach activities');
      suggestions.push('What about mountain destinations instead?');
    }

    if (agentResponse.toLowerCase().includes('when')) {
      suggestions.push('I want to travel in summer');
      suggestions.push('I prefer off-season travel');
    }

    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push('Tell me more about these destinations');
      suggestions.push('What about alternative options?');
      suggestions.push('Help me create an itinerary');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Get weather insights for a destination
   * Can be called separately or integrated into trip planning
   */
  async getWeatherInsights(
    destination: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const start = startDate || new Date();
    const end = endDate || new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

    try {
      const insights = await this.weatherService.getWeatherInsights(
        destination,
        start,
        end
      );

      return {
        success: true,
        insights,
        formatted: this.formatWeatherInsights(insights),
      };
    } catch (error) {
      console.error('Weather insights error:', error);
      return {
        success: false,
        error: 'Unable to fetch weather information',
      };
    }
  }

  /**
   * Format weather insights for display
   */
  private formatWeatherInsights(insights: any): string {
    let formatted = `\n\n### 🌤️ Weather Insights for ${insights.destination}\n\n`;
    formatted += `${insights.summary}\n\n`;

    formatted += `**🎒 Packing Recommendations:**\n`;
    insights.packingRecommendations.slice(0, 8).forEach((item: string) => {
      formatted += `- ${item}\n`;
    });

    formatted += `\n**🎯 Recommended Activities:**\n`;
    formatted += `\nOutdoor Activities (on nice days):\n`;
    insights.activitySuggestions.outdoor.slice(0, 3).forEach((activity: string) => {
      formatted += `- ${activity}\n`;
    });

    formatted += `\nIndoor Activities (backup options):\n`;
    insights.activitySuggestions.indoor.slice(0, 3).forEach((activity: string) => {
      formatted += `- ${activity}\n`;
    });

    if (insights.bestDays && insights.bestDays.length > 0) {
      formatted += `\n**📅 Best Days for Outdoor Activities:** ${insights.bestDays.join(', ')}\n`;
    }

    return formatted;
  }
}
