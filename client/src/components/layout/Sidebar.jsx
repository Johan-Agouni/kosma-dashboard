import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

const navItems = [
    {
        path: '/',
        label: 'Dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4',
    },
    {
        path: '/products',
        label: 'Produits',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
        path: '/orders',
        label: 'Commandes',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
        path: '/customers',
        label: 'Clients',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
        path: '/categories',
        label: 'Categories',
        icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
        roles: ['admin'],
    },
    {
        path: '/settings',
        label: 'Parametres',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
];

const Sidebar = ({ open, onClose }) => {
    const { user } = useAuth();

    const filteredItems = navItems.filter(item => !item.roles || item.roles.includes(user?.role));

    return (
        <aside
            className={`${styles.sidebar} ${open ? styles.open : ''}`}
            role="navigation"
            aria-label="Navigation principale"
        >
            <div className={styles.logo}>
                <span className={styles.logoIcon} aria-hidden="true">
                    <svg viewBox="0 0 100 100" width="22" height="22">
                        <path
                            d="M20 15 L20 85"
                            stroke="currentColor"
                            strokeWidth="14"
                            strokeLinecap="round"
                        />
                        <path
                            d="M20 52 L50 85"
                            stroke="currentColor"
                            strokeWidth="14"
                            strokeLinecap="round"
                        />
                        <path
                            d="M20 52 L65 15"
                            stroke="currentColor"
                            strokeWidth="14"
                            strokeLinecap="round"
                        />
                        <polygon points="65,15 72,32 56,27" fill="currentColor" />
                    </svg>
                </span>
                <span className={styles.logoText}>Kosma</span>
            </div>
            <nav className={styles.nav} aria-label="Menu principal">
                {filteredItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.active : ''}`
                        }
                        onClick={onClose}
                        aria-label={item.label}
                    >
                        <svg
                            className={styles.navIcon}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            width={20}
                            height={20}
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
