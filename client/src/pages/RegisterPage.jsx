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
            toast.success('Compte cree avec succes');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la creation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>K</span>
                    <h1>Kosma</h1>
                </div>
                <p className={styles.subtitle}>Creer votre compte</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="firstName">Prenom</label>
                            <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="lastName">Nom</label>
                            <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="password">Mot de passe</label>
                        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} minLength={8} required />
                        <small>Min. 8 caracteres, 1 majuscule, 1 chiffre</small>
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Creation...' : 'Creer mon compte'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Deja un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
