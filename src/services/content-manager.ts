import { resolve } from 'aurelia';
import { DEFAULT_SCRAMBLE_DURATION } from '../constants/defaults';
import type { ContentItem, DisplayMode } from '../models/content-item';
import { QuoteLibrary } from './quote-library';
import { SettingsService } from './settings-service';
import { WeatherService } from './weather-service';

type Listener = (content: ContentItem) => void;

export class ContentManager {
  private readonly quotes = resolve(QuoteLibrary);
  private readonly weather = resolve(WeatherService);
  private readonly settings = resolve(SettingsService);
  private readonly listeners = new Set<Listener>();
  private queue: ContentItem[] = [];
  private currentIndex = 0;
  private timer: number | null = null;
  private started = false;

  constructor() {
    this.settings.subscribe(() => {
      if (!this.started) {
        return;
      }
      this.restart();
    });
  }

  onContentChange(callback: Listener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.buildQueue();
    this.showNext();
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    this.started = false;
  }

  restart(): void {
    this.stop();
    this.queue = [];
    this.currentIndex = 0;
    this.started = true;
    this.buildQueue();
    this.showNext();
  }

  private buildQueue(): void {
    this.queue = [];

    const modes = this.settings.getActiveModes();
    if (modes.includes('quotes')) {
      this.pushScrambledItems(this.quotes.getDefaultRotation(6));
    }

    if (modes.includes('custom')) {
      this.pushScrambledItems(this.quotes.getCustomRotation(4));
    }

    if (modes.includes('weather')) {
      this.queue.push(this.createScramble());
      this.queue.push({ type: 'weather', lines: [], duration: 15000 });
    }

    if (modes.includes('time')) {
      this.queue.push(this.createScramble());
      this.queue.push({ type: 'time', lines: [], duration: 15000 });
    }

    if (this.queue.length === 0) {
      this.queue.push(this.createScramble());
      this.queue.push({
        type: 'custom',
        lines: ['ADD A CONTENT MODE', 'IN SETTINGS', 'TO START'],
        duration: this.settings.getCycleDuration(),
      });
    }
  }

  private pushScrambledItems(items: ContentItem[]): void {
    for (const item of items) {
      this.queue.push(this.createScramble());
      this.queue.push({
        ...item,
        duration: this.settings.getCycleDuration(),
      });
    }
  }

  private showNext(): void {
    if (this.queue.length === 0) {
      this.buildQueue();
    }

    const baseItem = this.queue[this.currentIndex % this.queue.length];
    this.currentIndex += 1;

    const item = this.materialize(baseItem);
    for (const listener of this.listeners) {
      listener(item);
    }

    this.timer = window.setTimeout(() => {
      if (this.currentIndex >= this.queue.length) {
        this.buildQueue();
        this.currentIndex = 0;
      }
      this.showNext();
    }, item.duration);
  }

  private materialize(item: ContentItem): ContentItem {
    switch (item.type) {
      case 'time':
        return {
          ...item,
          lines: this.formatTime(),
        };
      case 'weather':
        return this.weather.getCurrentContentItem();
      case 'scramble':
        return {
          ...item,
          lines: this.generateScramble(this.settings.getRows(), this.settings.getCols()),
        };
      default:
        return item;
    }
  }

  private formatTime(): string[] {
    const now = new Date();
    return [
      now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toUpperCase(),
      now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(),
    ];
  }

  private createScramble(): ContentItem {
    return {
      type: 'scramble',
      lines: [],
      duration: DEFAULT_SCRAMBLE_DURATION,
    };
  }

  private generateScramble(rows: number, cols: number): string[] {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    );
  }
}
