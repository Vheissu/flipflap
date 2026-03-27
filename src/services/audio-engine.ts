import { resolve } from 'aurelia';
import { SettingsService } from './settings-service';

export class AudioEngine {
  private readonly settings = resolve(SettingsService);
  private context: AudioContext | null = null;
  private clackBuffer: AudioBuffer | null = null;
  private primed = false;

  attachUnlockListeners(): void {
    if (this.primed) {
      return;
    }

    const unlock = async (): Promise<void> => {
      await this.initialize();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true });
    this.primed = true;
  }

  async initialize(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    if (this.clackBuffer) {
      return;
    }

    try {
      const response = await fetch('/audio/clack.wav');
      if (!response.ok) {
        throw new Error(`Unable to load audio asset: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      this.clackBuffer = await this.context.decodeAudioData(arrayBuffer);
    } catch {
      this.clackBuffer = this.createSyntheticClack();
    }
  }

  playClack(delayMs = 0): void {
    if (!this.context || !this.clackBuffer || !this.settings.isSoundEnabled()) {
      return;
    }

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();

    source.buffer = this.clackBuffer;
    gain.gain.value = this.settings.getVolume();
    source.connect(gain);
    gain.connect(this.context.destination);

    source.start(this.context.currentTime + delayMs / 1000);
  }

  playBoardTransition(delays: number[][], changeMap?: boolean[][]): void {
    if (!this.settings.isSoundEnabled()) {
      return;
    }

    for (let row = 0; row < delays.length; row++) {
      for (let col = 0; col < delays[row].length; col++) {
        if (changeMap && !changeMap[row]?.[col]) {
          continue;
        }
        this.playClack(delays[row][col]);
      }
    }
  }

  private createSyntheticClack(): AudioBuffer {
    if (!this.context) {
      throw new Error('Audio context not available');
    }

    const durationSeconds = 0.055;
    const length = Math.floor(this.context.sampleRate * durationSeconds);
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < channel.length; index++) {
      const progress = index / channel.length;
      const envelope = Math.exp(-progress * 24);
      const noise = (Math.random() * 2 - 1) * 0.55;
      const metallic = Math.sin(index * 0.9) * 0.25;
      channel[index] = (noise + metallic) * envelope;
    }

    return buffer;
  }
}
