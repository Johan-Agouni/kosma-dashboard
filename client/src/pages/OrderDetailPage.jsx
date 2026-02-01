import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderApi, updateOrderStatusApi, addOrderNoteApi } from '../api/orders.api';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../utils/constants';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';

const VALID_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const { hasRole } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await getOrderApi(id);
            setOrder(data.data);
        } catch {
            toast.error('Commande introuvable');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async newStatus => {
        try {
            await updateOrderStatusApi(id, { status: newStatus });
            toast.success(`Statut change: ${ORDER_STATUSES[newStatus].label}`);
            fetchOrder();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const handleAddNote = async e => {
        e.preventDefault();
        if (!note.trim()) return;
        try {
            await addOrderNoteApi(id, { content: note });
            toast.success('Note ajoutee');
            setNote('');
            fetchOrder();
        } catch {
            toast.error('Erreur');
        }
    };

    if (loading) return <LoadingSpinner fullPage />;
    if (!order) return <div>Commande introuvable</div>;

    const transitions = VALID_TRANSITIONS[order.status] || [];

    return (
        <div>
            <Header title={`Commande ${order.orderNumber}`} />
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: 'var(--spacing-xl)',
                    marginTop: 'var(--spacing-xl)',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Articles</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '0.5rem',
                                            borderBottom: '1px solid var(--color-border)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        Produit
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '0.5rem',
                                            borderBottom: '1px solid var(--color-border)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        Prix
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '0.5rem',
                                            borderBottom: '1px solid var(--color-border)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        Qte
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '0.5rem',
                                            borderBottom: '1px solid var(--color-border)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, i) => (
                                    <tr key={i}>
                                        <td
                                            style={{
                                                padding: '0.75rem 0.5rem',
                                                fontSize: 'var(--font-size-sm)',
                                            }}
                                        >
                                            {item.name}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'right',
                                                padding: '0.75rem 0.5rem',
                                                fontSize: 'var(--font-size-sm)',
                                            }}
                                        >
                                            {formatCurrency(item.price)}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'right',
                                                padding: '0.75rem 0.5rem',
                                                fontSize: 'var(--font-size-sm)',
                                            }}
                                        >
                                            {item.quantity}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'right',
                                                padding: '0.75rem 0.5rem',
                                                fontSize: 'var(--font-size-sm)',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {formatCurrency(item.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td
                                        colSpan={3}
                                        style={{
                                            textAlign: 'right',
                                            padding: '0.5rem',
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        Sous-total
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                                        {formatCurrency(order.subtotal)}
                                    </td>
                                </tr>
                                <tr>
                                    <td
                                        colSpan={3}
                                        style={{
                                            textAlign: 'right',
                                            padding: '0.5rem',
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        TVA
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                                        {formatCurrency(order.tax)}
                                    </td>
                                </tr>
                                <tr>
                                    <td
                                        colSpan={3}
                                        style={{
                                            textAlign: 'right',
                                            padding: '0.5rem',
                                            fontWeight: 700,
                                            fontSize: 'var(--font-size-base)',
                                        }}
                                    >
                                        Total
                                    </td>
                                    <td
                                        style={{
                                            textAlign: 'right',
                                            padding: '0.5rem',
                                            fontWeight: 700,
                                            fontSize: 'var(--font-size-base)',
                                        }}
                                    >
                                        {formatCurrency(order.total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Timeline</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {order.statusHistory?.map((entry, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background:
                                                ORDER_STATUSES[entry.status]?.color ||
                                                'var(--color-text-muted)',
                                            marginTop: 6,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <div>
                                        <StatusBadge
                                            status={entry.status}
                                            statusMap={ORDER_STATUSES}
                                        />
                                        <p
                                            style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-text-muted)',
                                                marginTop: 4,
                                            }}
                                        >
                                            {formatDateTime(entry.changedAt)}
                                        </p>
                                        {entry.note && (
                                            <p
                                                style={{
                                                    fontSize: 'var(--font-size-sm)',
                                                    marginTop: 4,
                                                }}
                                            >
                                                {entry.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {hasRole('admin', 'manager') && (
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Ajouter une note</h3>
                            <form
                                onSubmit={handleAddNote}
                                style={{ display: 'flex', gap: '0.75rem' }}
                            >
                                <input
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Note interne..."
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--color-bg-input)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                />
                                <Button type="submit" size="sm">
                                    Ajouter
                                </Button>
                            </form>
                            {order.notes?.length > 0 && (
                                <div
                                    style={{
                                        marginTop: 'var(--spacing-md)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                    }}
                                >
                                    {order.notes.map((n, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'var(--color-bg-hover)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: 'var(--font-size-sm)',
                                            }}
                                        >
                                            <p>{n.content}</p>
                                            <p
                                                style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--color-text-muted)',
                                                    marginTop: 4,
                                                }}
                                            >
                                                {formatDateTime(n.createdAt)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Statut</h3>
                        <StatusBadge status={order.status} statusMap={ORDER_STATUSES} />
                        {hasRole('admin', 'manager') && transitions.length > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    marginTop: 'var(--spacing-md)',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {transitions.map(s => (
                                    <Button
                                        key={s}
                                        size="sm"
                                        variant={s === 'cancelled' ? 'danger' : 'primary'}
                                        onClick={() => handleStatusChange(s)}
                                    >
                                        {ORDER_STATUSES[s].label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Client</h3>
                        <p style={{ fontWeight: 500 }}>{order.customer?.name}</p>
                        <p
                            style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                            }}
                        >
                            {order.customer?.email}
                        </p>
                        {order.customer?.phone && (
                            <p
                                style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                {order.customer.phone}
                            </p>
                        )}
                        {order.customer?.address && (
                            <div
                                style={{
                                    marginTop: 'var(--spacing-sm)',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                <p>{order.customer.address.street}</p>
                                <p>
                                    {order.customer.address.zipCode} {order.customer.address.city}
                                </p>
                                <p>{order.customer.address.country}</p>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Paiement</h3>
                        <p style={{ fontSize: 'var(--font-size-sm)' }}>
                            {PAYMENT_METHODS[order.paymentMethod]}
                        </p>
                        <StatusBadge
                            status={order.paymentStatus}
                            statusMap={{
                                pending: { label: 'En attente', color: 'var(--color-warning)' },
                                paid: { label: 'Paye', color: 'var(--color-success)' },
                                refunded: { label: 'Rembourse', color: 'var(--color-danger)' },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
