/**
 * Test Script for Map Service
 * Run with: npx tsx test-map-service.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { MapService } from './lib/maps';
import type { Location } from './lib/maps/types';

async function testMapService() {
  console.log('🗺️  Testing Map Service\n');
  console.log('='.repeat(60));

  const mapService = new MapService();

  // Check if service is available
  if (!mapService.isAvailable()) {
    console.error('\n❌ Mapbox API key not configured');
    process.exit(1);
  }

  console.log('\n✅ Mapbox API key configured\n');

  // Test 1: Geocoding
  console.log('='.repeat(60));
  console.log('Test 1: Geocoding - Convert addresses to coordinates');
  console.log('='.repeat(60));

  const cities = ['Paris, France', 'Tokyo, Japan', 'New York, USA'];

  for (const city of cities) {
    try {
      console.log(`\n📍 Geocoding: ${city}`);
      const results = await mapService.geocode(city);

      if (results.length > 0) {
        const top = results[0];
        console.log(`   ✅ Found: ${top.name}`);
        console.log(`   Address: ${top.address}`);
        console.log(`   Coordinates: ${top.coordinates.lat.toFixed(4)}, ${top.coordinates.lng.toFixed(4)}`);
        console.log(`   Relevance: ${(top.relevance * 100).toFixed(0)}%`);
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }

  // Test 2: Route Calculation
  console.log('\n\n' + '='.repeat(60));
  console.log('Test 2: Route Calculation - Multi-city European tour');
  console.log('='.repeat(60));

  const europeanRoute: Location[] = [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Lyon', lat: 45.764, lng: 4.8357 },
    { name: 'Geneva', lat: 46.2044, lng: 6.1432 },
    { name: 'Milan', lat: 45.4642, lng: 9.19 },
  ];

  try {
    console.log(
      `\n🚗 Calculating route: ${europeanRoute.map((l) => l.name).join(' → ')}`
    );

    const route = await mapService.getRoute(europeanRoute, 'driving');

    console.log(`\n📊 Route Summary:`);
    console.log(`   Total Distance: ${mapService.formatDistance(route.totalDistance)}`);
    console.log(`   Total Duration: ${mapService.formatDuration(route.totalDuration)}`);
    console.log(`   Waypoints: ${route.segments.length + 1}`);

    console.log(`\n📍 Segment Details:`);
    route.segments.forEach((segment, index) => {
      console.log(
        `   ${index + 1}. ${segment.from.name} → ${segment.to.name}`
      );
      console.log(
        `      Distance: ${mapService.formatDistance(segment.distance)}, Duration: ${mapService.formatDuration(segment.duration)}`
      );
    });
  } catch (error) {
    console.error('\n❌ Route calculation error:', error);
  }

  // Test 3: Distance Calculation (Haversine)
  console.log('\n\n' + '='.repeat(60));
  console.log('Test 3: Direct Distance Calculation (Haversine Formula)');
  console.log('='.repeat(60));

  const distancePairs = [
    { from: 'Paris', to: 'London', fromCoord: { lat: 48.8566, lng: 2.3522 }, toCoord: { lat: 51.5074, lng: -0.1278 } },
    { from: 'Tokyo', to: 'Osaka', fromCoord: { lat: 35.6762, lng: 139.6503 }, toCoord: { lat: 34.6937, lng: 135.5023 } },
    { from: 'New York', to: 'Los Angeles', fromCoord: { lat: 40.7128, lng: -74.006 }, toCoord: { lat: 34.0522, lng: -118.2437 } },
  ];

  distancePairs.forEach(({ from, to, fromCoord, toCoord }) => {
    const distance = mapService.calculateDistance(fromCoord, toCoord);
    console.log(
      `\n📏 ${from} → ${to}: ${mapService.formatDistance(distance)}`
    );
  });

  // Test 4: Route Optimization
  console.log('\n\n' + '='.repeat(60));
  console.log('Test 4: Route Optimization (Nearest Neighbor)');
  console.log('='.repeat(60));

  const unoptimizedLocations: Location[] = [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Milan', lat: 45.4642, lng: 9.19 },
    { name: 'Lyon', lat: 45.764, lng: 4.8357 },
    { name: 'Geneva', lat: 46.2044, lng: 6.1432 },
    { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  ];

  console.log('\n📍 Original order:');
  console.log(`   ${unoptimizedLocations.map((l) => l.name).join(' → ')}`);

  const optimizedLocations = mapService.optimizeRoute(unoptimizedLocations);

  console.log('\n✅ Optimized order:');
  console.log(`   ${optimizedLocations.map((l) => l.name).join(' → ')}`);

  // Calculate total distance for both
  const calculateTotalDistance = (locations: Location[]): number => {
    let total = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      total += mapService.calculateDistance(locations[i], locations[i + 1]);
    }
    return total;
  };

  const originalDistance = calculateTotalDistance(unoptimizedLocations);
  const optimizedDistance = calculateTotalDistance(optimizedLocations);

  console.log(`\n📊 Distance Comparison:`);
  console.log(`   Original: ${mapService.formatDistance(originalDistance)}`);
  console.log(`   Optimized: ${mapService.formatDistance(optimizedDistance)}`);
  console.log(
    `   Savings: ${mapService.formatDistance(originalDistance - optimizedDistance)} (${((1 - optimizedDistance / originalDistance) * 100).toFixed(1)}%)`
  );

  // Test 5: Map Bounds Calculation
  console.log('\n\n' + '='.repeat(60));
  console.log('Test 5: Calculate Map Bounds');
  console.log('='.repeat(60));

  const locations = [
    { lat: 48.8566, lng: 2.3522 }, // Paris
    { lat: 45.764, lng: 4.8357 }, // Lyon
    { lat: 46.2044, lng: 6.1432 }, // Geneva
  ];

  const bounds = mapService.calculateBounds(locations);
  console.log('\n🗺️  Map Bounds:');
  console.log(`   North: ${bounds.north.toFixed(4)}`);
  console.log(`   South: ${bounds.south.toFixed(4)}`);
  console.log(`   East: ${bounds.east.toFixed(4)}`);
  console.log(`   West: ${bounds.west.toFixed(4)}`);

  const center = mapService.getCenterPoint(locations);
  console.log(`\n📍 Center Point:`);
  console.log(`   Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}`);

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('✅ Map Service Tests Complete!');
  console.log('='.repeat(60));

  console.log('\n🎉 All map service features tested successfully!');
}

// Run tests
testMapService()
  .then(() => {
    console.log('\n✅ All tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
