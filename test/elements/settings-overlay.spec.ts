import { describe, it, expect } from 'vitest';
import { createFixture } from '@aurelia/testing';
import { CustomElement } from 'aurelia';
import { SettingsOverlay } from '../../src/resources/elements/settings-overlay/settings-overlay';
import { SettingsService } from '../../src/services/settings-service';

describe('settings-overlay', () => {
  it('renders with is-visible class when visible', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay visible.bind="true"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const overlay = appHost.querySelector('.settings-overlay');
    expect(overlay?.classList.contains('is-visible')).toBe(true);
  });

  it('does not have is-visible class when hidden', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay visible.bind="false"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const overlay = appHost.querySelector('.settings-overlay');
    expect(overlay?.classList.contains('is-visible')).toBe(false);
  });

  it('renders the settings panel', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    expect(appHost.querySelector('.settings-panel')).not.toBeNull();
  });

  it('renders a close button', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const closeBtn = appHost.querySelector('.ghost-button');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn?.textContent?.trim()).toBe('Close');
  });

  it('renders content mode checkboxes', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay visible.bind="true"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const toggleRows = appHost.querySelectorAll('.toggle-row');
    expect(toggleRows.length).toBeGreaterThanOrEqual(4);
  });

  it('renders theme selector', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay visible.bind="true"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const select = appHost.querySelector('select');
    expect(select).not.toBeNull();
    const options = select?.querySelectorAll('option');
    expect(options?.length).toBe(3);
  });

  it('renders backdrop for click-to-close', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    expect(appHost.querySelector('.settings-backdrop')).not.toBeNull();
  });

  it('renders settings header with title', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const header = appHost.querySelector('.settings-header h2');
    expect(header?.textContent?.trim()).toBe('Flipflap Console');
  });

  it('renders board size inputs', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay visible.bind="true"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const numberInputs = appHost.querySelectorAll('input[type="number"]');
    expect(numberInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders custom quotes textarea', async () => {
    const { appHost } = await createFixture(
      '<settings-overlay visible.bind="true"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    expect(appHost.querySelector('textarea')).not.toBeNull();
  });
});

describe('settings-overlay quote parsing', () => {
  it('parses pipe-separated format', async () => {
    const { appHost, container } = await createFixture(
      '<settings-overlay visible.bind="true"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const el = appHost.querySelector('settings-overlay')!;
    const vm = CustomElement.for<SettingsOverlay>(el).viewModel;
    vm.customQuoteDraft = 'Stay hungry | Steve Jobs';
    vm.persistQuotes();

    const settings = container.get(SettingsService);
    const quotes = settings.getCustomQuotes();
    expect(quotes).toHaveLength(1);
    expect(quotes[0].text).toBe('Stay hungry');
    expect(quotes[0].author).toBe('Steve Jobs');
  });

  it('parses dash-separated format', async () => {
    const { appHost, container } = await createFixture(
      '<settings-overlay visible.bind="true"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const el = appHost.querySelector('settings-overlay')!;
    const vm = CustomElement.for<SettingsOverlay>(el).viewModel;
    vm.customQuoteDraft = 'Be water my friend - Bruce Lee';
    vm.persistQuotes();

    const settings = container.get(SettingsService);
    const quotes = settings.getCustomQuotes();
    expect(quotes).toHaveLength(1);
    expect(quotes[0].text).toBe('Be water my friend');
    expect(quotes[0].author).toBe('Bruce Lee');
  });

  it('uses CUSTOM as author when no separator', async () => {
    const { appHost, container } = await createFixture(
      '<settings-overlay visible.bind="true"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const el = appHost.querySelector('settings-overlay')!;
    const vm = CustomElement.for<SettingsOverlay>(el).viewModel;
    vm.customQuoteDraft = 'Just a plain quote';
    vm.persistQuotes();

    const settings = container.get(SettingsService);
    const quotes = settings.getCustomQuotes();
    expect(quotes).toHaveLength(1);
    expect(quotes[0].author).toBe('CUSTOM');
  });

  it('skips empty lines', async () => {
    const { appHost, container } = await createFixture(
      '<settings-overlay visible.bind="true"></settings-overlay>',
      {},
      [SettingsOverlay],
    ).started;

    const el = appHost.querySelector('settings-overlay')!;
    const vm = CustomElement.for<SettingsOverlay>(el).viewModel;
    vm.customQuoteDraft = 'One | Author\n\n\nTwo | Author';
    vm.persistQuotes();

    const settings = container.get(SettingsService);
    expect(settings.getCustomQuotes()).toHaveLength(2);
  });
});
