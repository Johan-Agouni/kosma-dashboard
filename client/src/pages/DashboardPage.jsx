/**
 * Page Dashboard — vue d'ensemble de l'activite Kosma.
 *
 * Affiche 4 StatsCards (revenu, commandes, produits, stock bas),
 * un graphique de revenus sur 12 mois (LineChart), un classement
 * des 5 meilleurs produits (BarChart), et un tableau des dernieres
 * commandes. Toutes les donnees sont chargees en parallele au montage.
 */
import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';
import {
    getStatsApi,
    getRevenueApi,
    getTopProductsApi,
    getRecentOrdersApi,
} from '../api/dashboard.api';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import StatsCard from '../components/charts/StatsCard';
import StatusBadge from '../components/common/StatusBadge';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { ORDER_STATUSES } from '../utils/constants';
import { formatCurrency, formatRelative } from '../utils/formatters';
import styles from '../styles/dashboard.module.css';

// Palette Recharts — amber en premier pour la coherence avec le theme
const CHART_COLORS = ['#e8913a', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'];

// Mois abreges en francais
const MONTHS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Chargement initial : 4 appels API en parallele
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, revenueRes, topRes, ordersRes] = await Promise.all([
                    getStatsApi(),
                    getRevenueApi(12),
                    getTopProductsApi(5),
                    getRecentOrdersApi(5),
                ]);
                setStats(statsRes.data.data);
                setRevenue(
                    revenueRes.data.data.map(r => ({
                        name: MONTHS[r._id.month - 1],
                        revenue: r.revenue,
                        orders: r.count,
                    }))
                );
                setTopProducts(topRes.data.data);
                setRecentOrders(ordersRes.data.data);
            } catch {
                // Gere par l'interceptor Axios (toast d'erreur global)
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading)
        return (
            <div>
                <Header title={`Bonjour, ${user?.firstName || '...'}`} />
                <div className={styles.content}>
                    <DashboardSkeleton />
                </div>
            </div>
        );

    return (
        <div>
            <Header title={`Bonjour, ${user?.firstName}`} />
            <div className={styles.content}>
                {/* KPIs principaux */}
                <div className="grid-4">
                    <StatsCard
                        title="Revenu du mois"
                        value={formatCurrency(stats?.revenue?.month || 0)}
                        color="var(--color-success)"
                        icon={
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                width={24}
                                height={24}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Commandes"
                        value={stats?.orders?.total || 0}
                        color="var(--color-info)"
                        icon={
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                width={24}
                                height={24}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                                />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Produits actifs"
                        value={stats?.products?.active || 0}
                        color="var(--color-accent)"
                        icon={
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                width={24}
                                height={24}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Stock bas"
                        value={stats?.products?.lowStock || 0}
                        color="var(--color-danger)"
                        icon={
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                width={24}
                                height={24}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                                />
                            </svg>
                        }
                    />
                </div>

                {/* Graphiques revenus + top produits */}
                <div className="grid-2">
                    <div className="card">
                        <h3 className={styles.chartTitle}>Revenus (12 mois)</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={revenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--color-text-muted)"
                                    fontSize={12}
                                />
                                <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 8,
                                    }}
                                    labelStyle={{ color: 'var(--color-text-primary)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--color-accent)"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card">
                        <h3 className={styles.chartTitle}>Top 5 produits</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    type="number"
                                    stroke="var(--color-text-muted)"
                                    fontSize={12}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={120}
                                    stroke="var(--color-text-muted)"
                                    fontSize={11}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 8,
                                    }}
                                />
                                <Bar
                                    dataKey="totalRevenue"
                                    fill="var(--color-accent)"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Dernieres commandes */}
                <div className="card">
                    <h3 className={styles.chartTitle}>Commandes recentes</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Commande</th>
                                <th>Client</th>
                                <th>Total</th>
                                <th>Statut</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order._id}>
                                    <td className={styles.orderNum}>{order.orderNumber}</td>
                                    <td>{order.customer?.name}</td>
                                    <td>{formatCurrency(order.total)}</td>
                                    <td>
                                        <StatusBadge
                                            status={order.status}
                                            statusMap={ORDER_STATUSES}
                                        />
                                    </td>
                                    <td className={styles.dateCell}>
                                        {formatRelative(order.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
