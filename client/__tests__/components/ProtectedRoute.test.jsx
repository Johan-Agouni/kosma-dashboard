import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

const renderWithAuth = (authState, children) => {
    return render(
        <AuthContext.Provider value={authState}>
            <MemoryRouter>
                <ProtectedRoute>{children}</ProtectedRoute>
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe('ProtectedRoute', () => {
    test('shows loading spinner when loading', () => {
        renderWithAuth({ isAuthenticated: false, isLoading: true, user: null }, <div>Protected</div>);
        expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    });

    test('renders children when authenticated', () => {
        renderWithAuth(
            { isAuthenticated: true, isLoading: false, user: { role: 'admin' } },
            <div>Protected Content</div>
        );
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('redirects when not authenticated', () => {
        renderWithAuth(
            { isAuthenticated: false, isLoading: false, user: null },
            <div>Protected</div>
        );
        expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    });
});
