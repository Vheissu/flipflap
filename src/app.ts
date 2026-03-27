import { customElement, resolve } from 'aurelia';
import template from './app.html';
import { AudioEngine } from './services/audio-engine';
import { SettingsService } from './services/settings-service';

@customElement({
  name: 'flipflap-app',
  template,
})
export class App {
  private readonly settings = resolve(SettingsService);
  private readonly audio = resolve(AudioEngine);

  settingsVisible = false;
  landingVisible = !this.settings.isOnboardingDismissed();

  attached(): void {
    this.audio.attachUnlockListeners();
    window.addEventListener('keydown', this.handleKeydown);
  }

  detached(): void {
    window.removeEventListener('keydown', this.handleKeydown);
  }

  openSettingsOverlay(): void {
    this.landingVisible = false;
    this.settingsVisible = true;
  }

  handleSettingsClose(): void {
    this.settingsVisible = false;
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.settingsVisible) {
      this.settingsVisible = false;
    }
  };
}
