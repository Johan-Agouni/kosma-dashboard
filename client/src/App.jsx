/**
 * Point d'entree de l'app React — routing et providers.
 *
 * Architecture :
 *   ThemeProvider (dark/light)
 *     └─ AuthProvider (JWT + user state)
 *         └─ BrowserRouter
 *             ├─ /login, /register (publics)
 *             └─ ProtectedRoute > DashboardLayout (authentifie)
 *                 ├─ / (dashboard)
 *                 ├─ /products, /orders, /customers, /categories
 *                 └─ /settings
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductEditPage from './pages/ProductEditPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomersPage from './pages/CustomersPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: 'var(--color-bg-card)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)',
                            },
                        }}
                    />
                    <Routes>
                        {/* Routes publiques */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Routes protegees — redirige vers /login si non authentifie */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<DashboardPage />} />
                            <Route path="products" element={<ProductsPage />} />
                            <Route path="products/new" element={<ProductEditPage />} />
                            <Route path="products/:id/edit" element={<ProductEditPage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="orders/:id" element={<OrderDetailPage />} />
                            <Route path="customers" element={<CustomersPage />} />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
