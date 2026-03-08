import { render, screen, fireEvent } from '@testing-library/react';
import ContextMenu from '../../../src/components/shared/ContextMenu';
import { vi, describe, it, expect } from 'vitest';

describe('ContextMenu', () => {
    it('renders without crashing', () => {
        render(<ContextMenu items={[]} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('opens menu and displays items when clicked', () => {
        const onClick = vi.fn();
        const items = [{ label: 'Option 1', onClick }];
        
        render(<ContextMenu items={items} />);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);
        
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        
        // click option
        fireEvent.click(screen.getByText('Option 1'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
