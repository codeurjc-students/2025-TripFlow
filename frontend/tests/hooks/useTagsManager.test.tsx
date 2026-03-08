import { renderHook, act } from '@testing-library/react';
import { useTagsManager } from '../../src/hooks/useTagsManager';
import { vi, describe, it, expect } from 'vitest';

describe('useTagsManager', () => {
    it('should initialize with empty newTag', () => {
        const onTagsChange = vi.fn();
        const { result } = renderHook(() => useTagsManager([], onTagsChange));

        expect(result.current.newTag).toBe('');
    });

    it('should update newTag correctly', () => {
        const onTagsChange = vi.fn();
        const { result } = renderHook(() => useTagsManager([], onTagsChange));

        act(() => {
            result.current.setNewTag('beach');
        });

        expect(result.current.newTag).toBe('beach');
    });

    it('should add a new tag and clear input', () => {
        const onTagsChange = vi.fn();
        const { result } = renderHook(() => useTagsManager(['city'], onTagsChange));

        act(() => {
            result.current.setNewTag('beach');
        });

        act(() => {
            result.current.handleAddTag();
        });

        expect(onTagsChange).toHaveBeenCalledWith(['city', 'beach']);
        expect(result.current.newTag).toBe('');
    });

    it('should not add an empty tag or existing tag', () => {
        const onTagsChange = vi.fn();
        const { result } = renderHook(() => useTagsManager(['city'], onTagsChange));

        act(() => {
            result.current.setNewTag('  ');
        });

        act(() => {
            result.current.handleAddTag();
        });

        expect(onTagsChange).not.toHaveBeenCalled();

        act(() => {
            result.current.setNewTag('city');
        });

        act(() => {
            result.current.handleAddTag();
        });

        expect(onTagsChange).not.toHaveBeenCalled();
    });

    it('should remove a tag', () => {
        const onTagsChange = vi.fn();
        const { result } = renderHook(() => useTagsManager(['city', 'beach'], onTagsChange));

        act(() => {
            result.current.handleRemoveTag('city');
        });

        expect(onTagsChange).toHaveBeenCalledWith(['beach']);
    });

    it('should add tag on Enter key press', () => {
        const onTagsChange = vi.fn();
        const { result } = renderHook(() => useTagsManager([], onTagsChange));

        act(() => {
            result.current.setNewTag('mountain');
        });

        const preventDefault = vi.fn();
        act(() => {
            result.current.handleTagKeyPress({ key: 'Enter', preventDefault } as any);
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(onTagsChange).toHaveBeenCalledWith(['mountain']);
        expect(result.current.newTag).toBe('');
    });

    it('should ignore other key presses', () => {
        const onTagsChange = vi.fn();
        const { result } = renderHook(() => useTagsManager([], onTagsChange));

        act(() => {
            result.current.setNewTag('mountain');
        });

        const preventDefault = vi.fn();
        act(() => {
            result.current.handleTagKeyPress({ key: 'Escape', preventDefault } as any);
        });

        expect(preventDefault).not.toHaveBeenCalled();
        expect(onTagsChange).not.toHaveBeenCalled();
    });
});
