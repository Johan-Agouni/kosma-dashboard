import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../src/components/common/Button';

describe('Button', () => {
    test('renders children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    test('calls onClick handler', () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click</Button>);
        fireEvent.click(screen.getByText('Click'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('is disabled when loading', () => {
        render(<Button loading>Loading</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    test('is disabled when disabled prop', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
