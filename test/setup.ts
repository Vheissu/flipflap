import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform, onFixtureCreated, type IFixture } from '@aurelia/testing';
import { beforeAll, beforeEach, afterEach } from 'vitest';

// Node 22+ ships an experimental `globalThis.localStorage` without `clear()`.
// Provide a full Storage polyfill so tests can call `localStorage.clear()`.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  [Symbol.iterator](): IterableIterator<string> {
    return this.store.keys();
  }

  [name: string]: any;
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true, configurable: true });
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: storage, writable: true, configurable: true });
}

function bootstrapTestEnv() {
  const platform = new BrowserPlatform(window);
  setPlatform(platform);
  BrowserPlatform.set(globalThis, platform);
}

const fixtures: IFixture<object>[] = [];
beforeAll(() => {
  bootstrapTestEnv();
  onFixtureCreated((fixture) => {
    fixtures.push(fixture);
  });
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(async () => {
  for (const f of fixtures) {
    try {
      await f.stop(true);
    } catch {
      /* ignore cleanup errors */
    }
  }
  fixtures.length = 0;
});
