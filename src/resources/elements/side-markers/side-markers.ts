import { customElement, resolve } from 'aurelia';
import template from './side-markers.html';
import { ContentManager } from '../../../services/content-manager';
import { ThemeService } from '../../../services/theme-service';

@customElement({
  name: 'side-markers',
  template,
})
export class SideMarkers {
  private readonly contentManager = resolve(ContentManager);
  private readonly themeService = resolve(ThemeService);

  markerCount = 8;
  leftColors: string[] = [];
  rightColors: string[] = [];
  private stopContentListener: (() => void) | null = null;

  attached(): void {
    this.refresh();
    this.stopContentListener = this.contentManager.onContentChange(() => {
      this.refresh();
    });
  }

  detached(): void {
    this.stopContentListener?.();
  }

  private refresh(): void {
    this.leftColors = this.themeService.getMarkerColors(this.markerCount);
    this.rightColors = this.themeService.getMarkerColors(this.markerCount);
  }
}
