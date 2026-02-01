import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Overlay mobile — ferme la sidebar quand on clique a cote */}
            {sidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <main className={styles.main}>
                {/* Bouton hamburger — visible uniquement sur mobile */}
                <button
                    className={styles.menuBtn}
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Ouvrir le menu de navigation"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        width={22}
                        height={22}
                    >
                        <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
