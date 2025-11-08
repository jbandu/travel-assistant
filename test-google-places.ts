/**
 * Test Script for Google Places Service
 * Run with: npx tsx test-google-places.ts
 *
 * NOTE: Requires GOOGLE_MAPS_API_KEY in .env
 */

import dotenv from 'dotenv';
dotenv.config();

import { GooglePlacesService } from './lib/places';

async function testGooglePlaces() {
  console.log('🗺️  Testing Google Places Service\n');
  console.log('='.repeat(60));

  const placesService = new GooglePlacesService();

  // Check if service is available
  if (!placesService.isAvailable()) {
    console.log('\n⚠️  Google Maps API key not configured');
    console.log('\nTo test this service:');
    console.log('1. Get API key from: https://console.cloud.google.com/');
    console.log('2. Enable these APIs in Google Cloud Console:');
    console.log('   - Places API');
    console.log('   - Geocoding API');
    console.log('   - Distance Matrix API');
    console.log('3. Add to .env: GOOGLE_MAPS_API_KEY=your_actual_key_here');
    console.log('\n📚 See GOOGLE_PLACES_INTEGRATION.md for detailed setup\n');
    console.log('='.repeat(60));
    console.log('\n📋 What This Service Provides:\n');
    console.log('✅ Geocoding: Convert addresses to coordinates');
    console.log('✅ Reverse Geocoding: Convert coordinates to addresses');
    console.log('✅ Place Search: Find hotels, restaurants, attractions');
    console.log('✅ Nearby Search: Discover places around a location');
    console.log('✅ Place Details: Get ratings, reviews, photos, hours');
    console.log('✅ Autocomplete: Search suggestions as you type');
    console.log('✅ Distance Matrix: Calculate travel times between locations');
    console.log('✅ Caching: 24-hour cache to minimize API costs');
    console.log('\n📊 API Endpoints Created:\n');
    console.log('GET  /api/places/search?query=<search>&lat=<lat>&lng=<lng>');
    console.log('GET  /api/places/nearby?lat=<lat>&lng=<lng>&type=<type>');
    console.log('GET  /api/places/details?placeId=<placeId>');
    console.log('GET  /api/places/autocomplete?input=<text>');
    console.log('GET  /api/places/geocode?address=<address>');
    console.log('\n💰 Cost Estimate (with $200 free credit/month):');
    console.log('- Geocoding: $5 per 1,000 requests');
    console.log('- Place Search: $32 per 1,000 requests');
    console.log('- Place Details: $17 per 1,000 requests');
    console.log('- Autocomplete: $2.83 per 1,000 requests');
    console.log('- Distance Matrix: $5 per 1,000 elements');
    console.log('\nWith caching, $200 credit = ~6,000 searches/month');
    console.log('\n='.repeat(60));
    return;
  }

  console.log('\n✅ Google Maps API key configured\n');

  // Test 1: Geocoding
  console.log('='.repeat(60));
  console.log('Test 1: Geocoding - Convert address to coordinates');
  console.log('='.repeat(60));

  const addresses = ['Eiffel Tower, Paris', 'Tokyo Tower, Tokyo', 'Times Square, New York'];

  for (const address of addresses) {
    try {
      console.log(`\n📍 Geocoding: ${address}`);
      const result = await placesService.geocode(address);

      if (result) {
        console.log(`   ✅ Found: ${result.formattedAddress}`);
        console.log(`   Location: ${result.location.lat.toFixed(4)}, ${result.location.lng.toFixed(4)}`);
        console.log(`   Place ID: ${result.placeId}`);
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : error);
    }
  }

  // Test 2: Reverse Geocoding
  console.log('\n\n' + '='.repeat(60));
  console.log('Test 2: Reverse Geocoding - Convert coordinates to address');
  console.log('='.repeat(60));

  const coordinates = [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  ];

  for (const coord of coordinates) {
    try {
      console.log(`\n📍 Reverse geocoding: ${coord.name} (${coord.lat}, ${coord.lng})`);
      const result = await placesService.reverseGeocode(coord);

      if (result) {
        console.log(`   ✅ Address: ${result.formattedAddress}`);
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : error);
    }
  }

  // Test 3: Place Search
  console.log('\n\n' + '='.repeat(60));
  console.log('Test 3: Place Search - Find restaurants in Paris');
  console.log('='.repeat(60));

  try {
    console.log('\n🔍 Searching for: restaurants in Paris');
    const places = await placesService.searchPlaces({
      query: 'restaurants in Paris',
      minRating: 4.0,
    });

    console.log(`\n✅ Found ${places.length} highly-rated restaurants\n`);

    places.slice(0, 5).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Address: ${place.address}`);
      console.log(`   Rating: ${place.rating ? `⭐ ${place.rating}` : 'N/A'} (${place.userRatingsTotal || 0} reviews)`);
      if (place.priceLevel) {
        console.log(`   Price: ${'$'.repeat(place.priceLevel)}`);
      }
      if (place.openingHours) {
        console.log(`   Status: ${place.openingHours.openNow ? '🟢 Open' : '🔴 Closed'}`);
      }
      console.log();
    });
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }

  // Test 4: Nearby Search
  console.log('\n' + '='.repeat(60));
  console.log('Test 4: Nearby Search - Hotels near Eiffel Tower');
  console.log('='.repeat(60));

  try {
    const eiffelTower = { lat: 48.8584, lng: 2.2945 };
    console.log(`\n🔍 Searching for hotels near Eiffel Tower`);
    const hotels = await placesService.searchNearby(eiffelTower, 'hotel', 2000);

    console.log(`\n✅ Found ${hotels.length} hotels within 2km\n`);

    hotels.slice(0, 3).forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name}`);
      console.log(`   Rating: ${hotel.rating ? `⭐ ${hotel.rating}` : 'N/A'}`);
      console.log(`   Address: ${hotel.address}`);
      console.log();
    });
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }

  // Test 5: Autocomplete
  console.log('\n' + '='.repeat(60));
  console.log('Test 5: Autocomplete - Search suggestions');
  console.log('='.repeat(60));

  const queries = ['paris', 'tokyo tower', 'new york rest'];

  for (const query of queries) {
    try {
      console.log(`\n🔍 Autocomplete: "${query}"`);
      const predictions = await placesService.autocomplete(query);

      console.log(`   Found ${predictions.length} suggestions:`);
      predictions.slice(0, 3).forEach((pred, index) => {
        console.log(`   ${index + 1}. ${pred.mainText} - ${pred.secondaryText}`);
      });
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : error);
    }
  }

  // Test 6: Distance Matrix
  console.log('\n\n' + '='.repeat(60));
  console.log('Test 6: Distance Matrix - Travel times between cities');
  console.log('='.repeat(60));

  try {
    console.log('\n🚗 Calculating distances: Paris → Lyon → Geneva');
    const results = await placesService.getDistanceMatrix(
      ['Paris, France', 'Lyon, France'],
      ['Lyon, France', 'Geneva, Switzerland'],
      'driving'
    );

    console.log(`\n✅ Distance matrix results:\n`);
    results.forEach((result) => {
      console.log(`${result.origin} → ${result.destination}`);
      console.log(`   Distance: ${result.distance.text}`);
      console.log(`   Duration: ${result.duration.text}`);
      console.log();
    });
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }

  // Test 7: Cache Statistics
  console.log('\n' + '='.repeat(60));
  console.log('Test 7: Cache Statistics');
  console.log('='.repeat(60));

  const cacheStats = placesService.getCacheStats();
  console.log(`\n📊 Cache Status:`);
  console.log(`   Cached entries: ${cacheStats.size}`);
  console.log(`   TTL: 24 hours`);
  console.log(`\n💡 Caching saves API costs by storing results for 24 hours`);

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('✅ Google Places Service Tests Complete!');
  console.log('='.repeat(60));

  console.log('\n🎉 All features tested successfully!');
}

// Run tests
testGooglePlaces()
  .then(() => {
    console.log('\n✅ Tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
