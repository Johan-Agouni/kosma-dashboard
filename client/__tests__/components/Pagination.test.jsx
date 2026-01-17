import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../../src/components/common/Pagination';

describe('Pagination', () => {
    const pagination = { page: 2, pages: 5, total: 100, limit: 20 };

    test('renders page numbers', () => {
        render(<Pagination pagination={pagination} onPageChange={() => {}} />);
        expect(screen.getByText('100 resultats')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('calls onPageChange when clicking a page', () => {
        const onPageChange = vi.fn();
        render(<Pagination pagination={pagination} onPageChange={onPageChange} />);
        fireEvent.click(screen.getByText('3'));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    test('renders nothing when single page', () => {
        const { container } = render(
            <Pagination pagination={{ page: 1, pages: 1, total: 5, limit: 20 }} onPageChange={() => {}} />
        );
        expect(container.firstChild).toBeNull();
    });
});
