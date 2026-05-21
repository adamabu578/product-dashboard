import '@testing-library/jest-dom';
import { vi } from 'vitest';

global.fetch = vi.fn().mockImplementation(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve([])
})) as any;

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;
