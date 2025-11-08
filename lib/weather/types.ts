/**
 * Weather Service Types
 */

export interface WeatherForecast {
  date: string; // ISO date string
  temp: {
    min: number;
    max: number;
    avg: number;
  };
  feelsLike: {
    min: number;
    max: number;
  };
  condition: string; // e.g., "Clear", "Rain", "Clouds"
  description: string; // e.g., "light rain", "clear sky"
  precipitation: number; // Probability 0-1
  humidity: number; // Percentage 0-100
  windSpeed: number; // m/s
  icon: string; // OpenWeather icon code
}

export interface WeatherAlert {
  event: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  description: string;
  start: string;
  end: string;
}

export interface WeatherInsight {
  destination: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  forecast: WeatherForecast[];
  alerts?: WeatherAlert[];
  packingRecommendations: string[];
  activitySuggestions: {
    indoor: string[];
    outdoor: string[];
  };
  bestDays: string[]; // Dates with best weather
  worstDays: string[]; // Dates with worst weather
  summary: string;
}

export interface PackingItem {
  item: string;
  category: 'clothing' | 'accessories' | 'gear' | 'essentials';
  priority: 'essential' | 'recommended' | 'optional';
  reason: string;
}

export interface ActivitySuggestion {
  activity: string;
  type: 'indoor' | 'outdoor' | 'flexible';
  weatherSuitability: string[];
  reason: string;
}

// OpenWeather API Response Types
export interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    pop: number; // Probability of precipitation
    dt_txt: string;
  }>;
  city: {
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
  };
}

export interface OpenWeatherOneCallResponse {
  lat: number;
  lon: number;
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
      day: number;
    };
    feels_like: {
      day: number;
      night: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number;
    humidity: number;
    wind_speed: number;
  }>;
  alerts?: Array<{
    event: string;
    start: number;
    end: number;
    description: string;
    sender_name: string;
  }>;
}
