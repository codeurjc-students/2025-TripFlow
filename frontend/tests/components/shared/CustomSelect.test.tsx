import { render, screen, fireEvent } from '@testing-library/react';
import CustomSelect from '../../../src/components/shared/CustomSelect';
import { vi, describe, it, expect } from 'vitest';

describe('CustomSelect', () => {
    const options = [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' }
    ];

    it('renders with placeholder', () => {
        render(<CustomSelect value="" onChange={() => {}} options={options} placeholder="Select an option" />);
        expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('renders with selected option label', () => {
        render(<CustomSelect value="opt2" onChange={() => {}} options={options} />);
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('changes value when option is clicked', () => {
        const onChange = vi.fn();
        render(<CustomSelect value="" onChange={onChange} options={options} />);
        
        // Open the menu
        const button = screen.getByRole('button');
        fireEvent.click(button);
        
        // Click option 1
        fireEvent.click(screen.getByText('Option 1'));
        expect(onChange).toHaveBeenCalledWith('opt1');
    });
});
