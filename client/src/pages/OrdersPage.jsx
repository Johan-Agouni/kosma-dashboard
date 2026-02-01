import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdersApi } from '../api/orders.api';
import Header from '../components/layout/Header';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import { TableSkeleton } from '../components/common/Skeleton';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import styles from '../styles/dashboard.module.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20, order: 'desc' };
            if (statusFilter) params.status = statusFilter;
            const { data } = await getOrdersApi(params);
            setOrders(data.data);
            setPagination(data.pagination);
        } catch {
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header title="Commandes" />
            <div className={styles.content}>
                <div className="page-header">
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
                        {Object.entries(ORDER_STATUSES).map(([key, val]) => (
                            <option key={key} value={key}>
                                {val.label}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <TableSkeleton columns={7} rows={8} />
                ) : (
                    <div className="card">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Numero</th>
                                    <th>Client</th>
                                    <th>Total</th>
                                    <th>Paiement</th>
                                    <th>Statut</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr
                                        key={order._id}
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className={styles.orderNum}>{order.orderNumber}</td>
                                        <td>{order.customer?.name}</td>
                                        <td>{formatCurrency(order.total)}</td>
                                        <td>{PAYMENT_METHODS[order.paymentMethod]}</td>
                                        <td>
                                            <StatusBadge
                                                status={order.status}
                                                statusMap={ORDER_STATUSES}
                                            />
                                        </td>
                                        <td className={styles.dateCell}>
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    navigate(`/orders/${order._id}`);
                                                }}
                                                title="Voir le détail"
                                                style={{
                                                    background: 'none',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    padding: '0.4rem 0.6rem',
                                                    cursor: 'pointer',
                                                    color: 'var(--color-text-secondary)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                    fontSize: 'var(--font-size-sm)',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor =
                                                        'var(--color-accent)';
                                                    e.currentTarget.style.color =
                                                        'var(--color-accent)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor =
                                                        'var(--color-border)';
                                                    e.currentTarget.style.color =
                                                        'var(--color-text-secondary)';
                                                }}
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                                Voir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: 'center',
                                                padding: '2rem',
                                                color: 'var(--color-text-muted)',
                                            }}
                                        >
                                            Aucune commande
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

export default OrdersPage;
