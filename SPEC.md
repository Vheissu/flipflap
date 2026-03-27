# Flipflap Technical Specification

**Version:** 1.0  
**Date:** March 27, 2026  
**Stack:** Aurelia 2, TypeScript, CSS (no Canvas/WebGL)  
**Target:** Fullscreen web app for TV displays (1080p/4K, 16:9)

## 1. What We're Building

A software split-flap display that runs fullscreen in a browser on any TV. Think airport departure boards from the 70s. Each character lives on a mechanical flap that physically flips to reveal the next character. Content cycles automatically between quotes, time, weather, and custom messages.

No Canvas. No WebGL. Pure CSS 3D transforms for the flip animations. Aurelia 2 custom elements for everything.

## 2. Architecture

### 2.1 Application Structure

```
src/
├── main.ts                          # Aurelia bootstrap
├── app.ts / app.html                # Root component, manages display vs settings mode
├── resources/
│   ├── elements/
│   │   ├── flap-board/              # The full board grid
│   │   │   ├── flap-board.ts
│   │   │   └── flap-board.html
│   │   ├── flap-cell/              # Single flap unit with flip animation
│   │   │   ├── flap-cell.ts
│   │   │   └── flap-cell.html
│   │   ├── side-markers/           # Colored accent bars on board edges
│   │   │   ├── side-markers.ts
│   │   │   └── side-markers.html
│   │   ├── settings-overlay/       # Hidden settings panel
│   │   │   ├── settings-overlay.ts
│   │   │   └── settings-overlay.html
│   │   └── landing-page/           # Marketing/setup landing page
│   │       ├── landing-page.ts
│   │       └── landing-page.html
│   ├── value-converters/
│   │   └── uppercase.ts            # All display text is uppercase
│   └── custom-attributes/
│       └── auto-hide.ts            # Auto-hide UI elements after timeout
├── services/
│   ├── content-manager.ts          # Orchestrates what content shows and when
│   ├── flip-scheduler.ts           # Manages staggered flip timing across cells
│   ├── audio-engine.ts             # Handles flip sound effects
│   ├── quote-library.ts            # Quote storage and rotation
│   ├── weather-service.ts          # OpenWeatherMap API integration
│   ├── theme-service.ts            # Color palette management
│   └── settings-service.ts         # Persists user preferences to localStorage
├── models/
│   ├── board-state.ts              # Board grid state representation
│   ├── content-item.ts             # Individual content entry (quote, weather, etc.)
│   └── theme.ts                    # Theme/color definitions
└── constants/
    ├── characters.ts               # Valid flap character set
    ├── quotes.ts                   # Default quote library
    └── defaults.ts                 # Default settings values
```

### 2.2 No Router

This app has two states: display mode and settings overlay. No routing needed. The root `app.ts` toggles between them. Settings overlay is a CSS overlay on top of the board, triggered by keypress or mouse movement.

### 2.3 Dependency Injection

All services are singleton via Aurelia's DI. Register in `main.ts`:

```typescript
// main.ts
import Aurelia from 'aurelia';
import { App } from './app';
import { ContentManager } from './services/content-manager';
import { FlipScheduler } from './services/flip-scheduler';
import { AudioEngine } from './services/audio-engine';
import { QuoteLibrary } from './services/quote-library';
import { WeatherService } from './services/weather-service';
import { ThemeService } from './services/theme-service';
import { SettingsService } from './services/settings-service';

Aurelia.register(
  ContentManager,
  FlipScheduler,
  AudioEngine,
  QuoteLibrary,
  WeatherService,
  ThemeService,
  SettingsService,
).app(App).start();
```

## 3. Data Models

### 3.1 Board State

```typescript
// models/board-state.ts
export interface BoardState {
  rows: number;        // Default: 3
  cols: number;        // Default: 22 (fits most quotes at 16:9)
  cells: CellState[][]; // [row][col]
}

export interface CellState {
  currentChar: string;
  targetChar: string;
  isFlipping: boolean;
  flipDelay: number;   // ms delay for stagger effect
  accentColor: string | null; // null = no accent, otherwise hex color
}
```

### 3.2 Content Item

```typescript
// models/content-item.ts
export type ContentType = 'quote' | 'weather' | 'time' | 'custom' | 'scramble';

export interface ContentItem {
  type: ContentType;
  lines: string[];      // Up to 3 lines of text
  attribution?: string; // For quotes: "- STEVE JOBS"
  duration: number;     // How long to display in ms before cycling
  accentColors?: string[]; // Optional accent colors for this content
}
```

### 3.3 Theme

```typescript
// models/theme.ts
export interface Theme {
  id: string;
  name: string;
  flapBackground: string;      // Default: #1a1a1a
  flapText: string;            // Default: #e8e8e8
  boardBackground: string;     // Default: #000000
  accentColors: string[];      // Pool of marker/accent colors
}

export const AIRPORT_CLASSIC: Theme = {
  id: 'airport',
  name: 'Airport Classic',
  flapBackground: '#1a1a1a',
  flapText: '#e8e8e8',
  boardBackground: '#000000',
  accentColors: ['#2ecc71', '#e67e22', '#9b59b6', '#3498db', '#1abc9c', '#e74c3c'],
};
```

### 3.4 Character Set

```typescript
// constants/characters.ts
export const FLAP_CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-:;!?\'\"@#&()+-=/'.split('');

// Characters used during flip animation cycling (subset for visual interest)
export const CYCLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
```

## 4. Core Components

### 4.1 `flap-cell` (The Heart of the App)

This is where the magic happens. Each cell is a single flap unit that animates between characters using CSS 3D transforms.

**DOM Structure per cell:**

```html
<!-- flap-cell.html -->
<template class="flap-cell ${isFlipping ? 'flipping' : ''}">
  <div class="flap-container">
    <!-- Static top half showing current char -->
    <div class="flap-half flap-top">
      <span class="flap-text">${displayChar}</span>
    </div>

    <!-- Static bottom half showing current char -->
    <div class="flap-half flap-bottom">
      <span class="flap-text">${displayChar}</span>
    </div>

    <!-- Animated flap: top half rotates down to reveal next char -->
    <div
      class="flap-half flap-falling"
      css="animation-duration: ${flipDuration}ms; animation-delay: ${flipDelay}ms;"
      if.bind="isFlipping"
    >
      <span class="flap-text">${prevChar}</span>
    </div>

    <!-- Accent color indicator dot/bar -->
    <div
      class="accent-indicator"
      css="background-color: ${accentColor};"
      if.bind="accentColor"
    ></div>
  </div>
</template>
```

**Animation CSS (the critical bit):**

```css
.flap-cell {
  position: relative;
  width: var(--cell-width);   /* Calculated based on viewport */
  height: var(--cell-height);
  perspective: 300px;
  margin: 1px;
}

.flap-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.flap-half {
  position: absolute;
  width: 100%;
  height: 50%;
  overflow: hidden;
  background: var(--flap-bg, #1a1a1a);
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
}

.flap-top {
  top: 0;
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid #111;
  box-shadow: 0 1px 2px rgba(0,0,0,0.4);
}

.flap-top .flap-text {
  transform: translateY(50%);  /* Text spans both halves visually */
}

.flap-bottom {
  bottom: 0;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 3px rgba(0,0,0,0.5);
}

.flap-bottom .flap-text {
  transform: translateY(-50%);
}

.flap-falling {
  top: 0;
  transform-origin: bottom center;
  animation: flip-down var(--flip-duration, 300ms) ease-in forwards;
  z-index: 2;
}

.flap-falling .flap-text {
  transform: translateY(50%);
}

@keyframes flip-down {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-180deg);
  }
}

.flap-text {
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-weight: 700;
  font-size: var(--flap-font-size);
  color: var(--flap-text, #e8e8e8);
  letter-spacing: 0;
  user-select: none;
}

.accent-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
```

**Component Logic:**

```typescript
// elements/flap-cell/flap-cell.ts
import { bindable, customElement } from 'aurelia';
import { CYCLE_CHARS } from '../../constants/characters';

@customElement({ name: 'flap-cell', template })
export class FlapCell {
  @bindable() targetChar: string = ' ';
  @bindable() flipDelay: number = 0;
  @bindable() accentColor: string | null = null;

  displayChar: string = ' ';
  prevChar: string = ' ';
  isFlipping: boolean = false;
  flipDuration: number = 300;

  private cycleCount: number = 0;
  private cycleTimer: number | null = null;

  targetCharChanged(newVal: string): void {
    if (newVal === this.displayChar) return;
    this.startFlipSequence(newVal);
  }

  /**
   * Simulates mechanical cycling through intermediate characters
   * before landing on the target. Real split-flap boards cycle through
   * the character drum sequentially, so we cycle through 3-8 random
   * chars before settling.
   */
  private startFlipSequence(target: string): void {
    const totalCycles = 3 + Math.floor(Math.random() * 6); // 3-8 intermediate flips
    this.cycleCount = 0;

    const cycleDuration = this.flipDuration + 50; // small gap between flips

    setTimeout(() => {
      this.cycleTimer = window.setInterval(() => {
        this.cycleCount++;
        this.prevChar = this.displayChar;

        if (this.cycleCount >= totalCycles) {
          // Final flip to target
          this.displayChar = target;
          this.isFlipping = true;
          clearInterval(this.cycleTimer!);

          setTimeout(() => {
            this.isFlipping = false;
          }, this.flipDuration);
          return;
        }

        // Intermediate flip to random char
        this.displayChar = CYCLE_CHARS[Math.floor(Math.random() * CYCLE_CHARS.length)];
        this.isFlipping = true;

        setTimeout(() => {
          this.isFlipping = false;
        }, this.flipDuration);
      }, cycleDuration);
    }, this.flipDelay);
  }

  detached(): void {
    if (this.cycleTimer) clearInterval(this.cycleTimer);
  }
}
```

### 4.2 `flap-board`

The grid container. Manages rows and columns of `flap-cell` elements.

```typescript
// elements/flap-board/flap-board.ts
import { customElement, inject } from 'aurelia';
import { ContentManager } from '../../services/content-manager';
import { FlipScheduler } from '../../services/flip-scheduler';
import { ThemeService } from '../../services/theme-service';
import { BoardState, CellState } from '../../models/board-state';

@customElement({ name: 'flap-board', template })
@inject(ContentManager, FlipScheduler, ThemeService)
export class FlapBoard {
  rows: number = 3;
  cols: number = 22;
  board: CellState[][] = [];

  constructor(
    private contentManager: ContentManager,
    private flipScheduler: FlipScheduler,
    private themeService: ThemeService,
  ) {}

  attached(): void {
    this.initializeBoard();
    this.contentManager.onContentChange((content) => {
      this.updateBoard(content.lines);
    });
    this.contentManager.start();
    this.setCSSVariables();
  }

  private initializeBoard(): void {
    this.board = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({
        currentChar: ' ',
        targetChar: ' ',
        isFlipping: false,
        flipDelay: 0,
        accentColor: null,
      }))
    );
  }

  /**
   * Takes an array of text lines and maps them onto the board grid.
   * Each line is centered within the row. The FlipScheduler calculates
   * stagger delays so flaps don't all fire at once.
   */
  private updateBoard(lines: string[]): void {
    const delays = this.flipScheduler.calculateDelays(this.rows, this.cols);
    const accents = this.themeService.getRandomAccents(this.rows, this.cols);

    for (let row = 0; row < this.rows; row++) {
      const line = (lines[row] || '').toUpperCase().padEnd(this.cols, ' ');
      const centered = this.centerText(line, this.cols);

      for (let col = 0; col < this.cols; col++) {
        this.board[row][col] = {
          ...this.board[row][col],
          targetChar: centered[col] || ' ',
          flipDelay: delays[row][col],
          accentColor: accents[row][col],
        };
      }
    }
  }

  private centerText(text: string, width: number): string {
    const trimmed = text.trim();
    if (trimmed.length >= width) return trimmed.substring(0, width);
    const pad = Math.floor((width - trimmed.length) / 2);
    return ' '.repeat(pad) + trimmed + ' '.repeat(width - pad - trimmed.length);
  }

  private setCSSVariables(): void {
    // Calculate cell dimensions based on viewport
    // Target: board fills ~90% of viewport width, ~60% of viewport height
    const vw = window.innerWidth * 0.9;
    const vh = window.innerHeight * 0.6;
    const cellWidth = Math.floor(vw / this.cols);
    const cellHeight = Math.floor(vh / this.rows);
    const fontSize = Math.floor(cellHeight * 0.55);

    document.documentElement.style.setProperty('--cell-width', `${cellWidth}px`);
    document.documentElement.style.setProperty('--cell-height', `${cellHeight}px`);
    document.documentElement.style.setProperty('--flap-font-size', `${fontSize}px`);
  }
}
```

```html
<!-- flap-board.html -->
<template class="flap-board">
  <div class="board-grid" css="grid-template-columns: repeat(${cols}, var(--cell-width));">
    <template repeat.for="row of board">
      <flap-cell
        repeat.for="cell of row"
        target-char.bind="cell.targetChar"
        flip-delay.bind="cell.flipDelay"
        accent-color.bind="cell.accentColor"
      ></flap-cell>
    </template>
  </div>
</template>
```

### 4.3 `side-markers`

Colored bars on the left and right edges of the board. They change color on each content transition.

```html
<!-- side-markers.html -->
<template class="side-markers">
  <div class="marker-strip marker-left">
    <div
      repeat.for="color of leftColors"
      class="marker-block"
      css="background-color: ${color}; transition-delay: ${$index * 80}ms;"
    ></div>
  </div>
  <div class="marker-strip marker-right">
    <div
      repeat.for="color of rightColors"
      class="marker-block"
      css="background-color: ${color}; transition-delay: ${$index * 80}ms;"
    ></div>
  </div>
</template>
```

Each strip has 6-10 small colored rectangles. On each content change, the `ThemeService` randomly assigns colors from the active palette.

## 5. Services

### 5.1 ContentManager

Central orchestrator. Manages a queue of `ContentItem` objects and cycles through them on a timer.

```typescript
// services/content-manager.ts
import { inject } from 'aurelia';
import { QuoteLibrary } from './quote-library';
import { WeatherService } from './weather-service';
import { SettingsService } from './settings-service';
import { ContentItem } from '../models/content-item';

@inject(QuoteLibrary, WeatherService, SettingsService)
export class ContentManager {
  private queue: ContentItem[] = [];
  private currentIndex: number = 0;
  private timer: number | null = null;
  private listeners: Array<(content: ContentItem) => void> = [];

  constructor(
    private quotes: QuoteLibrary,
    private weather: WeatherService,
    private settings: SettingsService,
  ) {}

  onContentChange(callback: (content: ContentItem) => void): void {
    this.listeners.push(callback);
  }

  start(): void {
    this.buildQueue();
    this.showNext();
  }

  stop(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  /**
   * Builds the content queue based on active content modes.
   * Inserts a scramble transition between every real content item.
   * Queue rebuilds periodically to refresh weather data, etc.
   */
  private buildQueue(): void {
    this.queue = [];
    const modes = this.settings.getActiveModes();

    if (modes.includes('quotes')) {
      const quotes = this.quotes.getRotation(10); // Next 10 quotes
      for (const q of quotes) {
        this.queue.push({
          type: 'scramble',
          lines: [],
          duration: 2000,
        });
        this.queue.push(q);
      }
    }

    if (modes.includes('weather')) {
      this.queue.push({
        type: 'scramble',
        lines: [],
        duration: 2000,
      });
      // Weather item gets populated async
      this.queue.push(this.weather.getCurrentContentItem());
    }

    if (modes.includes('time')) {
      this.queue.push({
        type: 'scramble',
        lines: [],
        duration: 2000,
      });
      this.queue.push({
        type: 'time',
        lines: [], // Populated at display time
        duration: 15000,
      });
    }
  }

  private showNext(): void {
    if (this.queue.length === 0) {
      this.buildQueue();
    }

    const item = this.queue[this.currentIndex % this.queue.length];
    this.currentIndex++;

    // For time items, populate current time at display moment
    if (item.type === 'time') {
      item.lines = this.formatTime();
    }

    // For scramble, generate random characters
    if (item.type === 'scramble') {
      item.lines = this.generateScramble();
    }

    this.listeners.forEach(fn => fn(item));

    this.timer = window.setTimeout(() => {
      this.showNext();
    }, item.duration);
  }

  private formatTime(): string[] {
    const now = new Date();
    return [
      now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toUpperCase(),
      now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(),
    ];
  }

  private generateScramble(): string[] {
    // Random chars for visual transition effect
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 3 }, () =>
      Array.from({ length: 22 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    );
  }
}
```

### 5.2 FlipScheduler

Calculates stagger delays for the wave effect. Flaps don't all flip at once. They ripple across from left to right, or from center outward, or randomly. The pattern varies per transition.

```typescript
// services/flip-scheduler.ts
export type StaggerPattern = 'left-to-right' | 'center-out' | 'random' | 'top-down';

export class FlipScheduler {
  private baseDelay: number = 30;  // ms between each flap start
  private patterns: StaggerPattern[] = ['left-to-right', 'center-out', 'random', 'top-down'];

  /**
   * Returns a 2D array of delay values (in ms) for each cell position.
   * Pattern is randomly selected each time for variety.
   */
  calculateDelays(rows: number, cols: number): number[][] {
    const pattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
    const delays: number[][] = [];

    for (let r = 0; r < rows; r++) {
      delays[r] = [];
      for (let c = 0; c < cols; c++) {
        switch (pattern) {
          case 'left-to-right':
            delays[r][c] = (r * cols + c) * this.baseDelay;
            break;
          case 'center-out':
            const centerCol = Math.floor(cols / 2);
            const centerRow = Math.floor(rows / 2);
            const dist = Math.abs(c - centerCol) + Math.abs(r - centerRow);
            delays[r][c] = dist * this.baseDelay * 2;
            break;
          case 'random':
            delays[r][c] = Math.random() * (rows * cols * this.baseDelay);
            break;
          case 'top-down':
            delays[r][c] = (r * this.baseDelay * 5) + (c * this.baseDelay);
            break;
        }
      }
    }

    return delays;
  }
}
```

### 5.3 AudioEngine

Plays a short mechanical clack sample synced to each flap flip. Uses the Web Audio API for low-latency playback. A single AudioBuffer is loaded once and spawned per flip.

```typescript
// services/audio-engine.ts
import { SettingsService } from './settings-service';
import { inject } from 'aurelia';

@inject(SettingsService)
export class AudioEngine {
  private context: AudioContext | null = null;
  private clackBuffer: AudioBuffer | null = null;

  constructor(private settings: SettingsService) {}

  async initialize(): Promise<void> {
    this.context = new AudioContext();
    // Load the clack sample (a short ~50ms mechanical click)
    // Ship as a static asset in /static/audio/clack.wav
    const response = await fetch('/static/audio/clack.wav');
    const arrayBuffer = await response.arrayBuffer();
    this.clackBuffer = await this.context.decodeAudioData(arrayBuffer);
  }

  /**
   * Plays a single clack at the given delay offset.
   * Volume is scaled by user setting (0.0 - 1.0).
   * Each call creates a new buffer source (they're cheap and one-shot).
   */
  playClack(delayMs: number = 0): void {
    if (!this.context || !this.clackBuffer || !this.settings.isSoundEnabled()) return;

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();

    source.buffer = this.clackBuffer;
    gain.gain.value = this.settings.getVolume();

    source.connect(gain);
    gain.connect(this.context.destination);

    source.start(this.context.currentTime + delayMs / 1000);
  }

  /**
   * Fires clack sounds for an entire board transition.
   * Takes the same delay grid from FlipScheduler.
   */
  playBoardTransition(delays: number[][]): void {
    for (const row of delays) {
      for (const delay of row) {
        this.playClack(delay);
      }
    }
  }
}
```

**Audio asset note:** We need a single WAV file of a mechanical flap click, roughly 50ms long. Record from a real split-flap board or synthesize one. The sound should have a sharp attack and fast decay. A hard click, not a soft tap.

### 5.4 QuoteLibrary

Stores and rotates quotes. Ships with 50+ defaults. User can add custom ones via settings, stored in localStorage.

```typescript
// services/quote-library.ts
import { inject } from 'aurelia';
import { SettingsService } from './settings-service';
import { ContentItem } from '../models/content-item';
import { DEFAULT_QUOTES } from '../constants/quotes';

@inject(SettingsService)
export class QuoteLibrary {
  private quotes: ContentItem[] = [];
  private currentOffset: number = 0;

  constructor(private settings: SettingsService) {
    this.loadQuotes();
  }

  private loadQuotes(): void {
    const custom = this.settings.getCustomQuotes();
    const defaults = DEFAULT_QUOTES.map(q => this.formatQuote(q.text, q.author));
    this.quotes = [...defaults, ...custom];
    this.shuffle();
  }

  getRotation(count: number): ContentItem[] {
    const items = this.quotes.slice(this.currentOffset, this.currentOffset + count);
    this.currentOffset = (this.currentOffset + count) % this.quotes.length;
    if (this.currentOffset === 0) this.shuffle();
    return items;
  }

  /**
   * Formats a quote into 3 lines that fit the board width.
   * Line 1-2: quote text, word-wrapped.
   * Line 3: "- AUTHOR NAME" right-aligned.
   */
  private formatQuote(text: string, author: string): ContentItem {
    const maxWidth = 22; // board columns
    const words = text.toUpperCase().split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxWidth) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Trim to 2 lines max for the quote text
    const quoteLines = lines.slice(0, 2);

    // Attribution on line 3
    const attribution = `- ${author.toUpperCase()}`;

    return {
      type: 'quote',
      lines: [...quoteLines, attribution],
      attribution: author,
      duration: 45000, // 45 seconds per quote
    };
  }

  private shuffle(): void {
    for (let i = this.quotes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.quotes[i], this.quotes[j]] = [this.quotes[j], this.quotes[i]];
    }
  }
}
```

### 5.5 WeatherService

Simple fetch from OpenWeatherMap (or similar). Polls every 15 minutes. Formats for 3-line display.

```typescript
// services/weather-service.ts
import { inject } from 'aurelia';
import { SettingsService } from './settings-service';
import { ContentItem } from '../models/content-item';

@inject(SettingsService)
export class WeatherService {
  private cachedWeather: ContentItem | null = null;
  private lastFetch: number = 0;

  constructor(private settings: SettingsService) {}

  getCurrentContentItem(): ContentItem {
    this.refreshIfStale();
    return this.cachedWeather || {
      type: 'weather',
      lines: ['WEATHER', 'UNAVAILABLE', ''],
      duration: 15000,
    };
  }

  private async refreshIfStale(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFetch < 15 * 60 * 1000 && this.cachedWeather) return;

    const apiKey = this.settings.getWeatherApiKey();
    const location = this.settings.getLocation();
    if (!apiKey || !location) return;

    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );
      const data = await resp.json();

      this.cachedWeather = {
        type: 'weather',
        lines: [
          `${data.name.toUpperCase()}`,
          `${Math.round(data.main.temp)}C  ${data.weather[0].main.toUpperCase()}`,
          `H:${Math.round(data.main.temp_max)}C  L:${Math.round(data.main.temp_min)}C`,
        ],
        duration: 15000,
      };
      this.lastFetch = now;
    } catch (e) {
      console.error('Weather fetch failed:', e);
    }
  }
}
```

### 5.6 ThemeService

Manages color palettes. Provides random accent color assignments for board transitions.

```typescript
// services/theme-service.ts
import { inject } from 'aurelia';
import { SettingsService } from './settings-service';
import { Theme, AIRPORT_CLASSIC } from '../models/theme';

@inject(SettingsService)
export class ThemeService {
  private activeTheme: Theme = AIRPORT_CLASSIC;

  /**
   * Returns a 2D grid of accent colors (or null for no accent).
   * Only ~10-15% of cells get an accent color for visual interest.
   * Accents cluster slightly rather than being perfectly random.
   */
  getRandomAccents(rows: number, cols: number): (string | null)[][] {
    const accents: (string | null)[][] = [];

    for (let r = 0; r < rows; r++) {
      accents[r] = [];
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.12) {
          const colorPool = this.activeTheme.accentColors;
          accents[r][c] = colorPool[Math.floor(Math.random() * colorPool.length)];
        } else {
          accents[r][c] = null;
        }
      }
    }

    return accents;
  }

  getMarkerColors(count: number): string[] {
    return Array.from({ length: count }, () => {
      const pool = this.activeTheme.accentColors;
      return pool[Math.floor(Math.random() * pool.length)];
    });
  }

  setTheme(theme: Theme): void {
    this.activeTheme = theme;
    document.documentElement.style.setProperty('--flap-bg', theme.flapBackground);
    document.documentElement.style.setProperty('--flap-text', theme.flapText);
    document.documentElement.style.setProperty('--board-bg', theme.boardBackground);
  }
}
```

### 5.7 SettingsService

localStorage wrapper. Persists all user preferences.

```typescript
// services/settings-service.ts
export class SettingsService {
  private prefix = 'flipflap_';

  // Content modes
  getActiveModes(): string[] {
    return this.get('modes', ['quotes']);
  }

  // Sound
  isSoundEnabled(): boolean {
    return this.get('sound', true);
  }

  getVolume(): number {
    return this.get('volume', 0.5);
  }

  // Weather
  getWeatherApiKey(): string | null {
    return this.get('weather_api_key', null);
  }

  getLocation(): string | null {
    return this.get('location', null);
  }

  // Custom quotes
  getCustomQuotes(): any[] {
    return this.get('custom_quotes', []);
  }

  // Cycle duration
  getCycleDuration(): number {
    return this.get('cycle_duration', 45000);
  }

  // Generic get/set
  get<T>(key: string, defaultVal: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  set(key: string, value: any): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }
}
```

## 6. Settings Overlay

Hidden by default. Appears when the user moves the mouse or presses any key. Auto-hides after 10 seconds of inactivity. Provides controls for:

- Content modes (toggle quotes / weather / time / custom)
- Cycle speed (slider: 15s to 120s per item)
- Volume (slider: 0 to 100%)
- Sound on/off
- Theme selection (dropdown)
- Weather location + API key input
- Custom quote input (text area, one quote per entry)
- Board size (rows and columns, for different aspect ratios)

The overlay is a semi-transparent dark panel that slides in from the top. It does not interrupt the board animation. The board continues running behind it.

```typescript
// elements/settings-overlay/settings-overlay.ts
import { customElement, inject } from 'aurelia';
import { SettingsService } from '../../services/settings-service';

@customElement({ name: 'settings-overlay', template })
@inject(SettingsService)
export class SettingsOverlay {
  visible: boolean = false;
  private hideTimer: number | null = null;

  constructor(private settings: SettingsService) {}

  attached(): void {
    document.addEventListener('mousemove', () => this.show());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      } else {
        this.show();
      }
    });
  }

  show(): void {
    this.visible = true;
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.hide(), 10000);
  }

  hide(): void {
    this.visible = false;
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
}
```

## 7. CSS Variables & Theming

All visual properties go through CSS variables set on `:root`. This makes theme switching instant and keeps the CSS clean.

```css
:root {
  /* Board */
  --board-bg: #000000;
  --board-padding: 2vw;

  /* Flaps */
  --flap-bg: #1a1a1a;
  --flap-text: #e8e8e8;
  --flap-font-size: 2.5vw;   /* Overridden by JS based on grid size */
  --cell-width: 3.8vw;       /* Overridden by JS */
  --cell-height: 5.5vw;      /* Overridden by JS */
  --flap-radius: 4px;
  --flap-gap: 2px;
  --flip-duration: 300ms;

  /* Shadows for depth */
  --flap-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  --flap-inner-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.3);
}

/* Board fills the screen */
.flap-board {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: var(--board-bg);
  padding: var(--board-padding);
  box-sizing: border-box;
}

.board-grid {
  display: grid;
  gap: var(--flap-gap);
}
```

## 8. Performance Considerations

### 8.1 Animation Performance

CSS 3D transforms are GPU-accelerated. Each flap flip is a `rotateX` transform which the compositor handles without layout repaints. This is the reason we avoid Canvas/WebGL. CSS transforms on individual elements give us per-flap control with hardware acceleration for free.

Add `will-change: transform` to `.flap-falling` elements to hint the browser to promote them to their own compositor layer.

```css
.flap-falling {
  will-change: transform;
}
```

### 8.2 Sound Performance

The Web Audio API creates and destroys buffer sources per flip. This is by design. Buffer sources are lightweight one-shot objects. Don't try to pool them. A board transition of 66 cells (3x22) at staggered intervals is well within the Audio API's capacity.

### 8.3 Memory

No meaningful memory concerns. The entire app state is a 3x22 grid of strings and a queue of content items. The audio buffer for the clack sound is ~5KB.

### 8.4 Target: 60fps

The only thing that could drop frames is too many simultaneous CSS animations. With staggered delays (30ms apart), we'll have at most 5-10 flaps animating simultaneously at any given moment. This is nothing for modern browsers.

## 9. Build & Deployment

### 9.1 Aurelia 2 Project Setup

```bash
npx makes aurelia
# Select: TypeScript, CSS, Webpack/Vite
```

Or if starting from an existing Aurelia 2 template:

```bash
npm install aurelia @aurelia/kernel @aurelia/runtime-html
```

### 9.2 Static Assets

```
static/
├── audio/
│   └── clack.wav          # Mechanical flap sound effect
└── fonts/
    └── (monospace font files if self-hosting)
```

### 9.3 Build Targets

**Web (primary):** Standard Aurelia 2 build. Serve from any static host. User opens in browser, hits F11 for fullscreen, done.

**PWA (optional):** Add a service worker and manifest for offline capability. The quote library and clack sound work offline. Weather requires network.

**Electron (optional, Phase 2):** Wrap in Electron for a native app experience with auto-fullscreen, auto-start on boot, and OS-level always-on-top.

### 9.4 Deployment

Any static host works. Vercel, Netlify, Cloudflare Pages, even just nginx serving the dist folder. The app is entirely client-side.

## 10. Phase Plan

### Phase 1 (MVP)

- `flap-cell` component with CSS 3D flip animation
- `flap-board` grid layout with responsive sizing
- `FlipScheduler` with left-to-right stagger pattern
- `QuoteLibrary` with 50 hardcoded quotes
- `ContentManager` with quote cycling
- Side marker colored accents
- Fullscreen mode
- Basic audio (clack sound on flip)

### Phase 2

- Settings overlay with all controls
- Theme switching
- Weather integration (OpenWeatherMap)
- Time display mode
- Custom quote input via settings
- All stagger patterns (center-out, random, top-down)
- Volume control

### Phase 3

- PWA support with offline mode
- Companion dashboard (separate web page for remote content management)
- Additional content feeds (crypto, stocks, RSS)
- Electron wrapper
- Ambient hum sound option

## 11. Open Questions

1. **Grid dimensions:** The PRD says 20-30 columns. I've specced 22 as a default. Need to test different values against common TV aspect ratios. Should be user-configurable anyway.

2. **Font choice:** Roboto Mono is solid but generic. Worth looking at more characterful monospace options. The font needs to read well at large sizes on a TV from across the room. Maybe IBM Plex Mono or JetBrains Mono for a bit more personality.

3. **Scramble transitions:** The PRD describes full board scrambles between content. How long should they last? I've specced 2 seconds. Might need tuning based on how it feels in practice. Too fast and you miss it. Too slow and it's annoying.

4. **Audio licensing:** We need a clean mechanical clack sample. Either record one, synthesize one with Web Audio, or find a CC0 sample. Don't use anything with unclear licensing.

5. **Accent color placement:** The PRD mentions colored blocks on random flaps. I've implemented this as small dot indicators below the character. The video might show the entire flap background in color instead. Need to check the reference video and adjust.