import { resolve } from 'aurelia';
import { DEFAULT_QUOTES } from '../constants/quotes';
import type { ContentItem } from '../models/content-item';
import type { CustomQuoteEntry } from './settings-service';
import { SettingsService } from './settings-service';

export class QuoteLibrary {
  private readonly settings = resolve(SettingsService);
  private defaultQuotes: ContentItem[] = [];
  private customQuotes: ContentItem[] = [];
  private defaultOffset = 0;
  private customOffset = 0;

  constructor() {
    this.loadQuotes();
    this.settings.subscribe(() => this.loadQuotes());
  }

  getDefaultRotation(count: number): ContentItem[] {
    return this.rotate(this.defaultQuotes, count, 'default');
  }

  getCustomRotation(count: number): ContentItem[] {
    return this.rotate(this.customQuotes, count, 'custom');
  }

  private loadQuotes(): void {
    this.defaultQuotes = DEFAULT_QUOTES.map((quote) => this.formatQuote(quote.text, quote.author, 'quote'));
    this.customQuotes = this.settings.getCustomQuotes().map((quote) => this.formatQuote(quote.text, quote.author, 'custom'));
    this.defaultOffset = 0;
    this.customOffset = 0;
    this.shuffle(this.defaultQuotes);
    this.shuffle(this.customQuotes);
  }

  private rotate(source: ContentItem[], count: number, bucket: 'default' | 'custom'): ContentItem[] {
    if (source.length === 0 || count <= 0) {
      return [];
    }

    const output: ContentItem[] = [];
    for (let index = 0; index < count; index++) {
      const offset = bucket === 'default' ? this.defaultOffset : this.customOffset;
      output.push(source[offset % source.length]);
      if (bucket === 'default') {
        this.defaultOffset = (this.defaultOffset + 1) % source.length;
        if (this.defaultOffset === 0) {
          this.shuffle(source);
        }
      } else {
        this.customOffset = (this.customOffset + 1) % source.length;
        if (this.customOffset === 0) {
          this.shuffle(source);
        }
      }
    }

    return output;
  }

  private formatQuote(text: string, author: string, type: 'quote' | 'custom'): ContentItem {
    const maxWidth = this.settings.getCols();
    const maxTextLines = Math.max(1, this.settings.getRows() - 1);
    const words = text.toUpperCase().split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (candidate.length <= maxWidth) {
        currentLine = candidate;
        continue;
      }

      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word.slice(0, maxWidth));
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    const quoteLines = lines.slice(0, maxTextLines);
    const attribution = `- ${author.toUpperCase()}`.slice(0, maxWidth);

    return {
      type,
      lines: [...quoteLines, attribution],
      attribution: author,
      duration: this.settings.getCycleDuration(),
    };
  }

  private shuffle(items: ContentItem[]): void {
    for (let index = items.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }
  }
}
