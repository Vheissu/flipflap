import { describe, it, expect } from 'vitest';
import { createFixture } from '@aurelia/testing';
import { Registration } from 'aurelia';
import { SideMarkers } from '../../src/resources/elements/side-markers/side-markers';
import { ContentManager } from '../../src/services/content-manager';

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
  };
}

describe('side-markers', () => {
  it('renders left and right marker strips', async () => {
    const { appHost } = await createFixture(
      '<side-markers></side-markers>',
      {},
      [SideMarkers],
      [Registration.instance(ContentManager, createMockContentManager())],
    ).started;

    expect(appHost.querySelector('.marker-left')).not.toBeNull();
    expect(appHost.querySelector('.marker-right')).not.toBeNull();
  });

  it('renders marker blocks in each strip', async () => {
    const { appHost } = await createFixture(
      '<side-markers></side-markers>',
      {},
      [SideMarkers],
      [Registration.instance(ContentManager, createMockContentManager())],
    ).started;

    const leftBlocks = appHost.querySelectorAll('.marker-left .marker-block');
    const rightBlocks = appHost.querySelectorAll('.marker-right .marker-block');
    expect(leftBlocks.length).toBe(8);
    expect(rightBlocks.length).toBe(8);
  });

  it('applies background-color style to each marker', async () => {
    const { appHost } = await createFixture(
      '<side-markers></side-markers>',
      {},
      [SideMarkers],
      [Registration.instance(ContentManager, createMockContentManager())],
    ).started;

    const blocks = appHost.querySelectorAll('.marker-block');
    for (const block of blocks) {
      const style = (block as HTMLElement).style.backgroundColor;
      expect(style).toBeTruthy();
    }
  });

  it('renders the side-markers wrapper', async () => {
    const { appHost } = await createFixture(
      '<side-markers></side-markers>',
      {},
      [SideMarkers],
      [Registration.instance(ContentManager, createMockContentManager())],
    ).started;

    expect(appHost.querySelector('.side-markers')).not.toBeNull();
  });
});
