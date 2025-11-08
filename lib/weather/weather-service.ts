/**
 * Weather Service - OpenWeather API Integration
 * Provides weather forecasts, packing lists, and activity suggestions
 */

import {
  WeatherForecast,
  WeatherInsight,
  WeatherAlert,
  OpenWeatherForecastResponse,
  PackingItem,
  ActivitySuggestion,
} from './types';

export class WeatherService {
  private apiKey: string;
  private baseURL: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number; // 6 hours in milliseconds

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENWEATHER_API_KEY || '';
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
    this.cacheTTL = 6 * 60 * 60 * 1000; // 6 hours

    if (!this.apiKey) {
      console.warn('⚠️  OpenWeather API key not configured.');
    }
  }

  /**
   * Get weather forecast for a destination
   */
  async getForecast(
    city: string,
    days: number = 7
  ): Promise<WeatherForecast[]> {
    if (!this.apiKey) {
      return this.getMockForecast(city, days);
    }

    const cacheKey = `forecast-${city}-${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`☁️  Using cached weather for ${city}`);
      return cached;
    }

    try {
      const response = await fetch(
        `${this.baseURL}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&cnt=${days * 8}` // 8 forecasts per day (3-hour intervals)
      );

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.statusText}`);
      }

      const data: OpenWeatherForecastResponse = await response.json();
      const forecast = this.parseForecast(data, days);

      this.setCache(cacheKey, forecast);
      return forecast;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockForecast(city, days);
    }
  }

  /**
   * Get comprehensive weather insights with packing and activities
   */
  async getWeatherInsights(
    city: string,
    startDate: Date,
    endDate: Date
  ): Promise<WeatherInsight> {
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const forecast = await this.getForecast(city, Math.min(days, 7));

    const packingRecommendations = this.generatePackingList(forecast);
    const activitySuggestions = this.generateActivitySuggestions(forecast);
    const { bestDays, worstDays } = this.analyzeBestDays(forecast);
    const summary = this.generateWeatherSummary(city, forecast);

    return {
      destination: city,
      coordinates: { lat: 0, lon: 0 }, // Would come from geocoding in production
      forecast,
      packingRecommendations,
      activitySuggestions,
      bestDays,
      worstDays,
      summary,
    };
  }

  /**
   * Parse OpenWeather API response into our forecast format
   */
  private parseForecast(
    data: OpenWeatherForecastResponse,
    days: number
  ): WeatherForecast[] {
    const dailyForecasts: Map<string, any[]> = new Map();

    // Group by date
    data.list.forEach((item) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, []);
      }
      dailyForecasts.get(date)!.push(item);
    });

    const forecasts: WeatherForecast[] = [];

    dailyForecasts.forEach((items, date) => {
      const temps = items.map((i) => i.main.temp);
      const feelsLike = items.map((i) => i.main.feels_like);

      forecasts.push({
        date,
        temp: {
          min: Math.min(...temps),
          max: Math.max(...temps),
          avg: temps.reduce((a, b) => a + b, 0) / temps.length,
        },
        feelsLike: {
          min: Math.min(...feelsLike),
          max: Math.max(...feelsLike),
        },
        condition: items[0].weather[0].main,
        description: items[0].weather[0].description,
        precipitation: Math.max(...items.map((i) => i.pop)),
        humidity: items.reduce((a, b) => a + b.main.humidity, 0) / items.length,
        windSpeed: items.reduce((a, b) => a + b.wind.speed, 0) / items.length,
        icon: items[0].weather[0].icon,
      });
    });

    return forecasts.slice(0, days);
  }

  /**
   * Generate packing list based on weather forecast
   */
  generatePackingList(forecast: WeatherForecast[]): string[] {
    const items = new Set<string>();
    const avgTemp =
      forecast.reduce((sum, f) => sum + f.temp.avg, 0) / forecast.length;
    const maxTemp = Math.max(...forecast.map((f) => f.temp.max));
    const minTemp = Math.min(...forecast.map((f) => f.temp.min));
    const willRain = forecast.some((f) => f.precipitation > 0.3);
    const heavyRain = forecast.some((f) => f.precipitation > 0.7);
    const hotDays = forecast.filter((f) => f.temp.max > 30).length;
    const coldDays = forecast.filter((f) => f.temp.min < 10).length;

    // Temperature-based clothing
    if (avgTemp < 0) {
      items.add('Heavy winter coat');
      items.add('Thermal underwear');
      items.add('Insulated gloves');
      items.add('Winter hat');
      items.add('Warm boots');
      items.add('Scarf');
    } else if (avgTemp < 10) {
      items.add('Warm jacket');
      items.add('Long pants');
      items.add('Sweaters');
      items.add('Light gloves');
      items.add('Closed-toe shoes');
    } else if (avgTemp < 20) {
      items.add('Light jacket or cardigan');
      items.add('Long and short pants');
      items.add('Light sweater');
      items.add('Comfortable walking shoes');
    } else if (avgTemp < 30) {
      items.add('Light, breathable clothing');
      items.add('Shorts and t-shirts');
      items.add('Sunglasses');
      items.add('Sun hat');
      items.add('Comfortable sandals');
    } else {
      items.add('Very light, loose clothing');
      items.add('Breathable fabrics (cotton, linen)');
      items.add('Wide-brimmed sun hat');
      items.add('Sunglasses');
      items.add('Light sandals');
    }

    // Sun protection
    if (hotDays > 0 || maxTemp > 25) {
      items.add('Sunscreen (SPF 30+)');
      items.add('Sunglasses');
      items.add('Hat or cap');
    }

    // Rain protection
    if (willRain) {
      items.add('Umbrella');
      items.add('Rain jacket or poncho');
      if (heavyRain) {
        items.add('Waterproof shoes');
        items.add('Waterproof bag');
      }
    }

    // Temperature variation
    if (maxTemp - minTemp > 15) {
      items.add('Layers for temperature changes');
      items.add('Light jacket for evenings');
    }

    // Always useful items
    items.add('Comfortable walking shoes');
    items.add('Refillable water bottle');

    return Array.from(items);
  }

  /**
   * Generate activity suggestions based on weather
   */
  generateActivitySuggestions(forecast: WeatherForecast[]): {
    indoor: string[];
    outdoor: string[];
  } {
    const indoor: string[] = [];
    const outdoor: string[] = [];

    const avgTemp =
      forecast.reduce((sum, f) => sum + f.temp.avg, 0) / forecast.length;
    const rainyDays = forecast.filter((f) => f.precipitation > 0.5).length;
    const sunnyDays = forecast.filter(
      (f) => f.condition === 'Clear' || f.condition === 'Clouds'
    ).length;

    // Indoor activities (useful on rainy days)
    if (rainyDays > 0) {
      indoor.push('Visit museums and art galleries');
      indoor.push('Explore indoor markets');
      indoor.push('Try local restaurants and cafes');
      indoor.push('Visit shopping centers');
      indoor.push('Attend cultural performances or theater');
      indoor.push('Relax at spa or wellness centers');
    } else {
      indoor.push('Visit museums on less crowded days');
      indoor.push('Explore local cuisine');
      indoor.push('Shop for local crafts');
    }

    // Outdoor activities
    if (sunnyDays > 3 && avgTemp > 15 && avgTemp < 30) {
      outdoor.push('Walking tours of historic districts');
      outdoor.push('Outdoor markets and street food');
      outdoor.push('Parks and gardens');
      outdoor.push('Outdoor dining at local cafes');
      outdoor.push('Photography walks');
    }

    if (avgTemp > 25 && sunnyDays > 0) {
      outdoor.push('Beach or waterfront activities');
      outdoor.push('Water sports (swimming, kayaking)');
      outdoor.push('Early morning or sunset walks');
      outdoor.push('Outdoor concerts or events');
    }

    if (avgTemp < 15 && sunnyDays > 0) {
      outdoor.push('Scenic drives');
      outdoor.push('Winter sports (if applicable)');
      outdoor.push('Cozy outdoor cafes with heaters');
      outdoor.push('Nature hikes (dress warmly)');
    }

    return { indoor, outdoor };
  }

  /**
   * Analyze best and worst days for activities
   */
  private analyzeBestDays(forecast: WeatherForecast[]): {
    bestDays: string[];
    worstDays: string[];
  } {
    const scored = forecast.map((f) => {
      let score = 0;

      // Temperature scoring (ideal 15-25°C)
      const tempDiff = Math.abs(f.temp.avg - 20);
      score += Math.max(0, 30 - tempDiff);

      // Weather condition scoring
      if (f.condition === 'Clear') score += 30;
      else if (f.condition === 'Clouds') score += 20;
      else if (f.condition === 'Rain') score -= 20;
      else if (f.condition === 'Thunderstorm') score -= 30;

      // Precipitation scoring
      score -= f.precipitation * 20;

      // Wind scoring
      if (f.windSpeed < 5) score += 10;
      else if (f.windSpeed > 15) score -= 10;

      return { date: f.date, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return {
      bestDays: scored.slice(0, 2).map((d) => d.date),
      worstDays: scored.slice(-2).map((d) => d.date),
    };
  }

  /**
   * Generate weather summary
   */
  private generateWeatherSummary(
    city: string,
    forecast: WeatherForecast[]
  ): string {
    const avgTemp =
      forecast.reduce((sum, f) => sum + f.temp.avg, 0) / forecast.length;
    const minTemp = Math.min(...forecast.map((f) => f.temp.min));
    const maxTemp = Math.max(...forecast.map((f) => f.temp.max));
    const rainyDays = forecast.filter((f) => f.precipitation > 0.3).length;
    const sunnyDays = forecast.filter((f) => f.condition === 'Clear').length;

    let summary = `${city} weather forecast for the next ${forecast.length} days: `;

    // Temperature summary
    if (avgTemp < 10) {
      summary += `Cold weather expected with temperatures ranging from ${Math.round(minTemp)}°C to ${Math.round(maxTemp)}°C. `;
    } else if (avgTemp < 20) {
      summary += `Mild weather with temperatures between ${Math.round(minTemp)}°C and ${Math.round(maxTemp)}°C. `;
    } else if (avgTemp < 30) {
      summary += `Warm and pleasant weather, temperatures from ${Math.round(minTemp)}°C to ${Math.round(maxTemp)}°C. `;
    } else {
      summary += `Hot weather expected with temperatures reaching ${Math.round(maxTemp)}°C. `;
    }

    // Rain summary
    if (rainyDays === 0) {
      summary += 'No rain expected - perfect for outdoor activities! ';
    } else if (rainyDays <= 2) {
      summary += `Light rain possible on ${rainyDays} day${rainyDays > 1 ? 's' : ''}. `;
    } else {
      summary += `Rain expected on ${rainyDays} days - pack an umbrella! `;
    }

    // Sunny days
    if (sunnyDays > forecast.length / 2) {
      summary += 'Mostly sunny conditions throughout your trip.';
    }

    return summary;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Mock forecast for testing/demo
   */
  private getMockForecast(city: string, days: number): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const baseTemp = 20 + Math.random() * 10;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const tempVariation = Math.random() * 10 - 5;
      const conditions = ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'];
      const condition = conditions[i % conditions.length];

      forecasts.push({
        date: date.toISOString().split('T')[0],
        temp: {
          min: baseTemp + tempVariation - 3,
          max: baseTemp + tempVariation + 5,
          avg: baseTemp + tempVariation,
        },
        feelsLike: {
          min: baseTemp + tempVariation - 4,
          max: baseTemp + tempVariation + 4,
        },
        condition,
        description: condition.toLowerCase(),
        precipitation: condition === 'Rain' ? 0.7 : 0.2,
        humidity: 60 + Math.random() * 20,
        windSpeed: 3 + Math.random() * 5,
        icon: '01d',
      });
    }

    return forecasts;
  }

  /**
   * Check if API key is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
