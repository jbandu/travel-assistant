/**
 * Amadeus API Client
 * https://developers.amadeus.com/self-service
 *
 * Get API credentials at: https://developers.amadeus.com/register
 */

import Amadeus from 'amadeus';

export interface AmadeusConfig {
  clientId: string;
  clientSecret: string;
  hostname?: 'test' | 'production';
}

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  currencyCode?: string;
  max?: number;
}

export interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: FlightItinerary[];
  price: FlightPrice;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface FlightSegment {
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface FlightEndpoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface FlightPrice {
  currency: string;
  total: string;
  base: string;
  fees?: Array<{
    amount: string;
    type: string;
  }>;
  grandTotal: string;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: FlightPrice;
  fareDetailsBySegment: Array<{
    segmentId: string;
    cabin: string;
    fareBasis: string;
    class: string;
    includedCheckedBags: {
      quantity: number;
    };
  }>;
}

// Hotel Search Types
export interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  roomQuantity?: number;
  priceRange?: string;
  currency?: string;
  ratings?: string[];
  amenities?: string[];
  radius?: number;
  radiusUnit?: 'KM' | 'MILE';
}

export interface HotelOffer {
  type: string;
  hotel: {
    type: string;
    hotelId: string;
    chainCode: string;
    dupeId: string;
    name: string;
    rating?: string;
    cityCode: string;
    latitude: number;
    longitude: number;
    hotelDistance?: {
      distance: number;
      distanceUnit: string;
    };
    address?: {
      countryCode: string;
    };
    contact?: {
      phone: string;
      fax: string;
    };
    description?: {
      lang: string;
      text: string;
    };
    amenities?: string[];
    media?: Array<{
      uri: string;
      category: string;
    }>;
  };
  available: boolean;
  offers: Array<{
    id: string;
    checkInDate: string;
    checkOutDate: string;
    rateCode: string;
    rateFamilyEstimated?: {
      code: string;
      type: string;
    };
    room: {
      type: string;
      typeEstimated: {
        category: string;
        beds: number;
        bedType: string;
      };
      description: {
        text: string;
        lang: string;
      };
    };
    guests: {
      adults: number;
    };
    price: {
      currency: string;
      base: string;
      total: string;
      variations: {
        average: {
          base: string;
        };
        changes: Array<{
          startDate: string;
          endDate: string;
          total: string;
        }>;
      };
    };
    policies: {
      paymentType: string;
      cancellation?: {
        description: {
          text: string;
        };
        type: string;
      };
    };
    self: string;
  }>;
  self: string;
}

export class AmadeusClient {
  private client: any;
  private useMockData: boolean;

  constructor(config?: AmadeusConfig) {
    const clientId = config?.clientId || process.env.AMADEUS_API_KEY;
    const clientSecret = config?.clientSecret || process.env.AMADEUS_API_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('⚠️  Amadeus API credentials not found. Using mock data.');
      this.useMockData = true;
    } else {
      this.client = new Amadeus({
        clientId,
        clientSecret,
        hostname: config?.hostname || 'test', // Use 'production' for live data
      });
      this.useMockData = false;
    }
  }

  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    if (this.useMockData) {
      return this.getMockFlightOffers(params);
    }

    try {
      const response = await this.client.shopping.flightOffersSearch.get({
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.adults,
        children: params.children || 0,
        infants: params.infants || 0,
        travelClass: params.travelClass || 'ECONOMY',
        nonStop: params.nonStop || false,
        currencyCode: params.currencyCode || 'USD',
        max: params.max || 50,
      });

      return response.data as FlightOffer[];
    } catch (error) {
      console.error('Amadeus API error:', error);
      // Fallback to mock data on error
      return this.getMockFlightOffers(params);
    }
  }

  private getMockFlightOffers(params: FlightSearchParams): FlightOffer[] {
    const { originLocationCode, destinationLocationCode, departureDate, returnDate } = params;

    // Generate realistic mock data
    const basePrice = this.calculateMockPrice(originLocationCode, destinationLocationCode);
    const offers: FlightOffer[] = [];

    // Generate 5-10 mock flight offers
    const numOffers = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < numOffers; i++) {
      const isNonStop = i < 3; // First 3 are non-stop
      const carrier = this.getRandomCarrier();
      const priceVariation = 1 + (Math.random() * 0.4 - 0.2); // ±20%
      const price = (basePrice * priceVariation).toFixed(2);

      offers.push({
        id: `mock-${Date.now()}-${i}`,
        source: 'GDS',
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: !returnDate,
        lastTicketingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        numberOfBookableSeats: Math.floor(Math.random() * 9) + 1,
        itineraries: this.generateMockItineraries(
          originLocationCode,
          destinationLocationCode,
          departureDate,
          returnDate,
          isNonStop,
          carrier
        ),
        price: {
          currency: 'USD',
          total: price,
          base: (parseFloat(price) * 0.85).toFixed(2),
          fees: [
            {
              amount: (parseFloat(price) * 0.15).toFixed(2),
              type: 'SUPPLIER',
            },
          ],
          grandTotal: price,
        },
        pricingOptions: {
          fareType: ['PUBLISHED'],
          includedCheckedBagsOnly: true,
        },
        validatingAirlineCodes: [carrier],
        travelerPricings: [
          {
            travelerId: '1',
            fareOption: 'STANDARD',
            travelerType: 'ADULT',
            price: {
              currency: 'USD',
              total: price,
              base: (parseFloat(price) * 0.85).toFixed(2),
              grandTotal: price,
            },
            fareDetailsBySegment: [
              {
                segmentId: '1',
                cabin: params.travelClass || 'ECONOMY',
                fareBasis: 'VLNNUS',
                class: 'V',
                includedCheckedBags: {
                  quantity: 1,
                },
              },
            ],
          },
        ],
      });
    }

    // Sort by price (ascending)
    return offers.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
  }

  private generateMockItineraries(
    origin: string,
    destination: string,
    departureDate: string,
    returnDate: string | undefined,
    isNonStop: boolean,
    carrier: string
  ): FlightItinerary[] {
    const itineraries: FlightItinerary[] = [];

    // Outbound flight
    const departureTime = new Date(departureDate + 'T' + this.getRandomTime());
    const flightDuration = this.calculateFlightDuration(origin, destination);
    const arrivalTime = new Date(departureTime.getTime() + flightDuration * 60 * 1000);

    const outboundSegments = isNonStop
      ? [this.createMockSegment(origin, destination, departureTime, arrivalTime, carrier, '100')]
      : [
          this.createMockSegment(origin, 'DFW', departureTime, new Date(departureTime.getTime() + (flightDuration * 0.4) * 60 * 1000), carrier, '100'),
          this.createMockSegment('DFW', destination, new Date(departureTime.getTime() + (flightDuration * 0.6) * 60 * 1000), arrivalTime, carrier, '200'),
        ];

    itineraries.push({
      duration: `PT${Math.floor(flightDuration / 60)}H${flightDuration % 60}M`,
      segments: outboundSegments,
    });

    // Return flight (if round-trip)
    if (returnDate) {
      const returnDepartureTime = new Date(returnDate + 'T' + this.getRandomTime());
      const returnArrivalTime = new Date(returnDepartureTime.getTime() + flightDuration * 60 * 1000);

      const returnSegments = isNonStop
        ? [this.createMockSegment(destination, origin, returnDepartureTime, returnArrivalTime, carrier, '300')]
        : [
            this.createMockSegment(destination, 'DFW', returnDepartureTime, new Date(returnDepartureTime.getTime() + (flightDuration * 0.4) * 60 * 1000), carrier, '300'),
            this.createMockSegment('DFW', origin, new Date(returnDepartureTime.getTime() + (flightDuration * 0.6) * 60 * 1000), returnArrivalTime, carrier, '400'),
          ];

      itineraries.push({
        duration: `PT${Math.floor(flightDuration / 60)}H${flightDuration % 60}M`,
        segments: returnSegments,
      });
    }

    return itineraries;
  }

  private createMockSegment(
    origin: string,
    destination: string,
    departure: Date,
    arrival: Date,
    carrier: string,
    flightNumber: string
  ): FlightSegment {
    const duration = Math.floor((arrival.getTime() - departure.getTime()) / (1000 * 60));

    return {
      departure: {
        iataCode: origin,
        at: departure.toISOString(),
      },
      arrival: {
        iataCode: destination,
        at: arrival.toISOString(),
      },
      carrierCode: carrier,
      number: flightNumber,
      aircraft: {
        code: '32A',
      },
      duration: `PT${Math.floor(duration / 60)}H${duration % 60}M`,
      id: `${origin}-${destination}-${flightNumber}`,
      numberOfStops: 0,
      blacklistedInEU: false,
    };
  }

  private calculateMockPrice(origin: string, destination: string): number {
    // Simple distance-based pricing
    const basePrice = 200;
    const perMilePrice = 0.15;

    // Rough distance estimation (in reality, would use actual coordinates)
    const distance = Math.abs(origin.charCodeAt(0) - destination.charCodeAt(0)) * 100 + Math.random() * 500;

    return basePrice + distance * perMilePrice;
  }

  private calculateFlightDuration(origin: string, destination: string): number {
    // Simple duration estimation in minutes
    const distance = Math.abs(origin.charCodeAt(0) - destination.charCodeAt(0)) * 100;
    return Math.floor(distance / 8) + 60; // Rough calculation
  }

  private getRandomTime(): string {
    const hours = Math.floor(Math.random() * 12) + 6; // 6 AM to 6 PM
    const minutes = Math.floor(Math.random() * 4) * 15; // 00, 15, 30, 45
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }

  private getRandomCarrier(): string {
    const carriers = ['AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'KL', 'EK'];
    return carriers[Math.floor(Math.random() * carriers.length)];
  }

  // Hotel Search Methods
  async searchHotels(params: HotelSearchParams): Promise<HotelOffer[]> {
    if (this.useMockData) {
      return this.getMockHotelOffers(params);
    }

    try {
      const response = await this.client.shopping.hotelOffers.get({
        cityCode: params.cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults,
        roomQuantity: params.roomQuantity || 1,
        priceRange: params.priceRange,
        currency: params.currency || 'USD',
        ratings: params.ratings,
        amenities: params.amenities,
        radius: params.radius,
        radiusUnit: params.radiusUnit || 'KM',
      });

      return response.data as HotelOffer[];
    } catch (error) {
      console.error('Amadeus Hotel API error:', error);
      // Fallback to mock data on error
      return this.getMockHotelOffers(params);
    }
  }

  private getMockHotelOffers(params: HotelSearchParams): HotelOffer[] {
    const { cityCode, checkInDate, checkOutDate, adults } = params;

    // Calculate number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const offers: HotelOffer[] = [];
    const numOffers = Math.floor(Math.random() * 6) + 8; // 8-13 hotels

    const hotelChains = ['MAR', 'HIL', 'HYA', 'IHG', 'ACC', 'WYN', 'CHO', 'SON'];
    const hotelTypes = ['Hotel', 'Resort', 'Inn', 'Suites', 'Grand Hotel'];
    const roomTypes = ['Standard', 'Deluxe', 'Superior', 'Executive', 'Suite'];

    for (let i = 0; i < numOffers; i++) {
      const rating = (3 + Math.random() * 2).toFixed(1); // 3.0 - 5.0 stars
      const chain = hotelChains[Math.floor(Math.random() * hotelChains.length)];
      const type = hotelTypes[Math.floor(Math.random() * hotelTypes.length)];
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];

      const pricePerNight = 80 + Math.random() * 400; // $80 - $480 per night
      const totalPrice = (pricePerNight * nights).toFixed(2);
      const basePrice = (parseFloat(totalPrice) * 0.85).toFixed(2);

      offers.push({
        type: 'hotel-offers',
        hotel: {
          type: 'hotel',
          hotelId: `MOCK${chain}${(1000 + i).toString()}`,
          chainCode: chain,
          dupeId: `${chain}${i}`,
          name: `${type} ${cityCode} ${i + 1}`,
          rating,
          cityCode,
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
          hotelDistance: {
            distance: Math.random() * 5,
            distanceUnit: 'KM',
          },
          address: {
            countryCode: 'US',
          },
          contact: {
            phone: '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
            fax: '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
          },
          description: {
            lang: 'EN',
            text: `Experience luxury and comfort at ${type} ${cityCode}. Our ${roomType} rooms feature modern amenities and stunning views.`,
          },
          amenities: this.getRandomAmenities(),
          media: [
            {
              uri: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800`,
              category: 'EXTERIOR',
            },
          ],
        },
        available: true,
        offers: [
          {
            id: `OFFER-${Date.now()}-${i}`,
            checkInDate,
            checkOutDate,
            rateCode: 'RAC',
            rateFamilyEstimated: {
              code: 'PRO',
              type: 'P',
            },
            room: {
              type: 'ROO',
              typeEstimated: {
                category: roomType.toUpperCase(),
                beds: Math.floor(Math.random() * 2) + 1,
                bedType: Math.random() > 0.5 ? 'KING' : 'QUEEN',
              },
              description: {
                text: `Spacious ${roomType} room with ${Math.floor(Math.random() * 2) + 1} bed(s)`,
                lang: 'EN',
              },
            },
            guests: {
              adults,
            },
            price: {
              currency: 'USD',
              base: basePrice,
              total: totalPrice,
              variations: {
                average: {
                  base: pricePerNight.toFixed(2),
                },
                changes: [],
              },
            },
            policies: {
              paymentType: 'guarantee',
              cancellation: {
                description: {
                  text: 'Free cancellation until 24 hours before check-in',
                },
                type: 'FULL_REFUND',
              },
            },
            self: `https://test.api.amadeus.com/v2/shopping/hotel-offers/${i}`,
          },
        ],
        self: `https://test.api.amadeus.com/v2/shopping/hotel-offers?hotelId=MOCK${chain}${i}`,
      });
    }

    // Sort by price (ascending)
    return offers.sort((a, b) => parseFloat(a.offers[0].price.total) - parseFloat(b.offers[0].price.total));
  }

  private getRandomAmenities(): string[] {
    const allAmenities = [
      'WIFI',
      'PARKING',
      'POOL',
      'GYM',
      'SPA',
      'RESTAURANT',
      'BAR',
      'ROOM_SERVICE',
      'BUSINESS_CENTER',
      'AIRPORT_SHUTTLE',
      'PET_FRIENDLY',
      'AIR_CONDITIONING',
    ];

    // Return 4-8 random amenities
    const numAmenities = Math.floor(Math.random() * 5) + 4;
    const shuffled = [...allAmenities].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, numAmenities);
  }
}
