# Mapbox Interactive Maps Integration 🗺️

## Overview

Mapbox GL JS integration provides beautiful, interactive maps for visualizing trips, destinations, and routes in the travel assistant application.

### Why Mapbox?

✅ **Professional** - High-quality, customizable maps
✅ **Interactive** - Pan, zoom, rotate, and tilt
✅ **Feature-Rich** - Markers, routes, popups, custom layers
✅ **Cost-Effective** - 50k requests/month free tier
✅ **Mobile-Friendly** - Responsive and touch-optimized

---

## Features Implemented

### ✅ Interactive Map Component
- **TripMap**: React component for displaying destinations
- Multiple map styles (streets, outdoors, light, dark, satellite)
- Custom markers with popups
- Route visualization between destinations
- Automatic bounds fitting
- Full-screen and navigation controls

### ✅ Map Service
- **Geocoding**: Convert addresses to coordinates
- **Route Calculation**: Get routes between multiple points
- **Distance Calculation**: Haversine formula for direct distances
- **Route Optimization**: Nearest neighbor algorithm
- **Bounds Calculation**: Auto-fit maps to show all locations

### ✅ API Endpoints
- `GET /api/maps/geocode` - Convert addresses to coordinates
- `POST /api/maps/route` - Calculate routes between waypoints

---

## Setup

### 1. API Key Configuration

Your Mapbox token is already configured in `.env`:

```bash
MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoib...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoib...  # For client-side use
```

**Note**: The `NEXT_PUBLIC_` prefix is required for Next.js client components.

### 2. Dependencies Installed

```bash
npm install mapbox-gl @types/mapbox-gl
```

---

## Usage

### Basic Map Component

```typescript
import { TripMap } from '@/components/map';
import type { Location } from '@/lib/maps/types';

const destinations: Location[] = [
  {
    name: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    address: 'Paris, France',
    description: 'City of Light',
    type: 'destination',
  },
  {
    name: 'Lyon',
    lat: 45.764,
    lng: 4.8357,
    address: 'Lyon, France',
    description: 'Gastronomic capital',
    type: 'destination',
  },
];

export default function MyPage() {
  return (
    <TripMap
      destinations={destinations}
      showRoute={true}
      routeMode="driving"
      style="streets"
      height="600px"
    />
  );
}
```

### Map Service (Backend)

```typescript
import { MapService } from '@/lib/maps';

const mapService = new MapService();

// Geocode an address
const results = await mapService.geocode('Paris, France');
console.log(results[0].coordinates); // { lat: 48.8535, lng: 2.3484 }

// Get route between locations
const route = await mapService.getRoute([
  { lat: 48.8566, lng: 2.3522 }, // Paris
  { lat: 45.764, lng: 4.8357 },  // Lyon
], 'driving');

console.log(mapService.formatDistance(route.totalDistance)); // "538.3 km"
console.log(mapService.formatDuration(route.totalDuration)); // "5h 40m"

// Calculate direct distance
const distance = mapService.calculateDistance(
  { lat: 48.8566, lng: 2.3522 },
  { lat: 45.764, lng: 4.8357 }
);

// Optimize route order
const optimized = mapService.optimizeRoute(destinations);
```

---

## TripMap Component API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `destinations` | `Location[]` | **required** | Array of locations to display |
| `showRoute` | `boolean` | `true` | Draw route connecting destinations |
| `routeMode` | `'driving' \| 'walking' \| 'cycling'` | `'driving'` | Transportation mode for routing |
| `style` | `'streets' \| 'outdoors' \| 'light' \| 'dark' \| 'satellite'` | `'streets'` | Map visual style |
| `height` | `string` | `'500px'` | Map container height |
| `zoom` | `number` | `10` | Initial zoom level (1-20) |
| `className` | `string` | `''` | Additional CSS classes |

### Location Type

```typescript
interface Location {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  description?: string;
  type?: 'destination' | 'activity' | 'hotel' | 'restaurant' | 'poi';
}
```

**Marker Colors by Type**:
- `destination`: Blue
- `hotel`: Purple
- `restaurant`: Red
- `activity`: Green
- `poi`: Orange

---

## API Endpoints

### Geocode Endpoint

**GET** `/api/maps/geocode?query=<location>`

```bash
curl "http://localhost:3000/api/maps/geocode?query=Paris,France"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "Paris,France",
    "results": [
      {
        "name": "Paris",
        "coordinates": { "lat": 48.8535, "lng": 2.3484 },
        "address": "Paris, France",
        "placeType": ["place", "locality"],
        "relevance": 1
      }
    ],
    "count": 1
  }
}
```

### Route Endpoint

**POST** `/api/maps/route`

```bash
curl -X POST http://localhost:3000/api/maps/route \
  -H "Content-Type: application/json" \
  -d '{
    "locations": [
      { "lat": 48.8566, "lng": 2.3522 },
      { "lat": 45.764, "lng": 4.8357 }
    ],
    "mode": "driving"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "route": {
      "segments": [...],
      "totalDistance": 538300,
      "totalDuration": 20400,
      "coordinates": [...]
    },
    "summary": {
      "totalDistance": "538.3 km",
      "totalDuration": "5h 40m",
      "mode": "driving",
      "waypoints": 2
    }
  }
}
```

---

## Map Service Methods

### Geocoding

```typescript
async geocode(query: string): Promise<GeocodingResult[]>
```

Convert address or place name to coordinates.

**Example**:
```typescript
const results = await mapService.geocode('Tokyo, Japan');
// Returns array of matching locations with coordinates
```

### Routing

```typescript
async getRoute(
  locations: Coordinates[],
  mode: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<Route>
```

Calculate route between 2+ locations.

**Example**:
```typescript
const route = await mapService.getRoute([
  { lat: 48.8566, lng: 2.3522 },
  { lat: 45.764, lng: 4.8357 },
  { lat: 46.2044, lng: 6.1432 },
], 'driving');
```

### Distance Calculation

```typescript
calculateDistance(from: Coordinates, to: Coordinates): number
```

Calculate direct distance using Haversine formula. Returns meters.

**Example**:
```typescript
const meters = mapService.calculateDistance(
  { lat: 48.8566, lng: 2.3522 },
  { lat: 51.5074, lng: -0.1278 }
);
// Returns: 343600 (meters)
```

### Route Optimization

```typescript
optimizeRoute(locations: Location[]): Location[]
```

Reorder locations to minimize total distance using nearest neighbor algorithm.

**Example**:
```typescript
const optimized = mapService.optimizeRoute([paris, milan, lyon, geneva]);
// Returns locations in optimal visiting order
```

### Utility Methods

```typescript
// Format distance for display
formatDistance(meters: number): string
// Returns: "538.3 km" or "350 m"

// Format duration for display
formatDuration(seconds: number): string
// Returns: "5h 40m" or "45 min"

// Calculate center point
getCenterPoint(locations: Coordinates[]): Coordinates

// Calculate map bounds
calculateBounds(locations: Coordinates[]): MapBounds
```

---

## Map Styles

### Available Styles

1. **streets** (default) - Standard street map
2. **outdoors** - Topographic with trails
3. **light** - Minimal light theme
4. **dark** - Dark mode
5. **satellite** - Satellite imagery with labels

### Changing Styles Dynamically

```typescript
const [mapStyle, setMapStyle] = useState('streets');

<TripMap style={mapStyle} {...props} />
```

---

## Testing

### Run Test Script

```bash
npx tsx test-map-service.ts
```

**Tests Included**:
1. ✅ Geocoding (Paris, Tokyo, New York)
2. ✅ Route calculation (multi-city European tour)
3. ✅ Distance calculation (Haversine)
4. ✅ Route optimization (13.8% savings)
5. ✅ Bounds calculation

**Expected Output**:
```
🗺️  Testing Map Service
✅ Mapbox API key configured

Test 1: Geocoding
   ✅ Found: Paris
   Coordinates: 48.8535, 2.3484

Test 2: Route Calculation
   Total Distance: 1081.4 km
   Total Duration: 12h 21m

Test 4: Route Optimization
   Original: 1715.4 km
   Optimized: 1479.1 km
   Savings: 236.3 km (13.8%)
```

### Test Page

Visit the interactive test page:
```
http://localhost:3000/test-map
```

**Features**:
- Select from 3 sample trips (Europe, Japan, USA)
- Toggle route display on/off
- Switch between transportation modes
- Change map styles
- View destination details

---

## Performance & Optimization

### Caching Strategy

The map service doesn't currently cache results, but you can implement:

```typescript
const cache = new Map<string, any>();

async function cachedGeocode(query: string) {
  if (cache.has(query)) {
    return cache.get(query);
  }

  const results = await mapService.geocode(query);
  cache.set(query, results);
  return results;
}
```

### Loading Strategy

The TripMap component:
- Shows loading spinner while initializing
- Gracefully handles errors
- Lazy loads only when rendered
- Cleans up on unmount

### API Rate Limits

**Mapbox Free Tier**:
- 50,000 map loads/month
- Unlimited geocoding requests
- Unlimited routing requests

**Best Practices**:
- Cache geocoding results
- Debounce user input for search
- Use static images for thumbnails

---

## Integration with TripPlanningAgent

### Example: Add Map Data to Trip Response

```typescript
import { MapService } from '@/lib/maps';

class TripPlanningAgent {
  private mapService: MapService;

  constructor() {
    this.mapService = new MapService();
  }

  async processMessage(message: string) {
    // ... existing LLM processing ...

    // Extract destinations from response
    const destinations = this.extractDestinations(response);

    // Geocode destinations
    const locations = await Promise.all(
      destinations.map(d => this.mapService.geocode(d))
    );

    // Calculate optimal route
    const optimizedLocations = this.mapService.optimizeRoute(
      locations.map(r => r[0])
    );

    // Get route details
    const route = await this.mapService.getRoute(optimizedLocations);

    return {
      message: response.message,
      destinations: optimizedLocations,
      route: {
        distance: this.mapService.formatDistance(route.totalDistance),
        duration: this.mapService.formatDuration(route.totalDuration),
      },
    };
  }
}
```

---

## Advanced Features

### Custom Marker Icons

```typescript
// In TripMap component
const el = document.createElement('div');
el.className = 'custom-marker';
el.style.backgroundImage = 'url(/marker-icon.png)';
el.style.width = '30px';
el.style.height = '40px';

const marker = new mapboxgl.Marker({ element: el })
  .setLngLat([lng, lat])
  .addTo(map);
```

### Custom Popups

```typescript
const popupContent = document.createElement('div');
popupContent.innerHTML = `
  <h3>${destination.name}</h3>
  <img src="${destination.photo}" alt="${destination.name}" />
  <p>${destination.description}</p>
  <button onclick="bookNow()">Book Now</button>
`;

const popup = new mapboxgl.Popup()
  .setDOMContent(popupContent);
```

### Clustering

For many markers, enable clustering:

```typescript
map.addSource('destinations', {
  type: 'geojson',
  data: geojsonData,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50,
});
```

---

## Troubleshooting

### Map Not Loading

**Issue**: Blank map or error

**Solutions**:
1. Check API key is set: `echo $NEXT_PUBLIC_MAPBOX_TOKEN`
2. Verify key format: `pk.eyJ1...` (starts with `pk.`)
3. Check browser console for errors
4. Ensure CSS is imported: `import 'mapbox-gl/dist/mapbox-gl.css'`

### Route Not Displaying

**Issue**: Markers show but no route line

**Solutions**:
1. Verify `showRoute={true}` prop
2. Check destinations array has 2+ items
3. Ensure coordinates are valid (lat: -90 to 90, lng: -180 to 180)
4. Check network tab for API errors

### Geocoding Fails

**Issue**: No results for address search

**Solutions**:
1. Use more specific addresses: "Paris, France" not just "Paris"
2. Check spelling and format
3. Try alternative names (e.g., "Tokyo Prefecture" vs "Tokyo")

### Performance Issues

**Issue**: Map is slow or laggy

**Solutions**:
1. Reduce number of markers (use clustering for 100+)
2. Use simpler map style ('light' instead of 'satellite')
3. Limit route waypoints (max 25)
4. Debounce map updates

---

## Cost Analysis

### Monthly Costs (Free Tier)

| Resource | Limit | Cost |
|----------|-------|------|
| Map loads | 50,000/month | $0 |
| Geocoding | Unlimited | $0 |
| Routing | Unlimited | $0 |
| **Total** | | **$0** |

### Scaling Beyond Free Tier

| Usage | Maps | Geocoding | Routing | Total |
|-------|------|-----------|---------|-------|
| 100k loads/month | $25 | $0 | $0 | $25 |
| 500k loads/month | $125 | $0 | $0 | $125 |
| 1M loads/month | $250 | $0 | $0 | $250 |

**Optimization Tips**:
- Cache geocoding results (most queries repeat)
- Use static map images for thumbnails
- Lazy load interactive maps
- Implement map clustering

---

## Resources

### Documentation
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)
- [React Integration](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)
- [Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Directions API](https://docs.mapbox.com/api/navigation/directions/)

### Examples
- [Mapbox Examples Gallery](https://docs.mapbox.com/mapbox-gl-js/example/)
- [Test Page](http://localhost:3000/test-map) - Local demo

### Support
- [Mapbox Community](https://github.com/mapbox/mapbox-gl-js/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/mapbox-gl-js)

---

## Next Steps

### Recommended Enhancements

1. **📸 Location Photos**
   - Integrate Unsplash for destination photos
   - Show photos in map popups

2. **🏨 Place Details**
   - Add Google Places API for hotels/restaurants
   - Show ratings and reviews on map

3. **🎨 Custom Styling**
   - Create branded map style in Mapbox Studio
   - Match app color scheme

4. **📱 Mobile Optimization**
   - Add geolocation button
   - Optimize touch controls
   - Test on various screen sizes

5. **♿ Accessibility**
   - Add keyboard navigation
   - Screen reader support
   - High contrast mode

---

## Summary

✅ **Mapbox Integration Complete**

**What Was Built**:
- 🗺️ Interactive TripMap component
- 📍 Geocoding service
- 🚗 Route calculation with 3 modes
- 🧭 Route optimization (13.8% savings)
- 🎨 5 map styles
- 📊 2 API endpoints
- 🧪 Comprehensive test suite

**Performance**:
- Geocoding: ~200-500ms
- Route calculation: ~300-800ms
- Map load: ~1-2s

**Cost**: $0/month (within free tier)

---

*Last updated: 2025-11-07*
*Status: ✅ Production ready*
*Next: Integrate with trip planning UI*
