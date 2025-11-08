/**
 * Test Script for Multi-Model LLM Router
 * Run with: npx tsx test-model-router.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { ModelRouter, usageTracker } from './lib/llm';

async function testModelRouter() {
  console.log('🚀 Testing Multi-Model LLM Router\n');
  console.log('=' .repeat(60));

  const router = new ModelRouter();

  // Check available providers
  const providers = await router.getAvailableProviders();
  console.log(`\n✅ Available providers: ${providers.join(', ')}`);

  if (providers.includes('ollama')) {
    console.log('🦙 Ollama detected - will use local LLM for development!');
  }

  if (!(await router.hasAvailableProvider())) {
    console.error('❌ No LLM providers available. Please configure API keys in .env or start Ollama');
    process.exit(1);
  }

  // Test 1: Simple query (should use Gemini - cheapest)
  console.log('\n' + '='.repeat(60));
  console.log('Test 1: Simple Query');
  console.log('='.repeat(60));

  const simpleQuery = [
    { role: 'system' as const, content: 'You are a helpful travel assistant.' },
    { role: 'user' as const, content: 'Hi! Can you help me plan a trip?' },
  ];

  try {
    const estimate = router.estimateCost(simpleQuery);
    console.log(`\n📊 Estimate before calling:`);
    console.log(`   Complexity: ${estimate.complexity}`);
    console.log(`   Estimated tokens: ${estimate.estimatedTokens}`);
    console.log(`   Estimated cost: $${estimate.estimatedCost.toFixed(6)}`);
    console.log(`   Will use: ${estimate.provider}\n`);

    const response = await router.chat(simpleQuery);
    console.log(`\n💬 Response: ${response.message.substring(0, 200)}...`);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 2: Medium complexity query (should use GPT-4o-mini)
  console.log('\n' + '='.repeat(60));
  console.log('Test 2: Medium Complexity Query');
  console.log('='.repeat(60));

  const mediumQuery = [
    { role: 'system' as const, content: 'You are a helpful travel assistant.' },
    {
      role: 'user' as const,
      content:
        'I want to plan a 10-day trip to Southeast Asia with a budget of $3000. Can you suggest an itinerary covering multiple countries?',
    },
  ];

  try {
    const estimate = router.estimateCost(mediumQuery);
    console.log(`\n📊 Estimate before calling:`);
    console.log(`   Complexity: ${estimate.complexity}`);
    console.log(`   Estimated tokens: ${estimate.estimatedTokens}`);
    console.log(`   Estimated cost: $${estimate.estimatedCost.toFixed(6)}`);
    console.log(`   Will use: ${estimate.provider}\n`);

    const response = await router.chat(mediumQuery);
    console.log(`\n💬 Response: ${response.message.substring(0, 300)}...`);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 3: Complex query (should use Claude Sonnet)
  console.log('\n' + '='.repeat(60));
  console.log('Test 3: Complex Query');
  console.log('='.repeat(60));

  const complexQuery = [
    { role: 'system' as const, content: 'You are a helpful travel assistant.' },
    {
      role: 'user' as const,
      content: `I need a comprehensive, optimized travel itinerary for a family of 4 (2 adults, 2 kids aged 8 and 12) for a 3-week trip across Europe.

      Requirements:
      - Budget: $15,000 total including flights, hotels, food, and activities
      - Must visit: Paris, Rome, Barcelona, Amsterdam
      - Interests: Historical sites, museums, kid-friendly activities, local cuisine
      - Need detailed day-by-day breakdown with travel times between cities
      - Hotel recommendations in each city (family-friendly, central location)
      - Activity suggestions suitable for kids
      - Budget breakdown by category
      - Best season to visit considering weather and crowds

      Please provide a detailed analysis with routing optimization to minimize travel time and maximize experiences.`,
    },
  ];

  try {
    const estimate = router.estimateCost(complexQuery);
    console.log(`\n📊 Estimate before calling:`);
    console.log(`   Complexity: ${estimate.complexity}`);
    console.log(`   Estimated tokens: ${estimate.estimatedTokens}`);
    console.log(`   Estimated cost: $${estimate.estimatedCost.toFixed(6)}`);
    console.log(`   Will use: ${estimate.provider}\n`);

    const response = await router.chat(complexQuery);
    console.log(`\n💬 Response length: ${response.message.length} characters`);
    console.log(`   First 300 chars: ${response.message.substring(0, 300)}...`);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Display usage statistics
  console.log('\n' + '='.repeat(60));
  console.log('📊 Usage Statistics');
  console.log('='.repeat(60));
  console.log(usageTracker.getReport());

  // Display summary
  const stats = usageTracker.getStats();
  console.log('💰 Cost Savings Analysis:');
  console.log(`   Total spent: $${stats.totalCost.toFixed(4)}`);
  console.log(`   If all queries used Claude: $${(stats.totalTokens / 1_000_000 * 15).toFixed(4)}`);
  console.log(
    `   Savings: $${((stats.totalTokens / 1_000_000 * 15) - stats.totalCost).toFixed(4)} (${(((stats.totalTokens / 1_000_000 * 15 - stats.totalCost) / (stats.totalTokens / 1_000_000 * 15)) * 100).toFixed(1)}%)`
  );
}

// Run tests
testModelRouter()
  .then(() => {
    console.log('\n✅ All tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
