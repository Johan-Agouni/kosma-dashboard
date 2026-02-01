import { useState, useEffect } from 'react';
import { getCustomersApi } from '../api/customers.api';
import { useDebounce } from '../hooks/useDebounce';
import Header from '../components/layout/Header';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import { TableSkeleton } from '../components/common/Skeleton';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import styles from '../styles/dashboard.module.css';

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search);

    useEffect(() => {
        fetchCustomers();
    }, [page, debouncedSearch]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (debouncedSearch) params.search = debouncedSearch;
            const { data } = await getCustomersApi(params);
            setCustomers(data.data);
            setPagination(data.pagination);
        } catch {
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header title="Clients" />
            <div className={styles.content}>
                <div className="page-header">
                    <SearchBar
                        value={search}
                        onChange={v => {
                            setSearch(v);
                            setPage(1);
                        }}
                        placeholder="Rechercher un client..."
                    />
                </div>

                {loading ? (
                    <TableSkeleton columns={5} rows={8} />
                ) : (
                    <div className="card">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Email</th>
                                    <th>Commandes</th>
                                    <th>Total depense</th>
                                    <th>Derniere commande</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(c => (
                                    <tr key={c._id}>
                                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>
                                            {c.email}
                                        </td>
                                        <td>{c.totalOrders}</td>
                                        <td style={{ fontWeight: 500 }}>
                                            {formatCurrency(c.totalSpent)}
                                        </td>
                                        <td className={styles.dateCell}>
                                            {formatDate(c.lastOrderDate)}
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{
                                                textAlign: 'center',
                                                padding: '2rem',
                                                color: 'var(--color-text-muted)',
                                            }}
                                        >
                                            Aucun client trouve
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

export default CustomersPage;
