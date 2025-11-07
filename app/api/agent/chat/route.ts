import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TripPlanningAgent } from '@/lib/agents/trip-planning-agent';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId, agentType = 'trip_planning' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: currentUser.userId },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          userId: currentUser.userId,
          agentType,
          messages: [],
          context: {},
        },
      });
    }

    // Get conversation history
    const messages = (conversation.messages as any[]) || [];

    // Initialize agent
    const agent = new TripPlanningAgent();

    // Process message
    const response = await agent.processMessage(
      message,
      messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        userId: currentUser.userId,
        conversationId: conversation.id,
      }
    );

    // Update conversation with new messages
    const updatedMessages = [
      ...messages,
      {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        agentName: 'Trip Planning Agent',
      },
    ];

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        messages: updatedMessages,
        lastMessageAt: new Date(),
        context: {
          ...(conversation.context as any),
          ...response.data,
        },
      },
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      message: response.message,
      suggestions: response.suggestions,
      data: response.data,
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
