import { renderHook } from '@testing-library/react';
import { useClickOutside } from '../../src/hooks/useClickOutside';
import { vi, describe, it, expect } from 'vitest';

describe('useClickOutside', () => {
    it('should call handler when clicking outside', () => {
        const handler = vi.fn();
        const ref = { current: document.createElement('div') };
        document.body.appendChild(ref.current);

        renderHook(() => useClickOutside(ref, handler));

        // Click outside the ref
        document.dispatchEvent(new MouseEvent('mousedown'));
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not call handler when clicking inside', () => {
        const handler = vi.fn();
        const ref = { current: document.createElement('div') };
        const child = document.createElement('span');
        ref.current.appendChild(child);
        document.body.appendChild(ref.current);

        renderHook(() => useClickOutside(ref, handler));

        // Click inside the ref
        ref.current.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(handler).not.toHaveBeenCalled();
    });
});
