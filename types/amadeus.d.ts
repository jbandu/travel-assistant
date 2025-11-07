/**
 * Type declarations for amadeus package
 * https://github.com/amadeus4dev/amadeus-node
 */

declare module 'amadeus' {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: 'test' | 'production';
  }

  interface FlightOffersSearchParams {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: string;
    nonStop?: boolean;
    currencyCode?: string;
    max?: number;
  }

  interface AmadeusResponse {
    data: any;
    result: any;
  }

  class Amadeus {
    constructor(config: AmadeusConfig);

    shopping: {
      flightOffersSearch: {
        get(params: FlightOffersSearchParams): Promise<AmadeusResponse>;
      };
    };
  }

  export default Amadeus;
}
