import { renderHook } from '@testing-library/react';
import { useIsPWA } from '../../src/hooks/useIsPWA';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useIsPWA', () => {
    let originalMatchMedia: any;
    let addEventListenerMock: any;
    let removeEventListenerMock: any;

    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
        
        addEventListenerMock = vi.fn();
        removeEventListenerMock = vi.fn();

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addEventListener: addEventListenerMock,
                removeEventListener: removeEventListenerMock,
                dispatchEvent: vi.fn(),
            })),
        });
        
        Object.defineProperty(window.navigator, 'standalone', {
            writable: true,
            value: undefined,
        });
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
    });

    it('should return false by default if not standalone', () => {
        const { result } = renderHook(() => useIsPWA());
        expect(result.current).toBe(false);
    });

    it('should return true if matchMedia matches standalone', () => {
        window.matchMedia = vi.fn().mockImplementation(() => ({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));

        const { result } = renderHook(() => useIsPWA());
        expect(result.current).toBe(true);
    });

    it('should return true if navigator.standalone is true (iOS Safari)', () => {
        Object.defineProperty(window.navigator, 'standalone', {
            value: true,
        });

        const { result } = renderHook(() => useIsPWA());
        expect(result.current).toBe(true);
    });

    it('should add and remove event listeners for display-mode changes', () => {
        const { unmount } = renderHook(() => useIsPWA());
        
        expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
        
        unmount();
        
        expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });
});
