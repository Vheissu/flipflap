export type ContentType = 'quote' | 'weather' | 'time' | 'custom' | 'scramble';
export type DisplayMode = 'quote' | 'quotes' | 'weather' | 'time' | 'custom' | 'scramble';

export interface ContentItem {
  type: ContentType;
  lines: string[];
  attribution?: string;
  duration: number;
  accentColors?: string[];
}
