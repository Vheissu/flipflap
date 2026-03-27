import { bindable, customElement } from 'aurelia';
import template from './flap-cell.html';
import { FLAP_CHARS, CYCLE_CHARS } from '../../../constants/characters';

@customElement({
  name: 'flap-cell',
  template,
})
export class FlapCell {
  @bindable targetChar = ' ';
  @bindable flipDelay = 0;

  currentChar = ' ';
  nextChar = ' ';
  flipActive = false;

  private readonly flipDuration = 280;
  private flipQueue: string[] = [];
  private isProcessing = false;
  private delayTimer: number | null = null;
  private flipTimer: number | null = null;
  private gapTimer: number | null = null;
  private lastTargetChar = ' ';
  private syncTimer: number | null = null;

  attached(): void {
    this.checkTarget();
    this.syncTimer = window.setInterval(() => this.checkTarget(), 100);
  }

  detached(): void {
    this.clearTimers();
    if (this.syncTimer !== null) {
      window.clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private checkTarget(): void {
    const normalized = this.normalizeChar(this.targetChar);
    if (normalized === this.lastTargetChar) return;
    this.lastTargetChar = normalized;
    if (normalized === this.currentChar && !this.isProcessing) return;
    this.startFlipSequence(normalized);
  }

  private startFlipSequence(target: string): void {
    this.clearTimers();

    const intermediateCount = 2 + Math.floor(Math.random() * 4);
    this.flipQueue = [];
    for (let i = 0; i < intermediateCount; i++) {
      this.flipQueue.push(CYCLE_CHARS[Math.floor(Math.random() * CYCLE_CHARS.length)]);
    }
    this.flipQueue.push(target);

    this.delayTimer = window.setTimeout(() => {
      this.delayTimer = null;
      this.processQueue();
    }, this.flipDelay);
  }

  private processQueue(): void {
    if (this.flipQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const next = this.flipQueue.shift()!;
    this.doSingleFlip(next);
  }

  private doSingleFlip(char: string): void {
    this.nextChar = char;
    this.flipActive = true;

    this.flipTimer = window.setTimeout(() => {
      this.currentChar = this.nextChar;
      this.flipActive = false;
      this.flipTimer = null;

      this.gapTimer = window.setTimeout(() => {
        this.gapTimer = null;
        this.processQueue();
      }, 50);
    }, this.flipDuration);
  }

  private clearTimers(): void {
    if (this.delayTimer !== null) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    if (this.flipTimer !== null) {
      clearTimeout(this.flipTimer);
      this.flipTimer = null;
    }
    if (this.gapTimer !== null) {
      clearTimeout(this.gapTimer);
      this.gapTimer = null;
    }
    this.flipActive = false;
    this.isProcessing = false;
    this.flipQueue = [];
  }

  private normalizeChar(value: string): string {
    const candidate = (value ?? ' ').toUpperCase().slice(0, 1) || ' ';
    return FLAP_CHARS.includes(candidate) ? candidate : ' ';
  }
}
