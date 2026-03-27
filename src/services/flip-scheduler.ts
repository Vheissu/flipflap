export type StaggerPattern = 'left-to-right' | 'center-out' | 'random' | 'top-down';

export class FlipScheduler {
  private readonly baseDelay = 26;
  private readonly patterns: StaggerPattern[] = ['left-to-right', 'center-out', 'random', 'top-down'];

  calculateDelays(rows: number, cols: number): number[][] {
    const pattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
    const delays: number[][] = [];

    for (let row = 0; row < rows; row++) {
      delays[row] = [];
      for (let col = 0; col < cols; col++) {
        switch (pattern) {
          case 'center-out': {
            const centerCol = Math.floor(cols / 2);
            const centerRow = Math.floor(rows / 2);
            const distance = Math.abs(col - centerCol) + Math.abs(row - centerRow);
            delays[row][col] = distance * this.baseDelay * 2;
            break;
          }
          case 'random':
            delays[row][col] = Math.floor(Math.random() * rows * cols * this.baseDelay * 0.33);
            break;
          case 'top-down':
            delays[row][col] = row * this.baseDelay * 7 + col * this.baseDelay;
            break;
          case 'left-to-right':
          default:
            delays[row][col] = row * cols * this.baseDelay + col * this.baseDelay;
            break;
        }
      }
    }

    return delays;
  }
}
