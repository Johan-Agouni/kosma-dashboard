/**
 * Page Produits — liste paginee avec recherche et filtres.
 *
 * La recherche est debouncee (300ms) pour eviter de spammer l'API.
 * Les actions (modifier, supprimer) sont conditionnees par le role
 * de l'utilisateur : admin voit tout, manager peut editer, viewer
 * ne voit que la liste en lecture seule.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsApi, deleteProductApi } from '../api/products.api';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import Header from '../components/layout/Header';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import { TableSkeleton } from '../components/common/Skeleton';
import { PRODUCT_STATUSES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import styles from '../styles/dashboard.module.css';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const debouncedSearch = useDebounce(search);
    const { hasRole } = useAuth();
    const navigate = useNavigate();

    // Re-fetch quand la page, la recherche ou le filtre change
    useEffect(() => {
        fetchProducts();
    }, [page, debouncedSearch, statusFilter]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter) params.status = statusFilter;
            const { data } = await getProductsApi(params);
            setProducts(data.data);
            setPagination(data.pagination);
        } catch {
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    // Soft-delete avec confirmation native du navigateur
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Supprimer "${name}" ?`)) return;
        try {
            await deleteProductApi(id);
            toast.success('Produit supprime');
            fetchProducts();
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div>
            <Header title="Produits" />
            <div className={styles.content}>
                {/* Barre de recherche + filtre statut + bouton creation */}
                <div className="page-header">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <SearchBar
                            value={search}
                            onChange={v => {
                                setSearch(v);
                                setPage(1);
                            }}
                            placeholder="Rechercher un produit..."
                        />
                        <select
                            value={statusFilter}
                            onChange={e => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            style={{
                                padding: '0.5rem',
                                background: 'var(--color-bg-input)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: 'var(--font-size-sm)',
                            }}
                        >
                            <option value="">Tous les statuts</option>
                            <option value="active">Actif</option>
                            <option value="draft">Brouillon</option>
                            <option value="archived">Archive</option>
                        </select>
                    </div>
                    {hasRole('admin', 'manager') && (
                        <Button onClick={() => navigate('/products/new')}>+ Nouveau produit</Button>
                    )}
                </div>

                {loading ? (
                    <TableSkeleton columns={6} rows={8} />
                ) : (
                    <div className="card">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>SKU</th>
                                    <th>Prix</th>
                                    <th>Stock</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p._id}>
                                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                                        <td
                                            style={{
                                                color: 'var(--color-text-muted)',
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            {p.sku || '-'}
                                        </td>
                                        <td>{formatCurrency(p.price)}</td>
                                        <td
                                            style={{
                                                color:
                                                    p.stock <= (p.lowStockThreshold || 10)
                                                        ? 'var(--color-danger)'
                                                        : 'inherit',
                                            }}
                                        >
                                            {p.stock}
                                        </td>
                                        <td>
                                            <StatusBadge
                                                status={p.status}
                                                statusMap={PRODUCT_STATUSES}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {hasRole('admin', 'manager') && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            navigate(`/products/${p._id}/edit`)
                                                        }
                                                    >
                                                        Modifier
                                                    </Button>
                                                )}
                                                {hasRole('admin') && (
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleDelete(p._id, p.name)}
                                                    >
                                                        Supprimer
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            style={{
                                                textAlign: 'center',
                                                padding: '2rem',
                                                color: 'var(--color-text-muted)',
                                            }}
                                        >
                                            Aucun produit trouve
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <Pagination pagination={pagination} onPageChange={setPage} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;
