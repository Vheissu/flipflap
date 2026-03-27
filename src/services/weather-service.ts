import { resolve } from 'aurelia';
import type { ContentItem } from '../models/content-item';
import { SettingsService } from './settings-service';

interface WeatherResponse {
  name: string;
  main: {
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  weather: Array<{ main: string }>;
}

export class WeatherService {
  private readonly settings = resolve(SettingsService);
  private cachedWeather: ContentItem | null = null;
  private lastFetch = 0;
  private inflightRefresh: Promise<void> | null = null;

  getCurrentContentItem(): ContentItem {
    void this.refreshIfStale();

    return this.cachedWeather ?? {
      type: 'weather',
      lines: ['WEATHER', 'UNAVAILABLE', 'ADD LOCATION'],
      duration: 15000,
    };
  }

  private async refreshIfStale(): Promise<void> {
    const now = Date.now();
    if (this.inflightRefresh) {
      return this.inflightRefresh;
    }

    if (now - this.lastFetch < 15 * 60 * 1000 && this.cachedWeather) {
      return;
    }

    const apiKey = this.settings.getWeatherApiKey();
    const location = this.settings.getLocation();
    if (!apiKey || !location) {
      this.cachedWeather = {
        type: 'weather',
        lines: ['WEATHER', 'CONFIG NEEDED', location ? 'ADD API KEY' : 'ADD LOCATION'],
        duration: 15000,
      };
      return;
    }

    this.inflightRefresh = (async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) {
          throw new Error(`Weather request failed with ${response.status}`);
        }

        const data = (await response.json()) as WeatherResponse;
        this.cachedWeather = {
          type: 'weather',
          lines: [
            data.name.toUpperCase().slice(0, 22),
            `${Math.round(data.main.temp)}C  ${data.weather[0]?.main?.toUpperCase() ?? 'CLEAR'}`.slice(0, 22),
            `H:${Math.round(data.main.temp_max)}C  L:${Math.round(data.main.temp_min)}C`.slice(0, 22),
          ],
          duration: 15000,
        };
        this.lastFetch = Date.now();
      } catch (error) {
        console.error('Weather fetch failed:', error);
        this.cachedWeather = {
          type: 'weather',
          lines: ['WEATHER', 'UNAVAILABLE', location.toUpperCase().slice(0, 22)],
          duration: 15000,
        };
      } finally {
        this.inflightRefresh = null;
      }
    })();

    return this.inflightRefresh;
  }
}
