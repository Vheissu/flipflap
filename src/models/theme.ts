export interface Theme {
  id: string;
  name: string;
  flapBackground: string;
  flapText: string;
  boardBackground: string;
  boardGradient: string;
  accentColors: string[];
  markerGlow: string;
}

export const AIRPORT_CLASSIC: Theme = {
  id: 'airport',
  name: 'Airport Classic',
  flapBackground: '#1d1e21',
  flapText: '#eef0ea',
  boardBackground: '#070809',
  boardGradient: 'radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 42%), linear-gradient(180deg, #0c0d10 0%, #040506 100%)',
  accentColors: ['#2ecc71', '#e67e22', '#3498db', '#f1c40f', '#e74c3c', '#8bd6c5'],
  markerGlow: 'rgba(241, 196, 15, 0.24)',
};

export const BRASS_TERMINAL: Theme = {
  id: 'brass',
  name: 'Brass Terminal',
  flapBackground: '#221b16',
  flapText: '#f5ead9',
  boardBackground: '#090705',
  boardGradient: 'radial-gradient(circle at center, rgba(193, 154, 107, 0.10), transparent 48%), linear-gradient(180deg, #120e0a 0%, #050403 100%)',
  accentColors: ['#d8893b', '#c0392b', '#9bc53d', '#5bc0eb', '#f4d35e', '#c3a16b'],
  markerGlow: 'rgba(216, 137, 59, 0.24)',
};

export const POLAR_SIGNAL: Theme = {
  id: 'polar',
  name: 'Polar Signal',
  flapBackground: '#10161c',
  flapText: '#edf5fa',
  boardBackground: '#010408',
  boardGradient: 'radial-gradient(circle at top right, rgba(91, 192, 235, 0.12), transparent 35%), linear-gradient(180deg, #091019 0%, #010408 100%)',
  accentColors: ['#5bc0eb', '#d9f0ff', '#8bd6c5', '#ff7f50', '#6fffe9', '#ffcf56'],
  markerGlow: 'rgba(91, 192, 235, 0.24)',
};

export const THEMES: Theme[] = [AIRPORT_CLASSIC, BRASS_TERMINAL, POLAR_SIGNAL];
