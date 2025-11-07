/**
 * Base Agent Interface
 * All AI agents (Trip Planning, Search, Experience, Support, Customer360)
 * extend this base interface for consistency
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AgentContext {
  userId: string;
  conversationId?: string;
  tripId?: string;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  message: string;
  suggestions?: string[];
  data?: any;
  nextAction?: string;
  confidence?: number;
}

export abstract class BaseAgent {
  protected agentType: string;
  protected systemPrompt: string;

  constructor(agentType: string, systemPrompt: string) {
    this.agentType = agentType;
    this.systemPrompt = systemPrompt;
  }

  abstract processMessage(
    userMessage: string,
    conversationHistory: Message[],
    context: AgentContext
  ): Promise<AgentResponse>;

  protected formatMessages(
    userMessage: string,
    conversationHistory: Message[]
  ): Message[] {
    return [
      { role: 'system', content: this.systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];
  }
}
