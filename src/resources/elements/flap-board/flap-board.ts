import { customElement, resolve } from 'aurelia';
import template from './flap-board.html';
import { DEFAULT_COLS, DEFAULT_ROWS } from '../../../constants/defaults';
import type { CellState } from '../../../models/board-state';
import type { ContentItem } from '../../../models/content-item';
import { AudioEngine } from '../../../services/audio-engine';
import { ContentManager } from '../../../services/content-manager';
import { FlipScheduler } from '../../../services/flip-scheduler';
import { SettingsService } from '../../../services/settings-service';

@customElement({
  name: 'flap-board',
  template,
})
export class FlapBoard {
  private readonly contentManager = resolve(ContentManager);
  private readonly flipScheduler = resolve(FlipScheduler);
  private readonly settings = resolve(SettingsService);
  private readonly audio = resolve(AudioEngine);

  rows = DEFAULT_ROWS;
  cols = DEFAULT_COLS;
  board: CellState[][] = [];

  private currentLines: string[] = [];
  private stopContentListener: (() => void) | null = null;
  private stopSettingsListener: (() => void) | null = null;

  attached(): void {
    this.syncDimensions();
    this.initializeBoard();
    this.setCSSVariables();
    this.stopContentListener = this.contentManager.onContentChange((content) => {
      this.renderContent(content);
    });
    this.stopSettingsListener = this.settings.subscribe(() => {
      this.handleSettingsChanged();
    });
    window.addEventListener('resize', this.handleResize);
    this.contentManager.start();
  }

  detached(): void {
    this.stopContentListener?.();
    this.stopSettingsListener?.();
    window.removeEventListener('resize', this.handleResize);
  }

  private renderContent(content: ContentItem): void {
    this.currentLines = content.lines;
    this.updateBoard(content.lines);
  }

  private handleSettingsChanged(): void {
    const previousRows = this.rows;
    const previousCols = this.cols;

    this.syncDimensions();
    if (previousRows !== this.rows || previousCols !== this.cols) {
      this.initializeBoard();
      if (this.currentLines.length > 0) {
        this.updateBoard(this.currentLines);
      }
    }

    this.setCSSVariables();
  }

  private initializeBoard(): void {
    this.board = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, (): CellState => ({
        currentChar: ' ',
        targetChar: ' ',
        isFlipping: false,
        flipDelay: 0,
        accentColor: null,
      }))
    );
  }

  private updateBoard(lines: string[]): void {
    const normalizedLines = this.fitLinesToBoard(lines);
    const delays = this.flipScheduler.calculateDelays(this.rows, this.cols);
    const changeMap: boolean[][] = [];
    const nextBoard: CellState[][] = [];

    for (let row = 0; row < this.rows; row++) {
      const line = normalizedLines[row] ?? ''.padEnd(this.cols, ' ');
      changeMap[row] = [];
      nextBoard[row] = [];

      for (let col = 0; col < this.cols; col++) {
        const nextChar = line[col] ?? ' ';
        const previousChar = this.board[row][col]?.targetChar ?? ' ';
        changeMap[row][col] = previousChar !== nextChar;
        nextBoard[row][col] = {
          ...this.board[row][col],
          currentChar: previousChar,
          targetChar: nextChar,
          flipDelay: delays[row][col],
          accentColor: null,
        };
      }
    }

    this.board = nextBoard;
    this.audio.playBoardTransition(delays, changeMap);
  }

  private fitLinesToBoard(lines: string[]): string[] {
    const prepared = lines.map((line) => this.centerText(line.toUpperCase().slice(0, this.cols), this.cols)).slice(0, this.rows);
    const output = Array.from({ length: this.rows }, () => ''.padEnd(this.cols, ' '));
    const startRow = Math.max(0, Math.floor((this.rows - prepared.length) / 2));

    for (let index = 0; index < prepared.length; index++) {
      output[startRow + index] = prepared[index];
    }

    return output;
  }

  private centerText(text: string, width: number): string {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return ''.padEnd(width, ' ');
    }

    if (trimmed.length >= width) {
      return trimmed.slice(0, width);
    }

    const pad = Math.floor((width - trimmed.length) / 2);
    return `${' '.repeat(pad)}${trimmed}${' '.repeat(width - pad - trimmed.length)}`;
  }

  private syncDimensions(): void {
    this.rows = this.settings.getRows();
    this.cols = this.settings.getCols();
  }

  private setCSSVariables(): void {
    const root = document.documentElement;
    const availableWidth = window.innerWidth * 0.88;
    const availableHeight = window.innerHeight * 0.80;
    const widthLimited = availableWidth / this.cols;
    const heightLimited = availableHeight / this.rows / 1.42;
    const cellWidth = Math.max(20, Math.floor(Math.min(widthLimited, heightLimited)));
    const cellHeight = Math.max(32, Math.floor(cellWidth * 1.42));
    const fontSize = Math.max(18, Math.floor(cellHeight * 0.59));

    root.style.setProperty('--cell-width', `${cellWidth}px`);
    root.style.setProperty('--cell-height', `${cellHeight}px`);
    root.style.setProperty('--flap-font-size', `${fontSize}px`);
  }

  private readonly handleResize = (): void => {
    this.setCSSVariables();
  };
}
