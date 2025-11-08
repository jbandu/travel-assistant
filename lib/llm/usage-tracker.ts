/**
 * Usage Tracker - Monitor LLM API usage and costs
 */

import { UsageLog, ModelProvider, QueryComplexity } from './types';

export class UsageTracker {
  private logs: UsageLog[] = [];

  /**
   * Log API usage
   */
  async logUsage(log: UsageLog): Promise<void> {
    // Store in memory for now
    this.logs.push(log);

    // In production, this would save to database
    // await prisma.llmUsage.create({ data: log });

    // Optional: Print to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `📊 LLM Usage: ${log.provider}/${log.model} - ${log.totalTokens} tokens ($${log.cost.toFixed(4)})`
      );
    }
  }

  /**
   * Get usage stats for a time period
   */
  getStats(since?: Date): {
    totalCost: number;
    totalTokens: number;
    requestCount: number;
    byProvider: Record<
      ModelProvider,
      { cost: number; tokens: number; requests: number }
    >;
    byComplexity: Record<
      QueryComplexity,
      { cost: number; tokens: number; requests: number }
    >;
    successRate: number;
  } {
    const relevantLogs = since
      ? this.logs.filter((log) => log.timestamp >= since)
      : this.logs;

    const stats = {
      totalCost: 0,
      totalTokens: 0,
      requestCount: relevantLogs.length,
      byProvider: {} as Record<
        ModelProvider,
        { cost: number; tokens: number; requests: number }
      >,
      byComplexity: {} as Record<
        QueryComplexity,
        { cost: number; tokens: number; requests: number }
      >,
      successRate: 0,
    };

    let successCount = 0;

    relevantLogs.forEach((log) => {
      stats.totalCost += log.cost;
      stats.totalTokens += log.totalTokens;
      if (log.success) successCount++;

      // By provider
      if (!stats.byProvider[log.provider]) {
        stats.byProvider[log.provider] = { cost: 0, tokens: 0, requests: 0 };
      }
      stats.byProvider[log.provider].cost += log.cost;
      stats.byProvider[log.provider].tokens += log.totalTokens;
      stats.byProvider[log.provider].requests++;

      // By complexity
      if (log.complexity) {
        if (!stats.byComplexity[log.complexity]) {
          stats.byComplexity[log.complexity] = { cost: 0, tokens: 0, requests: 0 };
        }
        stats.byComplexity[log.complexity].cost += log.cost;
        stats.byComplexity[log.complexity].tokens += log.totalTokens;
        stats.byComplexity[log.complexity].requests++;
      }
    });

    stats.successRate =
      relevantLogs.length > 0 ? (successCount / relevantLogs.length) * 100 : 0;

    return stats;
  }

  /**
   * Get usage report as formatted string
   */
  getReport(since?: Date): string {
    const stats = this.getStats(since);
    const period = since
      ? `since ${since.toLocaleDateString()}`
      : 'all time';

    let report = `\n📊 LLM Usage Report (${period})\n`;
    report += `${'='.repeat(50)}\n\n`;

    report += `Total Requests: ${stats.requestCount}\n`;
    report += `Total Tokens: ${stats.totalTokens.toLocaleString()}\n`;
    report += `Total Cost: $${stats.totalCost.toFixed(2)}\n`;
    report += `Success Rate: ${stats.successRate.toFixed(1)}%\n\n`;

    report += `By Provider:\n`;
    Object.entries(stats.byProvider).forEach(([provider, data]) => {
      report += `  ${provider}:\n`;
      report += `    Requests: ${data.requests}\n`;
      report += `    Tokens: ${data.tokens.toLocaleString()}\n`;
      report += `    Cost: $${data.cost.toFixed(2)}\n`;
    });

    if (Object.keys(stats.byComplexity).length > 0) {
      report += `\nBy Complexity:\n`;
      Object.entries(stats.byComplexity).forEach(([complexity, data]) => {
        report += `  ${complexity}:\n`;
        report += `    Requests: ${data.requests}\n`;
        report += `    Tokens: ${data.tokens.toLocaleString()}\n`;
        report += `    Cost: $${data.cost.toFixed(2)}\n`;
      });
    }

    report += `\n${'='.repeat(50)}\n`;

    return report;
  }

  /**
   * Clear logs (useful for testing)
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): UsageLog[] {
    return [...this.logs];
  }
}

// Global singleton instance
export const usageTracker = new UsageTracker();
