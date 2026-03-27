import type { DisplayMode } from '../models/content-item';

export const DEFAULT_ROWS = 6;
export const DEFAULT_COLS = 22;
export const DEFAULT_CYCLE_DURATION = 45000;
export const DEFAULT_SCRAMBLE_DURATION = 2000;
export const DEFAULT_VOLUME = 0.45;
export const DEFAULT_THEME_ID = 'airport';
export const DEFAULT_MODES: DisplayMode[] = ['quotes', 'time'];
export const SETTINGS_PREFIX = 'flipflap_';

export const AVAILABLE_MODES: Array<{ id: DisplayMode; label: string; description: string }> = [
  { id: 'quotes', label: 'Quotes', description: 'Rotate the bundled quote library.' },
  { id: 'custom', label: 'Custom', description: 'Show your own quote entries from settings.' },
  { id: 'weather', label: 'Weather', description: 'Display current weather for one location.' },
  { id: 'time', label: 'Time', description: 'Use the board as a live clock between messages.' },
];
