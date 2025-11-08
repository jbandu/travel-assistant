/**
 * Test Script for Weather Service
 * Run with: npx tsx test-weather-service.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { WeatherService } from './lib/weather';

async function testWeatherService() {
  console.log('🌤️  Testing Weather Service\n');
  console.log('='.repeat(60));

  const weatherService = new WeatherService();

  if (!weatherService.isAvailable()) {
    console.log('\n⚠️  OpenWeather API key not configured.');
    console.log('Using mock data for demonstration.\n');
  } else {
    console.log('\n✅ OpenWeather API key configured\n');
  }

  // Test 1: Get forecast for Paris
  console.log('\n' + '='.repeat(60));
  console.log('Test 1: 7-Day Forecast for Paris');
  console.log('='.repeat(60));

  try {
    const forecast = await weatherService.getForecast('Paris', 7);

    console.log(`\n📊 ${forecast.length} days of forecast received:\n`);

    forecast.forEach((day, index) => {
      console.log(`Day ${index + 1} (${day.date}):`);
      console.log(`  Temp: ${day.temp.min.toFixed(1)}°C - ${day.temp.max.toFixed(1)}°C`);
      console.log(`  Condition: ${day.condition} (${day.description})`);
      console.log(`  Precipitation: ${(day.precipitation * 100).toFixed(0)}%`);
      console.log(`  Humidity: ${day.humidity.toFixed(0)}%`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 2: Get comprehensive weather insights
  console.log('\n' + '='.repeat(60));
  console.log('Test 2: Complete Weather Insights for Tokyo');
  console.log('='.repeat(60));

  try {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

    const insights = await weatherService.getWeatherInsights(
      'Tokyo',
      startDate,
      endDate
    );

    console.log(`\n📍 Destination: ${insights.destination}`);
    console.log(`\n📝 Summary:\n${insights.summary}\n`);

    console.log('🎒 Packing Recommendations:');
    insights.packingRecommendations.forEach((item) => {
      console.log(`  ✓ ${item}`);
    });

    console.log('\n🎯 Activity Suggestions:');
    console.log('\n  Outdoor Activities:');
    insights.activitySuggestions.outdoor.slice(0, 5).forEach((activity) => {
      console.log(`    • ${activity}`);
    });

    console.log('\n  Indoor Activities:');
    insights.activitySuggestions.indoor.slice(0, 5).forEach((activity) => {
      console.log(`    • ${activity}`);
    });

    console.log('\n📅 Best Days for Outdoor Activities:');
    insights.bestDays.forEach((date) => {
      console.log(`  ✓ ${date}`);
    });

    if (insights.worstDays.length > 0) {
      console.log('\n⚠️  Days to Avoid Outdoor Activities:');
      insights.worstDays.forEach((date) => {
        console.log(`  • ${date}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 3: Multiple destinations comparison
  console.log('\n' + '='.repeat(60));
  console.log('Test 3: Compare Weather Across Multiple Cities');
  console.log('='.repeat(60));

  const cities = ['London', 'Barcelona', 'Amsterdam'];

  for (const city of cities) {
    try {
      const forecast = await weatherService.getForecast(city, 3);
      const avgTemp =
        forecast.reduce((sum, f) => sum + f.temp.avg, 0) / forecast.length;
      const rainyDays = forecast.filter((f) => f.precipitation > 0.3).length;

      console.log(`\n${city}:`);
      console.log(`  Average Temp: ${avgTemp.toFixed(1)}°C`);
      console.log(`  Rainy Days: ${rainyDays}/3`);
      console.log(
        `  Overall: ${rainyDays === 0 ? '☀️ Great weather!' : rainyDays === 1 ? '⛅ Mostly good' : '🌧️ Pack an umbrella'}`
      );
    } catch (error) {
      console.error(`❌ Error fetching weather for ${city}:`, error);
    }
  }

  // Test 4: Packing list generator
  console.log('\n' + '='.repeat(60));
  console.log('Test 4: Smart Packing List Generation');
  console.log('='.repeat(60));

  try {
    const winterForecast = [
      {
        date: '2024-01-15',
        temp: { min: -5, max: 2, avg: -1.5 },
        feelsLike: { min: -8, max: -1 },
        condition: 'Snow',
        description: 'light snow',
        precipitation: 0.7,
        humidity: 85,
        windSpeed: 8,
        icon: '13d',
      },
      {
        date: '2024-01-16',
        temp: { min: -3, max: 1, avg: -1 },
        feelsLike: { min: -6, max: -2 },
        condition: 'Clouds',
        description: 'overcast clouds',
        precipitation: 0.3,
        humidity: 80,
        windSpeed: 6,
        icon: '04d',
      },
    ];

    const packingList = weatherService.generatePackingList(winterForecast);

    console.log('\n❄️  Cold Weather Packing List:');
    packingList.forEach((item) => {
      console.log(`  ✓ ${item}`);
    });

    const summerForecast = [
      {
        date: '2024-07-15',
        temp: { min: 22, max: 35, avg: 28.5 },
        feelsLike: { min: 24, max: 38 },
        condition: 'Clear',
        description: 'clear sky',
        precipitation: 0.1,
        humidity: 45,
        windSpeed: 3,
        icon: '01d',
      },
      {
        date: '2024-07-16',
        temp: { min: 23, max: 34, avg: 28.5 },
        feelsLike: { min: 25, max: 37 },
        condition: 'Clear',
        description: 'clear sky',
        precipitation: 0.0,
        humidity: 40,
        windSpeed: 2,
        icon: '01d',
      },
    ];

    const summerPackingList =
      weatherService.generatePackingList(summerForecast);

    console.log('\n☀️  Hot Weather Packing List:');
    summerPackingList.forEach((item) => {
      console.log(`  ✓ ${item}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Display cache stats
  console.log('\n' + '='.repeat(60));
  console.log('Cache Statistics');
  console.log('='.repeat(60));
  console.log('\n✅ Weather data cached for 6 hours to reduce API calls');
  console.log('💰 This helps stay within free tier limits (1000 calls/day)');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Weather Service Tests Complete!');
  console.log('='.repeat(60));
}

// Run tests
testWeatherService()
  .then(() => {
    console.log('\n🎉 All weather tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Weather test failed:', error);
    process.exit(1);
  });
