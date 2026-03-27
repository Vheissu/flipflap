import {
  DEFAULT_COLS,
  DEFAULT_CYCLE_DURATION,
  DEFAULT_MODES,
  DEFAULT_ROWS,
  DEFAULT_THEME_ID,
  DEFAULT_VOLUME,
  SETTINGS_PREFIX,
} from '../constants/defaults';
import type { DisplayMode } from '../models/content-item';

export interface CustomQuoteEntry {
  text: string;
  author: string;
}

export interface FlipFlapSettings {
  modes: DisplayMode[];
  sound: boolean;
  volume: number;
  weather_api_key: string;
  location: string;
  custom_quotes: CustomQuoteEntry[];
  cycle_duration: number;
  theme_id: string;
  rows: number;
  cols: number;
  onboarding_dismissed: boolean;
}

const DEFAULT_SETTINGS: FlipFlapSettings = {
  modes: DEFAULT_MODES,
  sound: true,
  volume: DEFAULT_VOLUME,
  weather_api_key: '',
  location: '',
  custom_quotes: [],
  cycle_duration: DEFAULT_CYCLE_DURATION,
  theme_id: DEFAULT_THEME_ID,
  rows: DEFAULT_ROWS,
  cols: DEFAULT_COLS,
  onboarding_dismissed: false,
};

type Listener = () => void;

export class SettingsService {
  private readonly prefix = SETTINGS_PREFIX;
  private readonly listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getActiveModes(): DisplayMode[] {
    return this.get('modes', DEFAULT_SETTINGS.modes).filter((mode) => mode !== 'quote');
  }

  setActiveModes(modes: DisplayMode[]): void {
    const cleaned = Array.from(new Set(modes.filter((mode) => ['quotes', 'custom', 'weather', 'time'].includes(mode))));
    this.set('modes', cleaned.length > 0 ? cleaned : ['quotes']);
  }

  isSoundEnabled(): boolean {
    return this.get('sound', DEFAULT_SETTINGS.sound);
  }

  setSoundEnabled(value: boolean): void {
    this.set('sound', value);
  }

  getVolume(): number {
    return this.get('volume', DEFAULT_SETTINGS.volume);
  }

  setVolume(value: number): void {
    this.set('volume', Math.min(1, Math.max(0, value)));
  }

  getWeatherApiKey(): string {
    return this.get('weather_api_key', DEFAULT_SETTINGS.weather_api_key);
  }

  setWeatherApiKey(value: string): void {
    this.set('weather_api_key', value.trim());
  }

  getLocation(): string {
    return this.get('location', DEFAULT_SETTINGS.location);
  }

  setLocation(value: string): void {
    this.set('location', value.trim());
  }

  getCustomQuotes(): CustomQuoteEntry[] {
    return this.get('custom_quotes', DEFAULT_SETTINGS.custom_quotes);
  }

  setCustomQuotes(quotes: CustomQuoteEntry[]): void {
    this.set('custom_quotes', quotes);
  }

  getCycleDuration(): number {
    return this.get('cycle_duration', DEFAULT_SETTINGS.cycle_duration);
  }

  setCycleDuration(value: number): void {
    this.set('cycle_duration', Math.max(15000, Math.min(120000, Math.round(value))));
  }

  getThemeId(): string {
    return this.get('theme_id', DEFAULT_SETTINGS.theme_id);
  }

  setThemeId(value: string): void {
    this.set('theme_id', value);
  }

  getRows(): number {
    return this.get('rows', DEFAULT_SETTINGS.rows);
  }

  setRows(value: number): void {
    this.set('rows', Math.max(1, Math.min(12, Math.round(value))));
  }

  getCols(): number {
    return this.get('cols', DEFAULT_SETTINGS.cols);
  }

  setCols(value: number): void {
    this.set('cols', Math.max(12, Math.min(40, Math.round(value))));
  }

  isOnboardingDismissed(): boolean {
    return this.get('onboarding_dismissed', DEFAULT_SETTINGS.onboarding_dismissed);
  }

  dismissOnboarding(): void {
    this.set('onboarding_dismissed', true);
  }

  get<T>(key: keyof FlipFlapSettings, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  set<K extends keyof FlipFlapSettings>(key: K, value: FlipFlapSettings[K]): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
