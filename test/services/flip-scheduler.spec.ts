import { describe, it, expect } from 'vitest';
import { FlipScheduler } from '../../src/services/flip-scheduler';

describe('FlipScheduler', () => {
  const scheduler = new FlipScheduler();

  it('returns a grid matching the requested dimensions', () => {
    const delays = scheduler.calculateDelays(4, 10);
    expect(delays).toHaveLength(4);
    for (const row of delays) {
      expect(row).toHaveLength(10);
    }
  });

  it('produces only non-negative numbers', () => {
    for (let run = 0; run < 20; run++) {
      const delays = scheduler.calculateDelays(6, 22);
      for (const row of delays) {
        for (const delay of row) {
          expect(delay).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(delay)).toBe(true);
        }
      }
    }
  });

  it('handles a single cell board', () => {
    const delays = scheduler.calculateDelays(1, 1);
    expect(delays).toHaveLength(1);
    expect(delays[0]).toHaveLength(1);
    expect(delays[0][0]).toBeGreaterThanOrEqual(0);
  });

  it('handles a large board without errors', () => {
    const delays = scheduler.calculateDelays(12, 40);
    expect(delays).toHaveLength(12);
    expect(delays[0]).toHaveLength(40);
  });
});
