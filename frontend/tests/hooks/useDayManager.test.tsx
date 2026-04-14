import { renderHook, act } from '@testing-library/react';
import { useDayManager } from '../../src/hooks/useDayManager';
import { vi, describe, it, expect } from 'vitest';
import type { ItineraryDay } from '../../src/types/itinerary';

describe('useDayManager', () => {
    it('should add a new day correctly', () => {
        const onDaysChange = vi.fn();
        const initialDays: ItineraryDay[] = [
            { day: 1, activities: [] }
        ];

        const { result } = renderHook(() => useDayManager(initialDays, onDaysChange));

        act(() => {
            result.current.handleAddNewDay();
        });

        expect(onDaysChange).toHaveBeenCalledWith([
            { day: 1, activities: [] },
            { day: 2, activities: [] }
        ]);
    });

    it('should add the first day correctly when days array is empty', () => {
        const onDaysChange = vi.fn();
        const initialDays: ItineraryDay[] = [];

        const { result } = renderHook(() => useDayManager(initialDays, onDaysChange));

        act(() => {
            result.current.handleAddNewDay();
        });

        expect(onDaysChange).toHaveBeenCalledWith([
            { day: 1, activities: [] }
        ]);
    });
});
