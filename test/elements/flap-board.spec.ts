import { describe, it, expect } from 'vitest';
import { createFixture } from '@aurelia/testing';
import { Registration } from 'aurelia';
import { FlapBoard } from '../../src/resources/elements/flap-board/flap-board';
import { FlapCell } from '../../src/resources/elements/flap-cell/flap-cell';
import { SettingsService } from '../../src/services/settings-service';
import { ContentManager } from '../../src/services/content-manager';
import { FlipScheduler } from '../../src/services/flip-scheduler';
import { AudioEngine } from '../../src/services/audio-engine';

function createMockContentManager() {
  const listeners: Array<(content: any) => void> = [];
  return {
    onContentChange: (cb: (content: any) => void) => {
      listeners.push(cb);
      return () => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
    start: () => {},
    _emit: (content: any) => {
      for (const listener of listeners) listener(content);
    },
  };
}

function createMockAudioEngine() {
  return {
    playBoardTransition: () => {},
    playFlap: () => {},
  };
}

describe('flap-board', () => {
  it('renders the correct number of flap-cell elements', async () => {
    const settings = new SettingsService();
    settings.setRows(3);
    settings.setCols(15);

    const { appHost } = await createFixture(
      '<flap-board></flap-board>',
      {},
      [FlapBoard, FlapCell],
      [
        Registration.instance(SettingsService, settings),
        Registration.instance(ContentManager, createMockContentManager()),
        Registration.instance(AudioEngine, createMockAudioEngine()),
      ],
    ).started;

    const cells = appHost.querySelectorAll('flap-cell');
    expect(cells.length).toBe(3 * 15);
  });

  it('sets grid-template-columns matching col count', async () => {
    const settings = new SettingsService();
    settings.setCols(20);

    const { appHost } = await createFixture(
      '<flap-board></flap-board>',
      {},
      [FlapBoard, FlapCell],
      [
        Registration.instance(SettingsService, settings),
        Registration.instance(ContentManager, createMockContentManager()),
        Registration.instance(AudioEngine, createMockAudioEngine()),
      ],
    ).started;

    const grid = appHost.querySelector('.board-grid') as HTMLElement;
    expect(grid).not.toBeNull();
    expect(grid.style.gridTemplateColumns).toContain('repeat(20');
  });

  it('renders a board-grid container', async () => {
    const { appHost } = await createFixture(
      '<flap-board></flap-board>',
      {},
      [FlapBoard, FlapCell],
      [
        Registration.instance(ContentManager, createMockContentManager()),
        Registration.instance(AudioEngine, createMockAudioEngine()),
      ],
    ).started;

    expect(appHost.querySelector('.board-grid')).not.toBeNull();
  });

  it('renders the flap-board wrapper', async () => {
    const { appHost } = await createFixture(
      '<flap-board></flap-board>',
      {},
      [FlapBoard, FlapCell],
      [
        Registration.instance(ContentManager, createMockContentManager()),
        Registration.instance(AudioEngine, createMockAudioEngine()),
      ],
    ).started;

    expect(appHost.querySelector('.flap-board')).not.toBeNull();
  });
});
