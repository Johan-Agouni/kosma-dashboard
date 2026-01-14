import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';
import styles from './Header.module.css';

const Header = ({ title }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className={styles.header} role="banner">
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.actions}>
                <button
                    className={styles.themeToggle}
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                >
                    {theme === 'dark' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                    )}
                </button>

                <div className={styles.profile}>
                    <button
                        className={styles.profileBtn}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu utilisateur"
                        aria-expanded={menuOpen}
                        aria-haspopup="true"
                    >
                        <div className={styles.avatar} aria-hidden="true">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <span className={styles.userName}>{user?.firstName}</span>
                    </button>
                    {menuOpen && (
                        <div className={styles.dropdown} role="menu">
                            <div className={styles.dropdownHeader}>
                                <strong>{user?.firstName} {user?.lastName}</strong>
                                <span>{user?.email}</span>
                            </div>
                            <button role="menuitem" onClick={() => { navigate('/settings'); setMenuOpen(false); }}>
                                Parametres
                            </button>
                            <button role="menuitem" onClick={handleLogout}>Deconnexion</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
