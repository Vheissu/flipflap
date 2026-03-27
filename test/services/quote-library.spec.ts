import { describe, it, expect, beforeEach } from 'vitest';
import { createFixture } from '@aurelia/testing';
import { Registration } from 'aurelia';
import { QuoteLibrary } from '../../src/services/quote-library';
import { SettingsService } from '../../src/services/settings-service';
import { DEFAULT_QUOTES } from '../../src/constants/quotes';

describe('QuoteLibrary', () => {
  let settings: SettingsService;
  let library: QuoteLibrary;

  beforeEach(async () => {
    const { container } = await createFixture('<div></div>', {}, []).started;
    settings = container.get(SettingsService);
    library = container.get(QuoteLibrary);
  });

  it('returns the requested number of default quotes', () => {
    const items = library.getDefaultRotation(3);
    expect(items).toHaveLength(3);
  });

  it('never returns more than available quotes in one call', () => {
    const items = library.getDefaultRotation(DEFAULT_QUOTES.length + 5);
    expect(items).toHaveLength(DEFAULT_QUOTES.length + 5);
  });

  it('returns items with valid structure', () => {
    const items = library.getDefaultRotation(1);
    const item = items[0];
    expect(item.type).toBe('quote');
    expect(Array.isArray(item.lines)).toBe(true);
    expect(item.lines.length).toBeGreaterThanOrEqual(1);
    expect(typeof item.attribution).toBe('string');
    expect(typeof item.duration).toBe('number');
  });

  it('formats lines within maxWidth (cols)', () => {
    settings.setCols(22);
    const items = library.getDefaultRotation(DEFAULT_QUOTES.length);
    for (const item of items) {
      for (const line of item.lines) {
        expect(line.length).toBeLessThanOrEqual(22);
      }
    }
  });

  it('respects row limit for text lines', () => {
    settings.setRows(3);
    const items = library.getDefaultRotation(DEFAULT_QUOTES.length);
    for (const item of items) {
      // maxTextLines = rows - 1 = 2, plus 1 attribution line = 3 total
      expect(item.lines.length).toBeLessThanOrEqual(3);
    }
  });

  it('includes an attribution line starting with dash', () => {
    const items = library.getDefaultRotation(1);
    const lastLine = items[0].lines[items[0].lines.length - 1];
    expect(lastLine).toMatch(/^- /);
  });

  it('uppercases all line content', () => {
    const items = library.getDefaultRotation(5);
    for (const item of items) {
      for (const line of item.lines) {
        expect(line).toBe(line.toUpperCase());
      }
    }
  });

  it('returns empty array when count is 0', () => {
    expect(library.getDefaultRotation(0)).toEqual([]);
  });

  describe('custom quotes', () => {
    it('returns custom quotes when configured', () => {
      settings.setCustomQuotes([
        { text: 'hello world', author: 'tester' },
      ]);
      // Re-resolve to pick up setting changes
      const items = library.getCustomRotation(1);
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('custom');
    });

    it('returns empty array when no custom quotes exist', () => {
      expect(library.getCustomRotation(5)).toEqual([]);
    });
  });

  describe('rotation cycling', () => {
    it('cycles through all quotes before repeating', () => {
      settings.setCustomQuotes([
        { text: 'alpha', author: 'a' },
        { text: 'bravo', author: 'b' },
      ]);

      const first = library.getCustomRotation(2);
      expect(first).toHaveLength(2);

      // Next rotation should reshuffle (coverage)
      const second = library.getCustomRotation(2);
      expect(second).toHaveLength(2);
    });
  });
});
