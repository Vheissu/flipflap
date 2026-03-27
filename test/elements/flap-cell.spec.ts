import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFixture } from '@aurelia/testing';
import { FlapCell } from '../../src/resources/elements/flap-cell/flap-cell';

describe('flap-cell', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders four flap layers', async () => {
    const { appHost } = await createFixture(
      '<flap-cell></flap-cell>',
      {},
      [FlapCell],
    ).started;

    const layers = appHost.querySelectorAll('.flap-half');
    expect(layers).toHaveLength(4);
  });

  it('renders flap-top, flap-bottom, flap-front, flap-back', async () => {
    const { appHost } = await createFixture(
      '<flap-cell></flap-cell>',
      {},
      [FlapCell],
    ).started;

    expect(appHost.querySelector('.flap-top')).not.toBeNull();
    expect(appHost.querySelector('.flap-bottom')).not.toBeNull();
    expect(appHost.querySelector('.flap-front')).not.toBeNull();
    expect(appHost.querySelector('.flap-back')).not.toBeNull();
  });

  it('displays space character by default', async () => {
    const { appHost } = await createFixture(
      '<flap-cell></flap-cell>',
      {},
      [FlapCell],
    ).started;

    const bottomText = appHost.querySelector('.flap-bottom .flap-text');
    expect(bottomText?.textContent?.trim()).toBe('');
  });

  it('does not apply is-flipping on init with default char', async () => {
    const { appHost } = await createFixture(
      '<flap-cell target-char.bind="char"></flap-cell>',
      { char: ' ' },
      [FlapCell],
    ).started;

    const front = appHost.querySelector('.flap-front');
    expect(front?.classList.contains('is-flipping')).toBe(false);
  });

  it('has a flap-container element', async () => {
    const { appHost } = await createFixture(
      '<flap-cell></flap-cell>',
      {},
      [FlapCell],
    ).started;

    expect(appHost.querySelector('.flap-container')).not.toBeNull();
  });

  it('has a root flap-cell element', async () => {
    const { appHost } = await createFixture(
      '<flap-cell></flap-cell>',
      {},
      [FlapCell],
    ).started;

    expect(appHost.querySelector('.flap-cell')).not.toBeNull();
  });
});
