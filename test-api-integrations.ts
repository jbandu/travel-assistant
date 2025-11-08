/**
 * API Integration Test Suite
 * Tests all external API integrations for CI/CD validation
 *
 * Run with: npx tsx test-api-integrations.ts
 *
 * This script validates:
 * - Amadeus API (Flight Search Agent)
 * - Amadeus API (Hotel Search Agent)
 * - Unsplash API (Image Service)
 * - Anthropic API (LLM)
 */

import dotenv from 'dotenv';
dotenv.config();

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

function logTest(name: string, status: 'pass' | 'fail' | 'skip', message: string, duration: number) {
  results.push({ name, status, message, duration });

  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? '\x1b[32m' : status === 'fail' ? '\x1b[31m' : '\x1b[33m';
  console.log(`${color}${icon} ${name}\x1b[0m`);
  console.log(`   ${message} (${duration}ms)`);
}

async function testAmadeusFlightSearch(): Promise<void> {
  const start = Date.now();
  const testName = 'Amadeus Flight Search';

  try {
    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;

    if (!apiKey || !apiSecret || apiKey === 'test-amadeus-key') {
      logTest(testName, 'skip', 'Amadeus API credentials not configured', Date.now() - start);
      return;
    }

    // Import and test the Amadeus client
    const { AmadeusClient } = await import('./lib/integrations/amadeus-client');
    const client = new AmadeusClient();

    // Test flight search
    const flights = await client.searchFlights({
      originLocationCode: 'NYC',
      destinationLocationCode: 'LAX',
      departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      adults: 1,
      max: 5,
    });

    if (flights && flights.length > 0) {
      logTest(testName, 'pass', `Found ${flights.length} flights`, Date.now() - start);
    } else {
      logTest(testName, 'pass', 'API connection successful (no flights found)', Date.now() - start);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logTest(testName, 'fail', `Error: ${message}`, Date.now() - start);
  }
}

async function testAmadeusHotelSearch(): Promise<void> {
  const start = Date.now();
  const testName = 'Amadeus Hotel Search';

  try {
    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;

    if (!apiKey || !apiSecret || apiKey === 'test-amadeus-key') {
      logTest(testName, 'skip', 'Amadeus API credentials not configured', Date.now() - start);
      return;
    }

    // Import and test the Amadeus client
    const { AmadeusClient } = await import('./lib/integrations/amadeus-client');
    const client = new AmadeusClient();

    // Test hotel search
    const hotels = await client.searchHotels({
      cityCode: 'NYC',
      checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      adults: 1,
    });

    if (hotels && hotels.length > 0) {
      logTest(testName, 'pass', `Found ${hotels.length} hotels`, Date.now() - start);
    } else {
      logTest(testName, 'pass', 'API connection successful (no hotels found)', Date.now() - start);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logTest(testName, 'fail', `Error: ${message}`, Date.now() - start);
  }
}

async function testUnsplashImageService(): Promise<void> {
  const start = Date.now();
  const testName = 'Unsplash Image Service';

  try {
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!apiKey || apiKey === 'test-unsplash-key') {
      logTest(testName, 'skip', 'Unsplash API key not configured', Date.now() - start);
      return;
    }

    // Import and test the image service
    const { ImageService } = await import('./lib/media');
    const service = new ImageService();

    if (!service.isAvailable()) {
      logTest(testName, 'skip', 'Image service not available', Date.now() - start);
      return;
    }

    // Test photo search
    const result = await service.searchPhotos({
      query: 'Paris travel',
      count: 3,
      orientation: 'landscape',
    });

    if (result.photos.length > 0) {
      logTest(testName, 'pass', `Found ${result.photos.length} photos from ${result.source}`, Date.now() - start);
    } else {
      logTest(testName, 'fail', 'No photos found', Date.now() - start);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logTest(testName, 'fail', `Error: ${message}`, Date.now() - start);
  }
}

async function testAnthropicLLM(): Promise<void> {
  const start = Date.now();
  const testName = 'Anthropic Claude LLM';

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'sk-ant-test-key-for-build-only') {
      logTest(testName, 'skip', 'Anthropic API key not configured', Date.now() - start);
      return;
    }

    // Import and test LLM
    const { ChatAnthropic } = await import('@langchain/anthropic');

    const llm = new ChatAnthropic({
      modelName: 'claude-3-5-sonnet-20241022',
      anthropicApiKey: apiKey,
      temperature: 0,
    });

    // Simple test query
    const response = await llm.invoke('Say "test successful" if you can read this');

    if (response && response.content) {
      logTest(testName, 'pass', 'LLM connection successful', Date.now() - start);
    } else {
      logTest(testName, 'fail', 'No response from LLM', Date.now() - start);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logTest(testName, 'fail', `Error: ${message}`, Date.now() - start);
  }
}

async function testDatabaseConnection(): Promise<void> {
  const start = Date.now();
  const testName = 'Database Connection';

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      logTest(testName, 'skip', 'DATABASE_URL not configured', Date.now() - start);
      return;
    }

    // Import Prisma client
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Test connection with a simple query
    await prisma.$connect();
    const userCount = await prisma.user.count();

    await prisma.$disconnect();

    logTest(testName, 'pass', `Connected successfully (${userCount} users)`, Date.now() - start);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logTest(testName, 'fail', `Error: ${message}`, Date.now() - start);
  }
}

async function runAllTests() {
  console.log('\n🧪 API Integration Test Suite');
  console.log('='.repeat(60));
  console.log('\nTesting all external API integrations...\n');

  // Run all tests
  await testDatabaseConnection();
  await testAmadeusFlightSearch();
  await testAmadeusHotelSearch();
  await testUnsplashImageService();
  await testAnthropicLLM();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  console.log(`\n⏱️  Total Duration: ${totalDuration}ms`);

  // Environment info
  console.log('\n' + '='.repeat(60));
  console.log('🔧 Environment Configuration');
  console.log('='.repeat(60));

  // Helper to check if API key is actually configured (not a dummy value)
  const isConfigured = (key: string, value: string | undefined): boolean => {
    if (!value) return false;

    // Check against actual dummy values used in tests
    const dummyValues = [
      'test-amadeus-key',
      'test-amadeus-secret',
      'test-unsplash-key',
      'test-maps-key',
      'test-mapbox-token',
      'sk-ant-test-key-for-build-only',
    ];

    return !dummyValues.includes(value);
  };

  const envVars = [
    'DATABASE_URL',
    'ANTHROPIC_API_KEY',
    'AMADEUS_API_KEY',
    'AMADEUS_API_SECRET',
    'UNSPLASH_ACCESS_KEY',
    'GOOGLE_MAPS_API_KEY',
    'MAPBOX_ACCESS_TOKEN',
  ];

  console.log('');
  envVars.forEach(key => {
    const value = process.env[key];
    const status = isConfigured(key, value)
      ? '✅ Configured'
      : '⚠️  Not configured (using dummy value)';
    console.log(`${key}: ${status}`);
  });

  console.log('\n' + '='.repeat(60));

  // Exit with appropriate code
  if (failed > 0) {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  } else if (passed === 0 && skipped === total) {
    console.log('\n⚠️  All tests skipped (no API keys configured)');
    console.log('This is normal for CI/CD without secrets');
    process.exit(0);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
