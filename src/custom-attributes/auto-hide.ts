import { bindable, customAttribute, INode, resolve } from 'aurelia';

interface AutoHideConfig {
  active?: boolean;
  delay?: number;
}

@customAttribute('auto-hide')
export class AutoHideCustomAttribute {
  @bindable public value: AutoHideConfig | number = 10000;

  private readonly element = resolve(INode) as HTMLElement;
  private hideTimer: number | null = null;

  attached(): void {
    this.bindActivityListeners();
    this.resetTimer();
  }

  valueChanged(): void {
    this.clearTimer();
    this.resetTimer();
  }

  detached(): void {
    this.unbindActivityListeners();
    this.clearTimer();
  }

  private readonly onActivity = (): void => {
    if (!this.isActive()) {
      return;
    }
    this.resetTimer();
  };

  private bindActivityListeners(): void {
    document.addEventListener('mousemove', this.onActivity, { passive: true });
    document.addEventListener('pointerdown', this.onActivity, { passive: true });
    document.addEventListener('keydown', this.onActivity);
  }

  private unbindActivityListeners(): void {
    document.removeEventListener('mousemove', this.onActivity);
    document.removeEventListener('pointerdown', this.onActivity);
    document.removeEventListener('keydown', this.onActivity);
  }

  private isActive(): boolean {
    if (typeof this.value === 'number') {
      return true;
    }

    return this.value.active ?? true;
  }

  private getDelay(): number {
    if (typeof this.value === 'number') {
      return this.value;
    }

    return this.value.delay ?? 10000;
  }

  private resetTimer(): void {
    if (!this.isActive()) {
      return;
    }

    this.clearTimer();
    this.hideTimer = window.setTimeout(() => {
      this.element.dispatchEvent(
        new CustomEvent('auto-hide-expired', {
          bubbles: true,
        })
      );
    }, this.getDelay());
  }

  private clearTimer(): void {
    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
