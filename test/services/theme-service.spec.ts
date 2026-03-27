import { describe, it, expect, beforeEach } from 'vitest';
import { createFixture } from '@aurelia/testing';
import { ThemeService } from '../../src/services/theme-service';
import { SettingsService } from '../../src/services/settings-service';
import { THEMES } from '../../src/models/theme';

describe('ThemeService', () => {
  let theme: ThemeService;
  let settings: SettingsService;

  beforeEach(async () => {
    const { container } = await createFixture('<div></div>', {}, []).started;
    settings = container.get(SettingsService);
    theme = container.get(ThemeService);
  });

  it('applies the default airport theme on init', () => {
    expect(theme.getActiveTheme().id).toBe('airport');
  });

  it('exposes all defined themes', () => {
    expect(theme.getThemes()).toEqual(THEMES);
  });

  it('switches theme by id', () => {
    theme.applyThemeById('brass');
    expect(theme.getActiveTheme().id).toBe('brass');
  });

  it('falls back to first theme for unknown id', () => {
    theme.applyThemeById('nonexistent');
    expect(theme.getActiveTheme().id).toBe(THEMES[0].id);
  });

  it('sets CSS variables on document element', () => {
    theme.applyThemeById('polar');
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--board-bg')).toBe(THEMES[2].boardBackground);
    expect(root.style.getPropertyValue('--flap-bg')).toBe(THEMES[2].flapBackground);
    expect(root.style.getPropertyValue('--flap-text')).toBe(THEMES[2].flapText);
  });

  it('generates marker colors of requested count', () => {
    const colors = theme.getMarkerColors(8);
    expect(colors).toHaveLength(8);
    for (const color of colors) {
      expect(theme.getActiveTheme().accentColors).toContain(color);
    }
  });

  it('generates random accent grid', () => {
    const accents = theme.getRandomAccents(4, 10);
    expect(accents).toHaveLength(4);
    for (const row of accents) {
      expect(row).toHaveLength(10);
      for (const cell of row) {
        if (cell !== null) {
          expect(theme.getActiveTheme().accentColors).toContain(cell);
        }
      }
    }
  });

  it('persists theme choice to settings', () => {
    theme.applyThemeById('brass');
    expect(settings.getThemeId()).toBe('brass');
  });
});
