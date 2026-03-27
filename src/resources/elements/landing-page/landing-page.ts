import { bindable, customElement, INode, resolve } from 'aurelia';
import template from './landing-page.html';
import { SettingsService } from '../../../services/settings-service';

@customElement({
  name: 'landing-page',
  template,
})
export class LandingPage {
  private readonly settings = resolve(SettingsService);
  private readonly host = resolve(INode) as HTMLElement;

  @bindable visible = false;

  readonly featureList = [
    'Pure CSS 3D split-flap animation',
    'Quote, custom, weather, and time modes',
    'Fullscreen 1080p and 4K layout',
  ];

  enterDisplay(): void {
    this.settings.dismissOnboarding();
    this.visible = false;
  }

  openSettings(): void {
    this.settings.dismissOnboarding();
    this.visible = false;
    this.dispatch('open-settings');
  }

  private dispatch(name: string): void {
    this.host.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
      })
    );
  }
}
