export interface BoardState {
  rows: number;
  cols: number;
  cells: CellState[][];
}

export interface CellState {
  currentChar: string;
  targetChar: string;
  isFlipping: boolean;
  flipDelay: number;
  accentColor: string | null;
}
