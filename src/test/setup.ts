import '@testing-library/jest-dom/vitest';

// JSDOM mock for Element.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function () {};

// JSDOM mock for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
