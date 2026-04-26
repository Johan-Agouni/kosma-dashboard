import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import styles from '../styles/auth.module.css';

const RegisterPage = () => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('Compte créé avec succès');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la création');
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
                    <h1>Kosma</h1>
                </div>
                <p className={styles.subtitle}>Créer votre compte</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.field} style={{ minWidth: 0 }}>
                            <label htmlFor="firstName">Prénom</label>
                            <input
                                id="firstName"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field} style={{ minWidth: 0 }}>
                            <label htmlFor="lastName">Nom</label>
                            <input
                                id="lastName"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            minLength={8}
                            required
                        />
                        <small>Min. 8 caractères, 1 majuscule, 1 chiffre</small>
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Création...' : 'Créer mon compte'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;