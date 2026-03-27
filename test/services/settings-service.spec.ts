import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsService } from '../../src/services/settings-service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    service = new SettingsService();
  });

  describe('default values', () => {
    it('returns default modes when nothing is stored', () => {
      const modes = service.getActiveModes();
      expect(modes).toContain('quotes');
      expect(modes).toContain('time');
    });

    it('returns default sound enabled', () => {
      expect(service.isSoundEnabled()).toBe(true);
    });

    it('returns default volume', () => {
      expect(service.getVolume()).toBe(0.45);
    });

    it('returns default rows and cols', () => {
      expect(service.getRows()).toBe(6);
      expect(service.getCols()).toBe(22);
    });

    it('returns default cycle duration', () => {
      expect(service.getCycleDuration()).toBe(45000);
    });

    it('returns default theme', () => {
      expect(service.getThemeId()).toBe('airport');
    });

    it('returns empty custom quotes', () => {
      expect(service.getCustomQuotes()).toEqual([]);
    });

    it('returns onboarding not dismissed', () => {
      expect(service.isOnboardingDismissed()).toBe(false);
    });
  });

  describe('set / get roundtrips', () => {
    it('persists sound toggle', () => {
      service.setSoundEnabled(false);
      expect(service.isSoundEnabled()).toBe(false);
    });

    it('persists volume', () => {
      service.setVolume(0.8);
      expect(service.getVolume()).toBe(0.8);
    });

    it('persists theme', () => {
      service.setThemeId('brass');
      expect(service.getThemeId()).toBe('brass');
    });

    it('persists weather settings', () => {
      service.setWeatherApiKey('abc123');
      service.setLocation('Brisbane, AU');
      expect(service.getWeatherApiKey()).toBe('abc123');
      expect(service.getLocation()).toBe('Brisbane, AU');
    });

    it('persists custom quotes', () => {
      const quotes = [{ text: 'hello', author: 'world' }];
      service.setCustomQuotes(quotes);
      expect(service.getCustomQuotes()).toEqual(quotes);
    });

    it('persists onboarding dismissal', () => {
      service.dismissOnboarding();
      expect(service.isOnboardingDismissed()).toBe(true);
    });
  });

  describe('clamping', () => {
    it('clamps volume to 0-1 range', () => {
      service.setVolume(-5);
      expect(service.getVolume()).toBe(0);
      service.setVolume(99);
      expect(service.getVolume()).toBe(1);
    });

    it('clamps rows to 1-12', () => {
      service.setRows(0);
      expect(service.getRows()).toBe(1);
      service.setRows(50);
      expect(service.getRows()).toBe(12);
    });

    it('clamps cols to 12-40', () => {
      service.setCols(5);
      expect(service.getCols()).toBe(12);
      service.setCols(100);
      expect(service.getCols()).toBe(40);
    });

    it('clamps cycle duration to 15000-120000', () => {
      service.setCycleDuration(1000);
      expect(service.getCycleDuration()).toBe(15000);
      service.setCycleDuration(999999);
      expect(service.getCycleDuration()).toBe(120000);
    });

    it('rounds rows and cols to integers', () => {
      service.setRows(4.7);
      expect(service.getRows()).toBe(5);
      service.setCols(25.3);
      expect(service.getCols()).toBe(25);
    });
  });

  describe('mode filtering', () => {
    it('filters out the legacy "quote" mode from getActiveModes', () => {
      service.set('modes', ['quote', 'quotes', 'time']);
      const modes = service.getActiveModes();
      expect(modes).not.toContain('quote');
      expect(modes).toContain('quotes');
    });

    it('falls back to ["quotes"] when set with empty array', () => {
      service.setActiveModes([]);
      expect(service.get('modes', [])).toEqual(['quotes']);
    });

    it('deduplicates modes', () => {
      service.setActiveModes(['quotes', 'quotes', 'time']);
      const stored = service.get('modes', []) as string[];
      expect(stored).toEqual(['quotes', 'time']);
    });
  });

  describe('subscriber notifications', () => {
    it('notifies subscribers on set', () => {
      const listener = vi.fn();
      service.subscribe(listener);
      service.setSoundEnabled(false);
      expect(listener).toHaveBeenCalledOnce();
    });

    it('stops notifying after unsubscribe', () => {
      const listener = vi.fn();
      const unsub = service.subscribe(listener);
      unsub();
      service.setSoundEnabled(false);
      expect(listener).not.toHaveBeenCalled();
    });

    it('notifies multiple subscribers', () => {
      const a = vi.fn();
      const b = vi.fn();
      service.subscribe(a);
      service.subscribe(b);
      service.setVolume(0.9);
      expect(a).toHaveBeenCalledOnce();
      expect(b).toHaveBeenCalledOnce();
    });
  });

  describe('weather key trimming', () => {
    it('trims whitespace from API key', () => {
      service.setWeatherApiKey('  key123  ');
      expect(service.getWeatherApiKey()).toBe('key123');
    });

    it('trims whitespace from location', () => {
      service.setLocation('  London  ');
      expect(service.getLocation()).toBe('London');
    });
  });
});
