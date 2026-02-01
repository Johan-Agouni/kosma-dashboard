import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import styles from '../styles/auth.module.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Connexion reussie');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>
                        <svg viewBox="0 0 100 100" width="28" height="28">
                            <path d="M20 15 L20 85" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/>
                            <path d="M20 52 L50 85" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/>
                            <path d="M20 52 L65 15" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/>
                            <polygon points="65,15 72,32 56,27" fill="currentColor"/>
                        </svg>
                    </span>
                    <h1>Kosma</h1>
                </div>
                <p className={styles.subtitle}>Connectez-vous a votre dashboard</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@kosma.dev"
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Votre mot de passe"
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Pas de compte ? <Link to="/register">Creer un compte</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
