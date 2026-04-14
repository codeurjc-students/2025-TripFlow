import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test case
afterEach(() => cleanup())

// Suppress React act() warnings that don't affect test behavior
const originalConsoleError = console.error
console.error = vi.fn((message, ...args) => {
  if (
    typeof message === 'string' &&
    message.includes('An update to') &&
    message.includes('was not wrapped in act')
  ) {
    return
  }
  if (
    typeof message === 'string' &&
    message.includes('Not implemented: navigation (except hash changes)')
  ) {
    return
  }
  originalConsoleError(message, ...args)
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
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
