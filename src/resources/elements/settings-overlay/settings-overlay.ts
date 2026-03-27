import { bindable, customElement, INode, resolve } from 'aurelia';
import template from './settings-overlay.html';
import { AVAILABLE_MODES } from '../../../constants/defaults';
import { ThemeService } from '../../../services/theme-service';
import type { CustomQuoteEntry } from '../../../services/settings-service';
import { SettingsService } from '../../../services/settings-service';
import type { DisplayMode } from '../../../models/content-item';

@customElement({
  name: 'settings-overlay',
  template,
})
export class SettingsOverlay {
  private readonly settings = resolve(SettingsService);
  private readonly themeService = resolve(ThemeService);
  private readonly host = resolve(INode) as HTMLElement;

  @bindable visible = false;

  readonly modeOptions = AVAILABLE_MODES;
  readonly themes = this.themeService.getThemes();

  activeModes: DisplayMode[] = [];
  cycleDuration = 45000;
  soundEnabled = true;
  volume = 0.45;
  themeId = '';
  weatherApiKey = '';
  location = '';
  rows = 3;
  cols = 22;
  customQuoteDraft = '';
  statusMessage = '';

  private stopSettingsListener: (() => void) | null = null;

  attached(): void {
    this.loadFromSettings();
    this.stopSettingsListener = this.settings.subscribe(() => {
      if (!this.visible) {
        this.loadFromSettings();
      }
    });
  }

  detached(): void {
    this.stopSettingsListener?.();
  }

  visibleChanged(isVisible: boolean): void {
    if (isVisible) {
      this.loadFromSettings();
    }
  }

  hide(): void {
    if (!this.visible) {
      return;
    }

    this.visible = false;
    this.host.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
      })
    );
  }

  isModeEnabled(mode: DisplayMode): boolean {
    return this.activeModes.includes(mode);
  }

  toggleMode(mode: DisplayMode, event: Event): void {
    const target = event.target as HTMLInputElement;
    const nextModes = new Set(this.activeModes);
    if (target.checked) {
      nextModes.add(mode);
    } else {
      nextModes.delete(mode);
    }

    this.activeModes = Array.from(nextModes);
    this.settings.setActiveModes(this.activeModes);
    this.statusMessage = 'Content modes updated.';
  }

  persistCycleDuration(): void {
    this.settings.setCycleDuration(this.cycleDuration);
    this.statusMessage = `Cycle duration set to ${Math.round(this.cycleDuration / 1000)} seconds.`;
  }

  persistSound(): void {
    this.settings.setSoundEnabled(this.soundEnabled);
    this.settings.setVolume(this.volume);
    this.statusMessage = this.soundEnabled ? 'Sound enabled.' : 'Sound muted.';
  }

  persistTheme(): void {
    this.themeService.applyThemeById(this.themeId);
    this.statusMessage = 'Theme updated.';
  }

  persistWeather(): void {
    this.settings.setLocation(this.location);
    this.settings.setWeatherApiKey(this.weatherApiKey);
    this.statusMessage = 'Weather settings saved.';
  }

  persistBoardSize(): void {
    this.settings.setRows(this.rows);
    this.settings.setCols(this.cols);
    this.statusMessage = `Board resized to ${this.rows} by ${this.cols}.`;
  }

  persistQuotes(): void {
    const parsedQuotes = this.parseCustomQuotes(this.customQuoteDraft);
    this.settings.setCustomQuotes(parsedQuotes);
    this.statusMessage = `${parsedQuotes.length} custom quote${parsedQuotes.length === 1 ? '' : 's'} saved.`;
  }

  get volumePercent(): number {
    return Math.round(this.volume * 100);
  }

  get cycleSeconds(): number {
    return Math.round(this.cycleDuration / 1000);
  }

  private loadFromSettings(): void {
    this.activeModes = this.settings.getActiveModes();
    this.cycleDuration = this.settings.getCycleDuration();
    this.soundEnabled = this.settings.isSoundEnabled();
    this.volume = this.settings.getVolume();
    this.themeId = this.settings.getThemeId();
    this.weatherApiKey = this.settings.getWeatherApiKey();
    this.location = this.settings.getLocation();
    this.rows = this.settings.getRows();
    this.cols = this.settings.getCols();
    this.customQuoteDraft = this.settings
      .getCustomQuotes()
      .map((quote) => `${quote.text} | ${quote.author}`)
      .join('\n');
  }

  private parseCustomQuotes(input: string): CustomQuoteEntry[] {
    return input
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const pipeIndex = line.lastIndexOf('|');
        if (pipeIndex !== -1) {
          return {
            text: line.slice(0, pipeIndex).trim(),
            author: line.slice(pipeIndex + 1).trim() || 'CUSTOM',
          };
        }

        const dashIndex = line.lastIndexOf(' - ');
        if (dashIndex !== -1) {
          return {
            text: line.slice(0, dashIndex).trim(),
            author: line.slice(dashIndex + 3).trim() || 'CUSTOM',
          };
        }

        return { text: line, author: 'CUSTOM' };
      })
      .filter((quote) => quote.text.length > 0);
  }
}
