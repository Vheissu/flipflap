import { resolve } from 'aurelia';
import { THEMES, type Theme } from '../models/theme';
import { SettingsService } from './settings-service';

export class ThemeService {
  private readonly settings = resolve(SettingsService);
  private activeTheme: Theme = THEMES[0];

  constructor() {
    this.applyThemeById(this.settings.getThemeId());
    this.settings.subscribe(() => {
      const preferredTheme = this.settings.getThemeId();
      if (preferredTheme !== this.activeTheme.id) {
        this.applyThemeById(preferredTheme);
      }
    });
  }

  getThemes(): Theme[] {
    return THEMES;
  }

  getActiveTheme(): Theme {
    return this.activeTheme;
  }

  applyThemeById(themeId: string): void {
    this.activeTheme = THEMES.find((theme) => theme.id === themeId) ?? THEMES[0];
    this.settings.setThemeId(this.activeTheme.id);
    this.applyThemeVariables();
  }

  getRandomAccents(rows: number, cols: number): Array<Array<string | null>> {
    const accents: Array<Array<string | null>> = [];

    for (let row = 0; row < rows; row++) {
      accents[row] = [];
      for (let col = 0; col < cols; col++) {
        const neighborBoost = col > 0 && accents[row][col - 1] ? 0.08 : 0;
        if (Math.random() < 0.08 + neighborBoost) {
          accents[row][col] = this.pickAccent();
        } else {
          accents[row][col] = null;
        }
      }
    }

    return accents;
  }

  getMarkerColors(count: number): string[] {
    return Array.from({ length: count }, () => this.pickAccent());
  }

  private pickAccent(): string {
    const pool = this.activeTheme.accentColors;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private applyThemeVariables(): void {
    const root = document.documentElement;
    root.style.setProperty('--board-bg', this.activeTheme.boardBackground);
    root.style.setProperty('--board-gradient', this.activeTheme.boardGradient);
    root.style.setProperty('--flap-bg', this.activeTheme.flapBackground);
    root.style.setProperty('--flap-text', this.activeTheme.flapText);
    root.style.setProperty('--marker-glow', this.activeTheme.markerGlow);
  }
}
