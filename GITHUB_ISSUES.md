# GitHub Issues - API Integration Roadmap

This document contains all user stories and requirements for API integrations and features.

You can create these issues using the GitHub web interface or with the GitHub CLI:

```bash
# Example: Create an issue from this file
gh issue create --title "Issue Title" --body "Body content" --label "priority: critical,api-integration"
```

---

## Phase 1: Critical Priority - Core LLM & Essential APIs

### Issue 1: Implement Multi-Model LLM Router with Claude, OpenAI, and Gemini

**Labels**: `priority: critical`, `ai-ml`, `api-integration`

**Description**:
Implement an intelligent model router that selects the optimal LLM based on query complexity, cost, and availability. This provides redundancy, cost optimization, and leverages each model's strengths.

**Business Value**:
- **Cost Optimization**: Route simple queries to cheaper models (Gemini), complex to Claude
- **Reliability**: Automatic fallback when primary provider is down
- **Performance**: Use best model for each task type

**API Keys Required**:
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/
- `OPENAI_API_KEY` - Get from https://platform.openai.com/
- `GOOGLE_AI_API_KEY` - Get from https://makersuite.google.com/app/apikey

**Acceptance Criteria**:
- [ ] Create `ModelRouter` class that analyzes query complexity
- [ ] Implement routing logic:
  - Simple queries → Gemini Pro (cheapest)
  - Medium complexity → GPT-4o-mini (balanced)
  - Complex reasoning → Claude Sonnet 4 (best)
- [ ] Add automatic fallback on API errors
- [ ] Track token usage per model for cost monitoring
- [ ] Add configuration for model preferences via environment variables
- [ ] Update Trip Planning Agent to use router
- [ ] Add unit tests for routing logic

**Implementation Guide**:

Create `lib/llm/model-router.ts`:
```typescript
export type QueryComplexity = 'simple' | 'medium' | 'complex';
export type ModelProvider = 'anthropic' | 'openai' | 'google';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  maxTokens: number;
  costPer1MTokens: number;
}

export class ModelRouter {
  private models: Record<QueryComplexity, ModelConfig[]>;

  analyzeComplexity(query: string, context: any): QueryComplexity {
    const wordCount = query.split(' ').length;
    const hasContext = context && Object.keys(context).length > 0;

    if (wordCount < 20 && !hasContext) return 'simple';
    if (wordCount > 100 || hasContext) return 'complex';
    return 'medium';
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<Response> {
    const complexity = this.analyzeComplexity(messages[0].content, options?.context);
    const models = this.models[complexity];

    for (const model of models) {
      try {
        return await this.callModel(model, messages, options);
      } catch (error) {
        console.error(`Model ${model.provider} failed, trying fallback...`);
      }
    }
    throw new Error('All models failed');
  }
}
```

**Cost Estimates**:
- Gemini Pro: ~$7/1M tokens (free tier available)
- GPT-4o-mini: ~$0.15/1M input tokens
- Claude Sonnet 4: ~$15/1M tokens
- Expected savings: 40-60% compared to Claude-only approach

**Resources**:
- [Anthropic API Docs](https://docs.anthropic.com/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google AI API Docs](https://ai.google.dev/docs)

**Estimated Effort**: 2-3 days

---

### Issue 2: Integrate Weather API for Trip Planning

**Labels**: `priority: critical`, `api-integration`, `enhancement`

**Description**:
Integrate weather forecasting to provide travelers with accurate weather predictions, packing recommendations, and activity suggestions based on destination weather.

**Business Value**:
- Improve trip planning quality with weather insights
- Reduce customer complaints about unexpected weather
- Increase engagement with packing lists and activity suggestions

**API Keys Required**:
- `OPENWEATHER_API_KEY` - Get from https://openweathermap.org/api (1000 calls/day free)
- Alternative: `WEATHERAPI_KEY` - Get from https://www.weatherapi.com/ (1M calls/month free)

**Acceptance Criteria**:
- [ ] Create weather service client (`lib/weather/weather-service.ts`)
- [ ] Fetch 7-day forecast for destination
- [ ] Display weather in trip planning UI
- [ ] Generate packing recommendations based on forecast
- [ ] Suggest weather-appropriate activities
- [ ] Cache weather data (6-hour TTL) to minimize API calls
- [ ] Handle API errors gracefully with fallback messaging
- [ ] Add weather alerts for severe conditions

**Implementation Guide**:

```typescript
// lib/weather/weather-service.ts
export interface WeatherForecast {
  date: string;
  temp: { min: number; max: number };
  condition: string;
  precipitation: number;
  humidity: number;
}

export interface WeatherInsight {
  destination: string;
  forecast: WeatherForecast[];
  packingRecommendations: string[];
  activitySuggestions: string[];
  alerts?: string[];
}

export class WeatherService {
  async getForecast(city: string, days: number = 7): Promise<WeatherForecast[]> {
    // Implement OpenWeather API call
  }

  generatePackingList(forecast: WeatherForecast[]): string[] {
    const recommendations = [];
    const avgTemp = forecast.reduce((sum, f) => sum + (f.temp.min + f.temp.max) / 2, 0) / forecast.length;

    if (avgTemp < 10) recommendations.push('Heavy jacket', 'Warm layers', 'Gloves');
    else if (avgTemp < 20) recommendations.push('Light jacket', 'Long pants');
    else recommendations.push('Light clothing', 'Sunscreen', 'Hat');

    const willRain = forecast.some(f => f.precipitation > 0.3);
    if (willRain) recommendations.push('Umbrella', 'Rain jacket');

    return recommendations;
  }
}
```

**UI Components**:
- Weather card in trip overview
- 7-day forecast chart
- Packing list checklist
- Weather-based activity recommendations

**Cost**: Free tier sufficient for MVP (1000 calls/day = ~30k trips/month)

**Resources**:
- [OpenWeather API Docs](https://openweathermap.org/api)
- [WeatherAPI Docs](https://www.weatherapi.com/docs/)

**Estimated Effort**: 2 days

---

### Issue 3: Integrate Mapbox for Interactive Trip Maps

**Labels**: `priority: critical`, `api-integration`, `frontend`

**Description**:
Add beautiful, interactive maps to visualize trips, destinations, and routes using Mapbox.

**Business Value**:
- Visual trip planning improves engagement
- Route optimization saves travelers time
- Professional maps increase perceived quality

**API Keys Required**:
- `MAPBOX_ACCESS_TOKEN` - Get from https://account.mapbox.com/ (50k requests/month free)

**Acceptance Criteria**:
- [ ] Install and configure Mapbox GL JS
- [ ] Display destination markers on map
- [ ] Draw routes between multi-city destinations
- [ ] Show points of interest (hotels, activities)
- [ ] Add interactive popups with location details
- [ ] Implement route optimization for multi-day itineraries
- [ ] Mobile-responsive map controls
- [ ] Dark mode support

**Implementation Guide**:

```typescript
// components/trip-map.tsx
'use client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function TripMap({ destinations, activities }) {
  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [destinations[0].lng, destinations[0].lat],
      zoom: 10,
    });

    // Add markers
    destinations.forEach(dest => {
      new mapboxgl.Marker()
        .setLngLat([dest.lng, dest.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${dest.name}</h3>`))
        .addTo(map);
    });

    return () => map.remove();
  }, [destinations]);

  return <div id="map" className="w-full h-96 rounded-lg" />;
}
```

**Features to Implement**:
1. Trip overview map with all destinations
2. Daily itinerary map with activity markers
3. Route optimization algorithm
4. Distance/time calculations between points
5. Nearby attractions layer

**Cost**: Free for MVP (50k requests/month)

**Resources**:
- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/)
- [React Integration Guide](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)

**Estimated Effort**: 3 days

---

### Issue 4: Add Google Maps API for Places and Geocoding

**Labels**: `priority: critical`, `api-integration`, `backend`

**Description**:
Integrate Google Maps APIs for comprehensive location data, geocoding, and place information.

**Business Value**:
- Accurate location data and addresses
- Rich place information (ratings, photos, hours)
- Autocomplete for destination search

**API Keys Required**:
- `GOOGLE_MAPS_API_KEY` - Get from https://console.cloud.google.com/ ($200 free credit/month)

**Acceptance Criteria**:
- [ ] Set up Google Cloud project and enable APIs:
  - Places API
  - Geocoding API
  - Directions API
- [ ] Implement geocoding service for city/address lookup
- [ ] Create places search for hotels, restaurants, activities
- [ ] Add place details fetching (ratings, reviews, photos)
- [ ] Implement autocomplete for destination input
- [ ] Calculate distances and travel times between locations
- [ ] Cache results to minimize API costs
- [ ] Add rate limiting

**Implementation Guide**:

```typescript
// lib/maps/google-maps-service.ts
import { Client } from '@googlemaps/google-maps-services-js';

export class GoogleMapsService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async geocode(address: string) {
    const response = await this.client.geocode({
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });
    return response.data.results[0];
  }

  async searchPlaces(query: string, location: { lat: number; lng: number }) {
    const response = await this.client.placesNearby({
      params: {
        location,
        radius: 5000,
        keyword: query,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });
    return response.data.results;
  }

  async getPlaceDetails(placeId: string) {
    const response = await this.client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'rating', 'formatted_address', 'photos', 'opening_hours'],
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });
    return response.data.result;
  }
}
```

**Use Cases**:
1. Convert city names to coordinates for Mapbox
2. Find nearby restaurants for itinerary
3. Get hotel ratings and reviews
4. Autocomplete destination search
5. Calculate travel times between activities

**Cost**: $200 free credit covers ~40k place searches or 100k geocoding requests

**Resources**:
- [Google Maps Platform Docs](https://developers.google.com/maps/documentation)
- [Places API Guide](https://developers.google.com/maps/documentation/places/web-service)

**Estimated Effort**: 2-3 days

---

### Issue 5: Integrate Unsplash API for Destination Photos

**Labels**: `priority: high`, `api-integration`, `frontend`

**Description**:
Add beautiful, high-quality destination photos to enhance visual appeal of trip planning and destination discovery.

**Business Value**:
- Professional imagery increases engagement
- Visual inspiration drives bookings
- Improves perceived quality of platform

**API Keys Required**:
- `UNSPLASH_ACCESS_KEY` - Get from https://unsplash.com/developers (50 requests/hour free)

**Acceptance Criteria**:
- [ ] Create Unsplash service client
- [ ] Fetch destination photos by city name
- [ ] Display photo galleries in trip planning
- [ ] Add photos to destination cards
- [ ] Implement image lazy loading
- [ ] Add photo attribution (required by Unsplash)
- [ ] Cache images with CDN
- [ ] Fallback to Pexels API if Unsplash fails

**Implementation Guide**:

```typescript
// lib/media/image-service.ts
import { createApi } from 'unsplash-js';

export class ImageService {
  private unsplash;

  constructor() {
    this.unsplash = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY!,
    });
  }

  async getDestinationPhotos(city: string, count: number = 10) {
    const result = await this.unsplash.search.getPhotos({
      query: `${city} travel`,
      perPage: count,
      orientation: 'landscape',
    });

    return result.response?.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnail: photo.urls.small,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      downloadLocation: photo.links.download_location,
    }));
  }

  async trackDownload(downloadLocation: string) {
    // Required by Unsplash API when displaying photos
    await this.unsplash.photos.trackDownload({ downloadLocation });
  }
}
```

**UI Components**:
- Hero image for destination pages
- Photo gallery carousel
- Inspiration grid on homepage
- Background images for trip cards

**Cost**: Free (50 requests/hour = 1200/day sufficient for MVP)

**Resources**:
- [Unsplash API Docs](https://unsplash.com/documentation)
- [Unsplash JS Library](https://github.com/unsplash/unsplash-js)

**Estimated Effort**: 1-2 days

---

### Issue 6: Set Up Resend Email Service

**Labels**: `priority: critical`, `api-integration`, `backend`

**Description**:
Implement transactional email service for booking confirmations, trip reminders, and notifications using Resend with React Email templates.

**Business Value**:
- Professional email communications
- Automated booking confirmations
- Improved customer experience
- Reduced support inquiries

**API Keys Required**:
- `RESEND_API_KEY` - Get from https://resend.com/ (100 emails/day free)

**Acceptance Criteria**:
- [ ] Install Resend and React Email
- [ ] Create email templates:
  - Booking confirmation
  - Trip reminder (3 days before)
  - Itinerary PDF attachment
  - Password reset
  - Welcome email
- [ ] Implement email sending service
- [ ] Add email queue for reliability
- [ ] Track email delivery status
- [ ] Handle bounces and failures
- [ ] Add unsubscribe functionality
- [ ] Test all templates in development

**Implementation Guide**:

```bash
npm install resend react-email @react-email/components
```

```typescript
// lib/email/email-service.ts
import { Resend } from 'resend';
import { BookingConfirmation } from './templates/booking-confirmation';

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendBookingConfirmation(booking: Booking) {
    const { data, error } = await this.resend.emails.send({
      from: 'Travel Assistant <bookings@yourdomain.com>',
      to: booking.user.email,
      subject: `Booking Confirmed: ${booking.destination}`,
      react: BookingConfirmation({ booking }),
    });

    if (error) {
      console.error('Email send failed:', error);
      throw error;
    }

    return data;
  }
}
```

```typescript
// lib/email/templates/booking-confirmation.tsx
import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components';

export function BookingConfirmation({ booking }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>
          <Heading>Your trip to {booking.destination} is confirmed!</Heading>
          <Text>Confirmation Code: {booking.confirmationCode}</Text>
          <Text>Departure: {booking.departureDate}</Text>
          <Text>Return: {booking.returnDate}</Text>
          <Button href={`https://app.com/bookings/${booking.id}`}>
            View Details
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

**Email Templates to Create**:
1. **Booking Confirmation** - Sent immediately after booking
2. **Trip Reminder** - 3 days before departure
3. **Itinerary Summary** - Day before trip with PDF
4. **Flight Delay Alert** - Real-time notifications
5. **Post-Trip Feedback** - After return date

**Cost**: Free for first 100 emails/day, then $20/month for 50k emails

**Resources**:
- [Resend Docs](https://resend.com/docs)
- [React Email Docs](https://react.email/docs)

**Estimated Effort**: 2-3 days

---

## Phase 2: High Priority - Monetization

### Issue 7: Implement Stripe Payment Processing

**Labels**: `priority: high`, `api-integration`, `payment`

**Description**:
Integrate Stripe for secure payment processing, enabling flight and hotel bookings with support for multiple payment methods.

**Business Value**:
- Enable revenue generation through bookings
- Secure payment processing builds trust
- Support for multiple payment methods
- Automated refund handling

**API Keys Required**:
- `STRIPE_SECRET_KEY` - Get from https://dashboard.stripe.com/apikeys
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Acceptance Criteria**:
- [ ] Set up Stripe account and get API keys (test mode)
- [ ] Install Stripe SDK and configure
- [ ] Implement Payment Element for frontend
- [ ] Create payment intent API endpoint
- [ ] Handle successful payments
- [ ] Implement webhook handling for payment events
- [ ] Add refund functionality
- [ ] Support multiple currencies (USD, EUR, GBP)
- [ ] Implement 3D Secure authentication
- [ ] Add payment failure handling
- [ ] Store payment records in database
- [ ] Display payment history to users

**Implementation Guide**:

```typescript
// lib/payment/stripe-service.ts
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata: any) {
    return await this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? amount * 100 : undefined,
    });
  }

  async constructWebhookEvent(body: string, signature: string) {
    return this.stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  }
}
```

```typescript
// app/api/payment/intent/route.ts
export async function POST(req: Request) {
  const { bookingId } = await req.json();
  const booking = await getBooking(bookingId);

  const stripeService = new StripeService();
  const paymentIntent = await stripeService.createPaymentIntent(
    booking.totalAmount,
    booking.currency,
    { bookingId }
  );

  return Response.json({ clientSecret: paymentIntent.client_secret });
}
```

**Frontend Integration**:
```typescript
// components/payment-form.tsx
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export function PaymentForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { error } = await stripe!.confirmPayment({
      elements: elements!,
      confirmParams: {
        return_url: 'https://yourapp.com/booking/success',
      },
    });

    if (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit">Pay Now</button>
    </form>
  );
}
```

**Webhook Handling**:
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  const stripeService = new StripeService();
  const event = await stripeService.constructWebhookEvent(body, signature);

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
  }

  return Response.json({ received: true });
}
```

**Database Schema Updates**:
```prisma
model Payment {
  id                String   @id @default(uuid())
  bookingId         String
  booking           Booking  @relation(fields: [bookingId], references: [id])
  stripePaymentIntentId String @unique
  amount            Decimal  @db.Decimal(10, 2)
  currency          String
  status            String   // succeeded, failed, pending
  paymentMethod     String?  // card, bank_transfer, etc.
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Testing Checklist**:
- [ ] Test with Stripe test cards
- [ ] Test payment success flow
- [ ] Test payment failure scenarios
- [ ] Test 3D Secure authentication
- [ ] Test refund process
- [ ] Test webhook delivery
- [ ] Test multi-currency

**Cost**: 2.9% + $0.30 per successful transaction

**Resources**:
- [Stripe Docs](https://stripe.com/docs)
- [Stripe Payment Element](https://stripe.com/docs/payments/payment-element)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

**Estimated Effort**: 4-5 days

---

### Issue 8: Expand Amadeus Integration (Hotels, POI, Airport Data)

**Labels**: `priority: high`, `api-integration`, `enhancement`

**Description**:
Expand existing Amadeus integration to include hotel search, points of interest, and airport/city data.

**Business Value**:
- Comprehensive travel content from single provider
- Better pricing from direct GDS access
- Unified data model across services

**API Keys Required**:
- Already have: `AMADEUS_API_KEY` and `AMADEUS_API_SECRET`

**Acceptance Criteria**:
- [ ] Implement hotel search by city/dates
- [ ] Add hotel details and availability
- [ ] Fetch points of interest by location
- [ ] Implement airport/city search with autocomplete
- [ ] Add flight delay predictions
- [ ] Cache hotel and POI data (24-hour TTL)
- [ ] Update frontend to display hotel results
- [ ] Create hotel comparison UI
- [ ] Add POI to itinerary builder

**Implementation Guide**:

```typescript
// lib/integrations/amadeus-client.ts (expand existing)

export class AmadeusClient {
  // Add these methods to existing client

  async searchHotels(params: {
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    radius?: number;
    radiusUnit?: 'KM' | 'MILE';
  }) {
    const response = await this.client.shopping.hotelOffers.get({
      cityCode: params.cityCode,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults,
      radius: params.radius || 20,
      radiusUnit: params.radiusUnit || 'KM',
    });

    return response.data;
  }

  async getHotelDetails(hotelId: string) {
    const response = await this.client.shopping.hotelOffersByHotel.get({
      hotelId,
    });

    return response.data;
  }

  async getPointsOfInterest(lat: number, lng: number, radius: number = 5) {
    const response = await this.client.referenceData.locations.pointsOfInterest.get({
      latitude: lat,
      longitude: lng,
      radius,
    });

    return response.data;
  }

  async searchAirportsAndCities(keyword: string) {
    const response = await this.client.referenceData.locations.get({
      keyword,
      subType: ['AIRPORT', 'CITY'].join(','),
    });

    return response.data;
  }

  async predictFlightDelay(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    aircraftCode: string;
    carrierCode: string;
    flightNumber: string;
  }) {
    const response = await this.client.travel.predictions.flightDelay.get(params);

    return response.data;
  }
}
```

**API Endpoints**:
```typescript
// app/api/hotels/search/route.ts
export async function POST(req: Request) {
  const { cityCode, checkIn, checkOut, adults } = await req.json();

  const amadeus = new AmadeusClient();
  const hotels = await amadeus.searchHotels({
    cityCode,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    adults,
  });

  return Response.json(hotels);
}

// app/api/poi/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat')!);
  const lng = parseFloat(searchParams.get('lng')!);

  const amadeus = new AmadeusClient();
  const pois = await amadeus.getPointsOfInterest(lat, lng);

  return Response.json(pois);
}
```

**Features to Build**:
1. Hotel search results page
2. Hotel details modal with photos and amenities
3. POI map layer in trip planner
4. Airport autocomplete in flight search
5. Flight delay probability indicator

**Cost**: Already covered by existing Amadeus API access

**Resources**:
- [Amadeus Hotel Search](https://developers.amadeus.com/self-service/category/hotels)
- [Amadeus POI](https://developers.amadeus.com/self-service/category/destination-content)
- [Amadeus Flight Delay Prediction](https://developers.amadeus.com/self-service/category/air/api-doc/flight-delay-prediction)

**Estimated Effort**: 3-4 days

---

## Phase 3: Medium Priority - Enhanced Experience

### Issue 9: Add Twilio SMS Notifications

**Labels**: `priority: medium`, `api-integration`, `communication`

**Description**:
Implement SMS notifications for critical travel updates, flight delays, and booking confirmations.

**Business Value**:
- Timely notifications improve customer experience
- Reduce missed flights/bookings
- Proactive support reduces complaints

**API Keys Required**:
- `TWILIO_ACCOUNT_SID` - Get from https://www.twilio.com/console
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

**Acceptance Criteria**:
- [ ] Set up Twilio account and get phone number
- [ ] Create SMS service wrapper
- [ ] Implement notification templates:
  - Booking confirmation
  - Flight delay alert
  - Check-in reminder (24h before)
  - Gate change notification
- [ ] Add user phone number collection
- [ ] Implement SMS preferences (opt-in/opt-out)
- [ ] Add rate limiting to prevent spam
- [ ] Track delivery status
- [ ] Handle failed deliveries
- [ ] Support international numbers

**Implementation Guide**:

```typescript
// lib/sms/twilio-service.ts
import twilio from 'twilio';

export class TwilioService {
  private client;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendSMS(to: string, message: string) {
    const result = await this.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    return result;
  }

  async sendFlightDelayAlert(booking: Booking, delay: number) {
    const message = `Flight Alert: Your flight ${booking.flightNumber} is delayed by ${delay} minutes. New departure time: ${booking.newDepartureTime}. Check email for details.`;

    if (booking.user.phoneNumber && booking.user.smsEnabled) {
      await this.sendSMS(booking.user.phoneNumber, message);
    }
  }

  async sendBookingConfirmation(booking: Booking) {
    const message = `Booking Confirmed! Your trip to ${booking.destination} is set for ${booking.departureDate}. Confirmation: ${booking.confirmationCode}. View details: ${booking.url}`;

    if (booking.user.phoneNumber && booking.user.smsEnabled) {
      await this.sendSMS(booking.user.phoneNumber, message);
    }
  }
}
```

**Database Updates**:
```prisma
model User {
  // Add these fields
  phoneNumber   String?
  phoneVerified Boolean @default(false)
  smsEnabled    Boolean @default(false)
}

model SMSLog {
  id          String   @id @default(uuid())
  userId      String
  phoneNumber String
  message     String
  status      String   // sent, delivered, failed
  sid         String   // Twilio message SID
  createdAt   DateTime @default(now())
}
```

**Notification Types**:
1. Booking confirmation (immediate)
2. Check-in reminder (24h before flight)
3. Flight delay (real-time)
4. Gate change (real-time)
5. Trip reminder (3 days before)

**Cost**: ~$0.0075 per SMS (US), varies by country

**Resources**:
- [Twilio SMS Docs](https://www.twilio.com/docs/sms)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)

**Estimated Effort**: 2-3 days

---

### Issue 10: Integrate Additional Travel APIs (Booking.com, Viator, TripAdvisor)

**Labels**: `priority: medium`, `api-integration`, `enhancement`

**Description**:
Expand travel inventory and content with additional provider integrations.

**Business Value**:
- More booking options increase conversion
- Reviews and ratings build trust
- Activities and tours enhance trip value

**API Keys Required**:
- `BOOKING_COM_API_KEY` - Apply at https://www.booking.com/affiliate
- `VIATOR_API_KEY` - Apply at https://www.viator.com/partner
- `TRIPADVISOR_API_KEY` - Apply at https://developer-tripadvisor.com/

**Note**: These APIs typically require:
- Business verification
- Partnership agreements
- 1-2 week approval process
- Revenue sharing or commission structure

**Acceptance Criteria**:
- [ ] Apply for partner access to each API
- [ ] Implement Booking.com hotel search
- [ ] Add Viator activities search
- [ ] Fetch TripAdvisor ratings and reviews
- [ ] Create unified hotel comparison across sources
- [ ] Display activities in destination pages
- [ ] Show ratings on all accommodation and activities
- [ ] Handle affiliate tracking for commissions

**Implementation Guide**:

```typescript
// lib/integrations/booking-com-client.ts
export class BookingComClient {
  async searchHotels(params: {
    city: string;
    checkIn: string;
    checkOut: string;
    adults: number;
  }) {
    // Implementation depends on Booking.com API
    // Usually requires affiliate partnership
  }
}

// lib/integrations/viator-client.ts
export class ViatorClient {
  async searchActivities(destination: string, date?: string) {
    // Search for tours and activities
  }

  async getActivityDetails(productId: string) {
    // Get detailed activity information
  }
}

// lib/integrations/tripadvisor-client.ts
export class TripAdvisorClient {
  async getLocationReviews(locationId: string) {
    // Fetch reviews for hotels/restaurants/attractions
  }

  async searchLocations(query: string) {
    // Search TripAdvisor database
  }
}
```

**Features to Build**:
1. **Hotel Aggregation**: Compare prices from Amadeus + Booking.com
2. **Activities Page**: Browse tours and experiences by destination
3. **Reviews Integration**: Display TripAdvisor ratings everywhere
4. **Unified Search**: Search across all providers

**Timeline**:
- Week 1: Apply for partnerships
- Week 2-3: Await approval
- Week 4: Implement integrations

**Cost**: Usually commission-based (8-15% of bookings)

**Resources**:
- [Booking.com Affiliate Program](https://www.booking.com/affiliate)
- [Viator Partner Hub](https://www.viator.com/partner)
- [TripAdvisor Content API](https://developer-tripadvisor.com/)

**Estimated Effort**: 5-7 days (after API approval)

---

## Phase 4: Optional - Scale & Optimize

### Issue 11: Implement Monitoring and Analytics (Sentry, PostHog)

**Labels**: `priority: medium`, `infrastructure`, `analytics`

**Description**:
Add error tracking, performance monitoring, and product analytics to understand user behavior and system health.

**Business Value**:
- Catch and fix errors before users report them
- Understand user behavior and drop-off points
- Optimize performance based on real data
- Make data-driven product decisions

**API Keys Required**:
- `SENTRY_DSN` - Get from https://sentry.io/
- `POSTHOG_API_KEY` - Get from https://posthog.com/
- `VERCEL_ANALYTICS_ID` - Auto-configured on Vercel

**Acceptance Criteria**:
- [ ] Set up Sentry for error tracking
- [ ] Configure source maps for better stack traces
- [ ] Add custom error boundaries in React
- [ ] Set up PostHog for product analytics
- [ ] Track key user events:
  - Page views
  - Search performed
  - Booking initiated
  - Payment completed
  - Booking cancelled
- [ ] Create analytics dashboard
- [ ] Set up alerts for critical errors
- [ ] Add performance monitoring
- [ ] Track API response times

**Implementation Guide**:

```bash
npm install @sentry/nextjs posthog-js
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

```typescript
// lib/analytics/posthog-client.ts
import posthog from 'posthog-js';

export class Analytics {
  static init() {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: 'https://app.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing();
          }
        },
      });
    }
  }

  static trackEvent(eventName: string, properties?: Record<string, any>) {
    posthog.capture(eventName, properties);
  }

  static identifyUser(userId: string, traits?: Record<string, any>) {
    posthog.identify(userId, traits);
  }
}
```

**Events to Track**:
```typescript
// Track key user actions
Analytics.trackEvent('search_performed', {
  origin: 'NYC',
  destination: 'LAX',
  dates: { departure, return },
});

Analytics.trackEvent('booking_initiated', {
  bookingType: 'flight',
  price: 450,
  currency: 'USD',
});

Analytics.trackEvent('payment_completed', {
  bookingId,
  totalAmount,
  paymentMethod: 'card',
});
```

**Dashboards to Create**:
1. Conversion funnel (search → view → book → pay)
2. Error rates by page
3. API response times
4. User retention cohorts
5. Popular destinations

**Cost**:
- Sentry: Free up to 5k errors/month, then $26/month
- PostHog: Free up to 1M events/month, then $0.00031/event
- Vercel Analytics: Free with Vercel hosting

**Resources**:
- [Sentry Next.js Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [PostHog Next.js Guide](https://posthog.com/docs/libraries/next-js)

**Estimated Effort**: 2 days

---

### Issue 12: Add Vector Database for Semantic Search (Pinecone)

**Labels**: `priority: low`, `ai-ml`, `infrastructure`

**Description**:
Implement semantic search for destinations, hotels, and activities using vector embeddings and Pinecone.

**Business Value**:
- Better search relevance with natural language
- "Find beach destinations similar to Bali"
- Personalized recommendations based on past trips

**API Keys Required**:
- `PINECONE_API_KEY` - Get from https://www.pinecone.io/
- Uses OpenAI for embeddings (already have key)

**Acceptance Criteria**:
- [ ] Set up Pinecone index
- [ ] Generate embeddings for destinations
- [ ] Index all destinations, hotels, activities
- [ ] Implement semantic search API
- [ ] Add "Find similar" feature
- [ ] Integrate with trip planning agent
- [ ] Update search to use hybrid (keyword + semantic)
- [ ] Add personalized recommendations

**Implementation Guide**:

```typescript
// lib/search/vector-search.ts
import { PineconeClient } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export class VectorSearch {
  private pinecone: PineconeClient;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.pinecone = new PineconeClient();
    await this.pinecone.init({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });

    this.embeddings = new OpenAIEmbeddings();
  }

  async indexDestination(destination: {
    id: string;
    name: string;
    description: string;
    tags: string[];
  }) {
    const index = this.pinecone.Index('destinations');

    const embedding = await this.embeddings.embedQuery(
      `${destination.name} ${destination.description} ${destination.tags.join(' ')}`
    );

    await index.upsert({
      upsertRequest: {
        vectors: [{
          id: destination.id,
          values: embedding,
          metadata: {
            name: destination.name,
            tags: destination.tags,
          },
        }],
      },
    });
  }

  async searchSimilar(query: string, topK: number = 10) {
    const index = this.pinecone.Index('destinations');

    const queryEmbedding = await this.embeddings.embedQuery(query);

    const results = await index.query({
      queryRequest: {
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      },
    });

    return results.matches;
  }
}
```

**Use Cases**:
1. Natural language destination search: "warm beaches with good food"
2. Find similar: "More destinations like Santorini"
3. Personalized recommendations based on user history
4. Itinerary similarity matching

**Cost**:
- Pinecone: Free up to 1M vectors (sufficient for MVP)
- OpenAI Embeddings: $0.02 per 1M tokens

**Resources**:
- [Pinecone Docs](https://docs.pinecone.io/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

**Estimated Effort**: 3-4 days

---

### Issue 13: Add Voice Assistant with ElevenLabs

**Labels**: `priority: low`, `ai-ml`, `api-integration`

**Description**:
Implement voice-based trip planning and support using ElevenLabs text-to-speech and OpenAI Whisper speech-to-text.

**Business Value**:
- Hands-free trip planning (great for mobile)
- Accessibility for visually impaired users
- Premium, innovative feature for differentiation

**API Keys Required**:
- `ELEVENLABS_API_KEY` - Get from https://elevenlabs.io/
- `OPENAI_API_KEY` - Already have (for Whisper)

**Acceptance Criteria**:
- [ ] Integrate ElevenLabs for text-to-speech
- [ ] Use OpenAI Whisper for speech-to-text
- [ ] Create voice chat interface
- [ ] Implement voice commands:
  - "Find flights to Paris"
  - "Show me my trips"
  - "What's the weather in Tokyo?"
- [ ] Add voice agent persona
- [ ] Handle background noise gracefully
- [ ] Add voice controls (pause, stop, replay)
- [ ] Mobile voice UI optimization

**Implementation Guide**:

```typescript
// lib/voice/voice-service.ts
import { ElevenLabsClient } from 'elevenlabs';
import OpenAI from 'openai';

export class VoiceService {
  private elevenlabs: ElevenLabsClient;
  private openai: OpenAI;

  constructor() {
    this.elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
    this.openai = new OpenAI();
  }

  async textToSpeech(text: string): Promise<Buffer> {
    const audio = await this.elevenlabs.generate({
      voice: 'Rachel', // Professional female voice
      text,
      model_id: 'eleven_monolingual_v1',
    });

    return Buffer.from(await audio.arrayBuffer());
  }

  async speechToText(audioFile: File): Promise<string> {
    const transcription = await this.openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });

    return transcription.text;
  }
}
```

**Frontend Component**:
```typescript
// components/voice-chat.tsx
export function VoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = async (e) => {
      const audioBlob = new Blob([e.data], { type: 'audio/wav' });
      const text = await transcribeAudio(audioBlob);
      setTranscript(text);

      // Send to agent and get response
      const response = await chatWithAgent(text);
      await playAudioResponse(response);
    };

    recorder.start();
    setIsListening(true);
  };

  return (
    <div>
      <button onClick={startListening}>
        {isListening ? 'Listening...' : 'Start Voice Chat'}
      </button>
      {transcript && <p>You said: {transcript}</p>}
    </div>
  );
}
```

**Cost**:
- ElevenLabs: $5/month for 30k characters
- Whisper: $0.006 per minute of audio

**Resources**:
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [OpenAI Whisper](https://platform.openai.com/docs/guides/speech-to-text)

**Estimated Effort**: 4-5 days

---

### Issue 14: Generate Custom Trip Preview Images with AI

**Labels**: `priority: low`, `ai-ml`, `enhancement`

**Description**:
Generate custom, AI-created trip preview images and promotional graphics using DALL-E or Midjourney.

**Business Value**:
- Unique, personalized trip visualizations
- Marketing materials for social sharing
- Enhanced trip planning experience

**API Keys Required**:
- `OPENAI_API_KEY` - Already have (for DALL-E)
- Alternative: Midjourney via Discord API

**Acceptance Criteria**:
- [ ] Generate trip preview images with DALL-E
- [ ] Create destination mood boards
- [ ] Generate itinerary preview graphics
- [ ] Add "Share on social" feature with custom images
- [ ] Cache generated images
- [ ] Provide multiple style options
- [ ] Mobile-optimized generation

**Implementation Guide**:

```typescript
// lib/ai/image-generation.ts
import OpenAI from 'openai';

export class ImageGenerationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async generateTripPreview(trip: Trip): Promise<string> {
    const prompt = `Create a beautiful, photorealistic travel poster for a trip to ${trip.destination}. Include iconic landmarks, vibrant colors, and a sense of adventure. Style: modern travel photography, professional, inspiring.`;

    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1792x1024',
      quality: 'hd',
      n: 1,
    });

    return response.data[0].url!;
  }

  async generateItineraryGraphic(itinerary: Itinerary): Promise<string> {
    const destinations = itinerary.destinations.join(', ');
    const prompt = `Create an elegant itinerary map graphic showing a journey through ${destinations}. Include subtle map elements, route lines, and destination icons. Style: minimalist, professional, print-ready.`;

    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    });

    return response.data[0].url!;
  }
}
```

**Use Cases**:
1. Trip preview images for sharing
2. Personalized postcards
3. Trip recap graphics
4. Social media marketing
5. Email newsletter images

**Cost**: DALL-E 3 costs $0.04-0.12 per image (depending on quality)

**Resources**:
- [DALL-E API Docs](https://platform.openai.com/docs/guides/images)

**Estimated Effort**: 2 days

---

## Summary & Prioritization

### Immediate (Week 1-2) - Critical
1. ✅ Multi-Model LLM Router - Foundation for all AI features
2. ✅ Weather API Integration - Essential for trip planning
3. ✅ Mapbox Integration - Visual trip experience
4. ✅ Google Maps API - Location data and places
5. ✅ Unsplash Photos - Visual appeal
6. ✅ Resend Email - Critical communication

**Cost**: ~$70-140/month

### Short-term (Week 3-4) - High Priority
7. ✅ Stripe Payments - Enable revenue
8. ✅ Expand Amadeus - More travel content

**Cost**: +Transaction fees

### Medium-term (Month 2) - Enhanced Experience
9. ✅ Twilio SMS - Better notifications
10. ✅ Additional Travel APIs - More inventory

**Cost**: +$20-40/month

### Long-term (Month 3+) - Scale & Optimize
11. ✅ Monitoring & Analytics - Data-driven decisions
12. ⚠️ Vector Search - Advanced AI search
13. ⚠️ Voice Assistant - Premium feature
14. ⚠️ AI Image Generation - Nice to have

**Cost**: +$50-100/month

---

## Environment Variables Template

```bash
# Copy this to .env
# Phase 1: Critical (Week 1-2)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
MAPBOX_ACCESS_TOKEN=
NEXT_PUBLIC_MAPBOX_TOKEN=
GOOGLE_MAPS_API_KEY=
OPENWEATHER_API_KEY=
UNSPLASH_ACCESS_KEY=
RESEND_API_KEY=

# Phase 2: High Priority (Week 3-4)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Phase 3: Medium Priority (Month 2)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
BOOKING_COM_API_KEY=
VIATOR_API_KEY=
TRIPADVISOR_API_KEY=

# Phase 4: Optional (Month 3+)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
POSTHOG_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
ELEVENLABS_API_KEY=
```

---

## Next Steps

1. Review and prioritize these issues
2. Create them in your GitHub repository
3. Start with Phase 1 (Critical) issues
4. Set up a project board to track progress
5. Create milestones for each phase

**Need help creating these issues?** You can:
- Copy/paste each issue into GitHub manually
- Use the GitHub CLI: `gh issue create --title "..." --body "..." --label "..."`
- Create them via the GitHub API
- Use a script to batch-create from this document
