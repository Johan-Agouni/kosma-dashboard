import { render, screen } from '@testing-library/react';
import StatusBadge from '../../src/components/common/StatusBadge';

const statusMap = {
    active: { label: 'Actif', color: 'green' },
    draft: { label: 'Brouillon', color: 'yellow' },
};

describe('StatusBadge', () => {
    test('renders correct label', () => {
        render(<StatusBadge status="active" statusMap={statusMap} />);
        expect(screen.getByText('Actif')).toBeInTheDocument();
    });

    test('renders unknown status as-is', () => {
        render(<StatusBadge status="unknown" statusMap={statusMap} />);
        expect(screen.getByText('unknown')).toBeInTheDocument();
    });
});
