import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TripPlanningAgent } from '@/lib/agents/trip-planning-agent';

// Activity logging for debugging
const activityLogs: any[] = [];
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

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

    // Clear previous logs and capture new ones
    activityLogs.length = 0;

    // Intercept console logs for debugging
    console.log = (...args: any[]) => {
      const timestamp = new Date().toISOString();
      const logEntry = args.join(' ');
      activityLogs.push({
        type: 'info',
        message: logEntry,
        timestamp,
        icon: getIconForLog(logEntry)
      });
      originalConsoleLog(...args);
    };

    console.error = (...args: any[]) => {
      const timestamp = new Date().toISOString();
      activityLogs.push({
        type: 'error',
        message: args.join(' '),
        timestamp
      });
      originalConsoleError(...args);
    };

    activityLogs.push({
      type: 'info',
      message: '🚀 Starting trip planning request...',
      timestamp: new Date().toISOString(),
      icon: '🚀'
    });

    // Get or create conversation
    let conversation;
    if (conversationId) {
      activityLogs.push({
        type: 'info',
        message: `📝 Loading conversation: ${conversationId}`,
        timestamp: new Date().toISOString(),
        icon: '📝'
      });
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
      activityLogs.push({
        type: 'info',
        message: '✨ Creating new conversation...',
        timestamp: new Date().toISOString(),
        icon: '✨'
      });
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

    activityLogs.push({
      type: 'info',
      message: `💬 Conversation history: ${messages.length} messages`,
      timestamp: new Date().toISOString(),
      icon: '💬'
    });

    // Load user profile with preferences
    activityLogs.push({
      type: 'info',
      message: '👤 Loading user profile and preferences...',
      timestamp: new Date().toISOString(),
      icon: '👤'
    });

    const userProfile = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: { profile: true },
    });

    if (userProfile?.profile) {
      const prefs = userProfile.profile.preferences as any;
      const contextInfo = [];
      if (prefs.interests) contextInfo.push(`interests: ${prefs.interests.slice(0, 3).join(', ')}`);
      if (prefs.travelStyle) contextInfo.push(`style: ${prefs.travelStyle}`);
      if (prefs.visitedCountries) contextInfo.push(`visited: ${prefs.visitedCountries.length} countries`);

      activityLogs.push({
        type: 'info',
        message: `✅ Profile loaded: ${contextInfo.join(', ')}`,
        timestamp: new Date().toISOString(),
        icon: '✅'
      });
    }

    // Initialize agent with profile context
    const agent = new TripPlanningAgent(userProfile);

    activityLogs.push({
      type: 'info',
      message: '🤖 Initializing Trip Planning Agent with personalized context...',
      timestamp: new Date().toISOString(),
      icon: '🤖'
    });

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

    activityLogs.push({
      type: 'info',
      message: '💾 Saving conversation to database...',
      timestamp: new Date().toISOString(),
      icon: '💾'
    });

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

    activityLogs.push({
      type: 'success',
      message: '✅ Request completed successfully!',
      timestamp: new Date().toISOString(),
      icon: '✅'
    });

    // Restore original console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      message: response.message,
      suggestions: response.suggestions,
      data: response.data,
      activityLogs: activityLogs, // Include activity logs for debugging
    });
  } catch (error) {
    console.error('Agent chat error:', error);

    activityLogs.push({
      type: 'error',
      message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      icon: '❌'
    });

    // Restore original console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    return NextResponse.json(
      {
        error: 'Failed to process message',
        activityLogs: activityLogs
      },
      { status: 500 }
    );
  }
}

// Helper function to determine icon for log messages
function getIconForLog(logMessage: string): string {
  if (logMessage.includes('🦙')) return '🦙';
  if (logMessage.includes('🤖')) return '🤖';
  if (logMessage.includes('🎯')) return '🎯';
  if (logMessage.includes('✅')) return '✅';
  if (logMessage.includes('❌')) return '❌';
  if (logMessage.includes('⚠️')) return '⚠️';
  if (logMessage.includes('Using Ollama')) return '🦙';
  if (logMessage.includes('complexity')) return '🧠';
  if (logMessage.includes('Trying')) return '🔄';
  if (logMessage.includes('Success')) return '✅';
  if (logMessage.includes('cost')) return '💰';
  if (logMessage.includes('tokens')) return '🔢';
  if (logMessage.includes('failed')) return '❌';
  return '📋';
}
